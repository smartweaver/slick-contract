import { InitialStateBuilder } from "./chains/InitialStateBuilder";
import { HandlerWithFunctionName } from "@crookse/smart-weaver/standard/handlers/HandlerWithFunctionName";

export type { Context as ContractContext } from "./types/Context.ts";

export class Contract {
  /**
   * Handler class that should be extended and used by users of the `Contract`.
   * To ensure this contract handles all handlers properly, handlers should be
   * of this handler type.
   */
  static readonly Handler = HandlerWithFunctionName;

  static builder() {
    return new InitialStateBuilder();
  }
}
