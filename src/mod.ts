import { ChainWithContractMembers } from "./chains/ChainWithContractMembers";
import { HandlerWithFunctionName } from "@crookse/smart-weaver/esm/standard/handlers/HandlerWithFunctionName";

export type { Context as ContractContext } from "./types/Context.ts";

/**
 * TODO(crookse) Imported type isn't checked, so we have this class extending
 * the class that has the `function_name` property.
 */
class ContractHandler extends HandlerWithFunctionName {
  constructor(name: string) {
    super(name);
  }
}

export class Contract {
  /**
   * Handler class that should be extended and used by users of the `Contract`.
   * To ensure this contract handles all handlers properly, handlers should be
   * of this handler type.
   */
  static readonly Handler = ContractHandler;

  static builder() {
    return new ChainWithContractMembers();
  }
}
