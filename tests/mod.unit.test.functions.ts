import { Contract } from "../src/mod.ts";
import { describe, expect, test, vitest } from "vitest";

const now = Date.now();
vitest.useFakeTimers().setSystemTime(now);

describe("handle()", () => {
  describe("add", () => {
    test("handles known function: add", async () => {
      const result = await handle(
        { storage: [] },
        {
          input: {
            function: "add",
            payload: {
              item: "add",
            },
          },
        },
      );

      expect(result).toStrictEqual({ state: { storage: ["add"] } });
    });
  });

  describe("subtract", () => {
    test("handles known function: subtract", async () => {
      const result = await handle(
        { storage: [] },
        {
          input: {
            function: "subtract",
            payload: {
              item: "sub",
            },
          },
        },
      );

      expect(result).toStrictEqual({ state: { storage: ["sub"] } });
    });
  });

  describe("wwaaaat", () => {
    test("handles unknown function: wwaaaat", async () => {
      return handle(
        { storage: [] },
        {
          input: {
            function: "wwaaaat",
            payload: {
              item: "sub",
            },
          },
        },
      )
        .then(() => {
          assert(false); // This should not be hit
        })
        .catch((e: Error) => {
          expect(e.message).toBe("Unknown function 'wwaaaat' provided");
        });
    });
  });
});

type State = {
  storage: string[];
};

const initialState: State = {
  storage: [],
};

class Multiply extends Contract.Handler {
  public handle(context: any) {
    return context;
  }
}

const contract = Contract
  .builder()
  .initialState(initialState)
  .action("add", (context) => {
    const { input } = context.action;
    context.state.storage.push(input.payload.item);
    return context;
  })
  .action("subtract", (context) => {
    const { input } = context.action;
    context.state.storage.push(input.payload.item);
    return context;
  })
  .action(new Multiply("multiply"))
  .build();

function handle(currentState: any, action: any) {
  return contract
    .handle({
      state: currentState,
      action,
    })
    .then((context) => {
      return { state: context.state };
    });
}
