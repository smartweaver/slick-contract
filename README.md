# SmartWeaver Slick Contract

Slick builder APIs for Arweave smart contract creation

## Usage

This is a simple example showing how to:

- define an initial state;
- define a contract using the initial state;
- add actions to the contract; and
- simulating a write interaction to the contract.

```ts
// Define the initial state
const state = {
  users: {},
};

// Define the contract
const contract = Contract
  .builder()                          // Access the contract builder ...
  .initialState(state)                // ... (like this one to add your initial state)
  .action("add_user", (context) => {  // 
    const { id, name } = context.action.input.payload;

    context.state.users[id] = { name }; // e.g., { 1337: { name: "CRKSTZ" } }

    // Return the context back to the `Contract` instance's internals for
    // further handling
    return context;
  })
  // Call this to build the `Contract` instance
  .build();

// If we had the following `handle` function ...
export function handle(state, action) {
  return contract
    .handle({ state, action })
    .then((context: { state: typeof state }) => {
      return { state: context.state };
    })
    .catch((_error: any) => {
      throw new ContractError("Something went wrong");
    });
}

// ... then the following call will ...

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

// ... result in the following state
console.log(result.state); // { users: { 1337: { name: "CRKSTZ" } } }
```

### The `handle()` Function Explained

The `handle()` function above is explained below using the given `"add_user"`
action that was passed to it.

```ts
export function handle(state, action) {
  //
  // For context, the `action` argument is
  //
  // {
  //   input: {
  //     function: "add_user",
  //     payload: {
  //       id: 1337,
  //       name: "CRKSTZ",
  //     }
  //   }
  // }
  //

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
