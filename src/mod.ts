import { ActionsBuilder } from "./chains/ActionsBuilder.ts";
import { HandlerWithFunctionName } from "./deps.ts";
import { KeyValues } from "./types/KeyValues.ts";

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
  static builder<S extends KeyValues<S> = any>() {
    return new ActionsBuilder<S>();
  }
}
