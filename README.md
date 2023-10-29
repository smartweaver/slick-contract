# SmartWeaver Contract Chained

SmartWeaver contract implementation with a chained methods API

## Usage

This is a simple example showing how to:

- define an initial state;
- define a contract using the initial state;
- add actions to the contract; and
- simulating a write interaction to the contract.

```ts
import {
  ContextContract,
  Contract,
} from "@crookse/smart-weaver-contract-chained";

// Define the initial state
const state = {
  users: {},
};

// Define the contract
const contract = Contract
  .builder()
  .initialState(state)
  // The `context` data type is shown in the "Context Data Type" section below
  .action("add_user", (context) => {
    const { id, name } = context.action.input.payload;

    context.state.users[id] = { name }; // e.g., { 1337: { name: "CRKSTZ" } }

    // Return the context back to the `Contract` instance's internals for
    // further handling
    return context;
  })
  // Call this to build the `Contract` instance
  .build();

// Simulating a write interaction would look like ...
export function handle(
  state,
  action: {
    input: {
      // This will cause the `.action("add_user", (...))` method to be used
      function: "add_user";
      payload: {
        id: 1337;
        name: "CRKSTZ";
      };
    };
  },
) {
  return contract
    // The `{ state, action }` passed to the `handle()` method becomes the
    // `context` object in the `.action(...)` methods above
    .handle({ state, action })
    // The `Contract` instance's internals return the `context` object back to
    // you, so you can do the following and be done handling the interaction
    .then((context) => {
      return { state };
    })
    // The `Contract` instance does not throw `ContractError` objects. It only
    // throws `Error` objects, so you have to catch them and throw the
    // `ContractError` object yourself.
    .catch((error) => {
      throw new ContractError("Something went wrong");
    });
}
```

### Context Data Type

```ts
export type Context<S = unknown, P = any> = {
  state: S;
  action: {
    input: {
      function: string;
      payload: P;
    };
    caller?: string;
  };
};
```
