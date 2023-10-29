import { describe, expect, test } from "vitest";
import { Contract, ContractContext } from "../src/mod.ts";

class ContractError extends Error {
}

describe("methods", () => {
  describe("builder()", () => {
    test("can build a contract", async () => {
      // Define the initial state
      const state = {
        users: {},
      };

      // Define the contract
      const contract = Contract
        .builder()
        .initialState(state)
        // The `context` data type is shown in the "Context Data Type" section below
        .action(
          "add_user",
          (
            context: ContractContext<
              typeof state,
              { id: string; name: string }
            >,
          ) => {
            const { id, name } = context.action.input.payload;

            context.state.users[id] = { name }; // e.g., { 1337: { name: "CRKSTZ" } }

            // Return the context back to the `Contract` instance's internals for
            // further handling
            return context;
          },
        )
        // Call this to build the `Contract` instance
        .build();

      // Simulating a write interaction would look like ...
      function handle(
        state,
        action,
      ) {
        return contract
          // The `{ state, action }` passed to the `handle()` method becomes the
          // `context` object in the `.action(...)` methods above
          .handle({ state, action })
          // The `Contract` instance's internals return the `context` object back to
          // you, so you can do the following and be done handling the interaction
          .then((context: { state: typeof state }) => {
            return { state: context.state };
          })
          // The `Contract` instance does not throw `ContractError` objects. It only
          // throws `Error` objects, so you have to catch them and throw the
          // `ContractError` object yourself.
          .catch((_error: any) => {
            throw new ContractError("Something went wrong");
          });
      }

      const action = {
        input: {
          // This will cause the `.action("add_user", (...))` method to be used
          function: "add_user",
          payload: {
            id: 1337,
            name: "CRKSTZ",
          },
        },
      };

      const result = await handle(state, action);

      expect(result.state).toStrictEqual({
        users: { 1337: { name: "CRKSTZ" } },
      });
    });
  });
});
