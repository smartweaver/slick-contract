import { describe, expect, test } from "vitest";
import { Contract, ContractContext } from "../src/mod.ts";

describe("methods", () => {
  describe("builder()", () => {
    test("can build a contract", async () => {
      const state = { greetings: [0, 1] };

      class Add extends Contract.Handler {
        handle(context: ContractContext<typeof state, number>) {
          context.state.greetings.push(context.action.input.payload!);
          return context;
        }
      }

      const contract = Contract
        .builder<typeof state>()
        .action(new Add("add"))
        .build();

      function createContext(payload: number) {
        return {
          state,
          action: {
            input: {
              function: "add",
              payload,
            },
          },
        };
      }

      let result;

      result = await contract.handle(createContext(2));
      expect(result.state).toStrictEqual({ greetings: [0, 1, 2] });

      result = await contract.handle(createContext(1));
      expect(result.state).toStrictEqual({ greetings: [0, 1, 2, 1] });

      result = await contract.handle(createContext(8));
      expect(result.state).toStrictEqual({ greetings: [0, 1, 2, 1, 8] });
    });

    test("can use a mix a handler signatures (fn and class types)", async () => {
      const state = { greetings: [0, 1] };

      class Add extends Contract.Handler {
        function_name = "add";

        handle(context: ContractContext<typeof state>) {
          if (context.action.input.payload) {
            context.state.greetings.push(context.action.input.payload);
          }

          return context;
        }
      }

      class NoHandleMethod extends Contract.Handler {
        public handle(context: any) {
          return context;
        }
      }

      const contract = Contract
        .builder<typeof state>()
        // Function 1
        .action(new Add("add"))
        // Function 2
        .action("pop", (context) => {
          context.action.input.function = "pop_actual";
          return context.contract.actions.get("pop_actual")?.handle(context);
        })
        // Function 3 (but must use Function 2 to access this)
        // TODO(crookse) Test permissions
        .action("pop_actual", (context) => {
          context.state.greetings.pop();
          return context;
        })
        // Function 4
        .action(new NoHandleMethod("no_handle_method"))
        .build();

      // There should be Function 1, 2, 3, and 4
      expect(contract.functions.length).toBe(4);

      let result;

      result = await contract.handle({
        state,
        action: {
          input: {
            function: "add",
            payload: 11,
          },
        },
      });

      expect(result.state).toStrictEqual({ greetings: [0, 1, 11] });

      result = await contract.handle({
        state: result.state,
        action: {
          input: {
            function: "add",
            payload: 2337,
          },
        },
      });
      expect(result.state).toStrictEqual({ greetings: [0, 1, 11, 2337] });

      result = await contract.handle({
        state: result.state,
        action: {
          input: {
            function: "pop",
            payload: null,
          },
        },
      });
      expect(result.state).toStrictEqual({ greetings: [0, 1, 11] });

      result = await contract.handle({
        state: result.state,
        action: {
          input: {
            function: "add",
            payload: 1111,
          },
        },
      });
      expect(result.state).toStrictEqual({ greetings: [0, 1, 11, 1111] });

      result = await contract.handle({
        state: result.state,
        action: {
          input: {
            function: "pop",
            payload: {},
          },
        },
      });
      expect(result.state).toStrictEqual({ greetings: [0, 1, 11] });

      result = await contract.handle({
        state: result.state,
        action: {
          input: {
            function: "pop",
            payload: {},
          },
        },
      });
      expect(result.state).toStrictEqual({ greetings: [0, 1] });
    });
  });
});
