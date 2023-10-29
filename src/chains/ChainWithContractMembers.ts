import { HandlerWithFunctionName } from "@crookse/smart-weaver/esm/standard/handlers/HandlerWithFunctionName";
import { IsolatedHandlerChain } from "@crookse/smart-weaver/esm/standard/chains/IsolatedHandlerChain";
import { HandlerProxy } from "../handlers/HandlerProxy";
import { Context } from "../types/Context";
import { Handler } from "@crookse/smart-weaver/esm/core/handlers/Handler";

type KeyValues<O = {}> = { [K in keyof O]: O[K] };

type ActionHandler = Handler | HandlerWithFunctionName;

/**
 * The builder for the `Contract` object.
 */
export class ChainWithContractMembers<
  S extends KeyValues<S>,
> extends IsolatedHandlerChain {
  // TODO(crookse) Implement. Currently used for type inferrence.
  protected contract_state: S | {};
  #functions: string[] = [];

  get functions() {
    return this.#functions;
  }

  constructor(state?: S) {
    super();
    this.contract_state = state || {};
  }

  /**
   * Set the contract's initial state.
   * @param initialState The contract's initial state.
   * @returns This builder for further method chaining.
   */
  initialState<S>(
    initialState: KeyValues<S>,
  ): ChainWithContractMembers<S> {
    // TODO(crookse) Infer without instantiating a new object
    return new ChainWithContractMembers<S>(initialState);
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
      context: Context<S>,
    ) => Context<S> | Promise<Context<S>>,
  ): ChainWithContractMembers<S> {
    if (typeof fn !== "string") {
      if (!("function_name" in fn)) {
        throw new Error(`Handler is missing 'function_name' property`);
      }

      if (!("handle" in fn)) {
        throw new Error(`Handler is missing 'handle()' method`);
      }

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
    const firstHandler = super.build();

    return {
      functions,
      handle: <R = { state: S }>(context: HandleMethodContext): Promise<R> => {
        return Promise
          .resolve()
          .then(() => validateContext(context, functions))
          // @ts-ignore Context objects don't match
          .then(() => firstHandler.handle(context))
          .then((returnedContext) => returnedContext);
      },
    };
  }
}

function validateContext(context: unknown, functions: string[]) {
  return Promise
    .resolve()
    .then(() => validateContextShape(context))
    .then((validatedContext) => {
      if (!functions || !functions.length) {
        throw new Error(`Contract does not have functions defined`);
      }

      const incomingFunction = validatedContext.action.input.function;

      if (!functions.includes(incomingFunction)) {
        throw new Error(`Unknown function '${incomingFunction}' provided`);
      }

      return context;
    });
}

/**
 * Validate that the given `context` is in a shape expected by contracts.
 * @param context The context in question.
 */
function validateContextShape(context: unknown) {
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
