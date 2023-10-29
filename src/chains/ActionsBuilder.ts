import { HandlerWithFunctionName } from "@crookse/smart-weaver/standard/handlers/HandlerWithFunctionName";
import { IsolatedHandlerChain } from "@crookse/smart-weaver/standard/chains/IsolatedHandlerChain";
import { Handler } from "@crookse/smart-weaver/core/handlers/Handler";

import { HandlerProxy } from "../handlers/HandlerProxy";
import { Context } from "../types/Context";

type ChainMap<Fns> = Map<Fns, HandlerWithFunctionName>;
type ContractManager<Fns = string> = { contract: { actions: ChainMap<Fns> } };
type KeyValues<O = {}> = { [K in keyof O]: O[K] };
type ActionHandler = Handler | HandlerWithFunctionName;

/**
 * The first builder to building the `Contract` object.
 */
export class ActionsBuilder<S extends KeyValues<S>>
  extends IsolatedHandlerChain {
  protected contract_state: S;
  #functions: string[] = [];

  get functions() {
    return this.#functions;
  }

  constructor(state: S) {
    super();
    this.contract_state = state;
  }

  /**
   * Add an interaction handler to the contract. Interaction handlers evaluate
   * the `state` and `interaction` objects received from the network and can
   * modify the state based on the data sent in the `interaction` object.
   * @param fnName The name of the function the handler handles.
   * @param handler The interaction handler.
   * @returns This builder.
   */
  action(
    fn: ActionHandler | string,
    handler?: (
      context: Context<S> & ContractManager,
    ) => Context<S> | Promise<Context<S>>,
  ): this {
    if (typeof fn !== "string") {
      if (!("function_name" in fn)) {
        throw new Error(`Handler is missing 'function_name' property`);
      }

      if (!("handle" in fn)) {
        throw new Error(`Handler is missing 'handle()' method`);
      }

      // Pass this object back to this method to turn it into a `HandlerProxy`
      // instance
      return this.action(fn.function_name, function (context) {
        return fn.handle(context);
      });
    }

    if (this.#functions.includes(fn)) {
      throw new Error(
        `Duplicate action name "${fn}" provided in \`.action(...)\` call`,
      );
    }

    // If no handler class was provided as the first argument, then we expect to
    // receive a callback function (e.g., `(context) => context`) here. If it
    // does not exist, then we cannot make this contract.
    if (!handler) {
      throw new Error(
        `Cannot create an interaction handler without a handler function`,
      );
    }

    this.functions.push(fn);

    const wrappedHandler = new HandlerProxy(fn, handler);

    this.chain_builder.handler(wrappedHandler);

    return this;
  }

  /**
   * Build the contract that can handle state and interactions.
   *
   * @returns A `Contract` instance. Its only method is `handle()`, which should
   * be used to pass the `state` and `interaction` objects received from the
   * network. These objects should be wrapped in a single object known as the
   * `context` object in this library. See example.
   *
   * @example
   * ```ts
   * const contract = Contract.builder().build();
   *
   * export function handle(state, interaction) {
   *   return contract
   *     .handle({ state, interaction }) // Put the `state` and `interaction` into a single object. This will be the `context` object.
   *     .then((context) => {
   *       return { state: context.state };
   *     })
   *     .catch((e) => {
   *       throw new ContractError(e.message ?? "We hit an error");
   *     });
   * }
   * ```
   */
  build<HandleMethodContext = { state: S; action: any }>() {
    const functions = this.functions;
    const chain = this.chain_builder.build();

    // TODO(crookse) Create a class
    const handler = {
      functions,
      handle: <R = { state: S }>(context: HandleMethodContext): Promise<R> => {
        return Promise
          .resolve()
          .then(() => validateContext(context, functions))
          .then((validContext) => {
            this.#addContractManager(
              {
                actions: chain,
              },
              validContext,
            );

            const fn = validContext.action.input.function;

            if (chain.has(fn)) {
              return chain.get(fn)!.handle(validContext);
            }

            throw new Error(`Unknown function '${fn}' provided`);
          })
          .then((returnedContext) => returnedContext);
      },
    };

    return handler;
  }

  /**
   * Add the chain map to the context so it can be used by the handlers.
   * Handlers could delegate work to other handlers if needed, but they cannot
   * do so if they are provided as anonymous functions. There is no `this`
   * context in annoymous function handlers, so we add the chain map as a way
   * for handlers to access other handlers to delegate work if needed. This
   * looks like:
   *
   * ```js
   *   function handler(context) {
   *     const { contract, action } = context;
   *
   *     const tasks = Promise
   *       .resolve()
   *       .then(() => contract.actions.get("step_1_handler")?.handle(context))
   *       .then(() => contract.actions.get("step_2_handler")?.handle(context))
   *
   *     if (action.input.payload.includes("step_3")) {
   *       tasks.then(() => contract.actions.get("step_3_handler".handle(context));
   *     }
   *
   *     return tasks;
   *   }
   * ```
   *
   * The use case for this is a single handler that serves as a proxy to
   * multiple handlers that does its work. For exmaple:
   *
   * ```text
   * incoming action === "build_car"
   *   |
   *   +--> build_car handler
   *   |      +--> call build_wheels handler
   *   |      +--> call build_doors handler
   *   |      +--> call add_tires handler
   *   |
   *   +--> return result back to caller
   * ```
   */
  #addContractManager(
    contractMembers: {
      [K in keyof ContractManager["contract"]]: ContractManager["contract"][K];
    },
    context: Context,
  ) {
    Object.defineProperty(context, "contract", {
      value: contractMembers,
      configurable: false,
      writable: false,
    });

    return context;
  }
}

/**
 * @param context The context in question.
 * @param functions The list of functions the context is allowed to access.
 * @returns The context as a typed object.
 */
function validateContext(
  context: unknown,
  functions: string[],
): Promise<Context> {
  return Promise
    .resolve()
    .then(() => validateContextShape(context))
    .then((validContext) => {
      if (!functions || !functions.length) {
        throw new Error(`Contract does not have functions defined`);
      }

      const incomingFunction = validContext.action.input.function;

      if (!functions.includes(incomingFunction)) {
        throw new Error(`Unknown function '${incomingFunction}' provided`);
      }

      return validContext;
    });
}

/**
 * Validate that the given `context` is in a shape expected by contracts.
 * @param context The context in question.
 */
function validateContextShape(context: unknown): Context {
  if (!context) {
    throw new Error(`Unexpected missing \`context\` object`);
  }

  if (
    typeof context !== "object"
  ) {
    throw new Error(`Argument 'context' should be an object`);
  }

  if (
    !("state" in context) ||
    !context.state
  ) {
    throw new Error(
      `Field 'context.state' is required`,
    );
  }

  if (
    !("action" in context) ||
    !context.action ||
    (typeof context.action !== "object")
  ) {
    throw new Error(
      `Field 'context.action' should be an object`,
    );
  }

  if (
    !("input" in context.action) ||
    !context.action.input ||
    (typeof context.action.input !== "object")
  ) {
    throw new Error(
      `Field 'context.action.input' should be an object`,
    );
  }

  if (
    !("function" in context.action.input) ||
    !context.action.input.function ||
    (typeof context.action.input.function !== "string")
  ) {
    throw new Error(
      `Field 'context.action.input.function' should be a string`,
    );
  }

  return context as Context;
}
