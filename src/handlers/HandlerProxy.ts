import {
  AnonymousFn,
  AnonymousFnHandler,
} from "@crookse/smart-weaver/esm/standard/handlers/AnonymousFnHandler";
import { Context } from "../types/Context";

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
