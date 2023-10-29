import {
  AnonymousFn,
  AnonymousFnHandler,
} from "@crookse/smart-weaver/standard/handlers/AnonymousFnHandler";
import { Context } from "../types/Context";

/**
 * This class stands in front of a handler function -- ensuring the handle
 * function can only be called if the `context` object specifically requests to
 * use the handler function. The `context` object makes the request to use the
 * handler function if its `action.input.function` value matches the handler
 * function's associated `function_name`.
 */
export class HandlerProxy extends AnonymousFnHandler {
  readonly function_name;
  readonly metadata;

  constructor(fn: string, handleFn: AnonymousFn) {
    super(handleFn);
    this.function_name = fn;
    this.metadata = {
      name: `__HandlerProxy__${fn}`,
    };
  }

  /**
   * @param context
   * @returns
   */
  handle(context: Context) {
    return Promise
      .resolve()
      .then(() => {
        const incomingFn = context.action.input.function;

        if (incomingFn !== this.function_name) {
          return context;
        }

        return super.handle(context);
      });
  }
}
