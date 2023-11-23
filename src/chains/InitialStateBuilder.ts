import { KeyValues } from "../types/KeyValues.ts";
import { ActionsBuilder } from "./ActionsBuilder.ts";

/**
 * The first builder to building the `Contract` object. This only exists to
 * inject the state's type in the builder.
 */
export class InitialStateBuilder<S extends KeyValues<S>> {
  /**
   * Set the contract's initial state.
   * @param initialState The contract's initial state.
   * @returns This builder for further method chaining.
   */
  initialState<S>() {
    return new ActionsBuilder<S>();
  }
}
