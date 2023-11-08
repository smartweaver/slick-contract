import { InitialStateBuilder } from "./chains/InitialStateBuilder.ts";
import { HandlerWithFunctionName } from "./deps.ts";

export type { Context as ContractContext } from "./types/Context.ts";

export class Contract {
  /**
   * Handler class that should be extended and used by users of the `Contract`.
   * To ensure this contract handles all handlers properly, handlers should be
   * of this handler type.
   */
  static readonly Handler = HandlerWithFunctionName;

  /**
   * Get the builder for building on object of this class.
   * @returns The builder.
   */
  static builder() {
    return new InitialStateBuilder();
  }
}
