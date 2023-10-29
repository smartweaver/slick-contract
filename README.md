# SmartWeaver Slick Contract

Slick builder APIs for Arweave smart contract creation

## Installation

```text
npm install @crookse/smart-weaver-contract-slick-contract
```

## Usage

This is a simple example showing how to:

- define an initial state;
- define a `contract` object using the initial state;
- add actions to the `contract`; and
- providing the `contract` to the exported `handle()` function.

```ts
import { Contract } from "@crookse/smart-weaver-contract-slick-contract";

// Step 1: Define your contract's initial state
const state = {
  users: {},
};

// Step 2: Define your contract
const contract = Contract
  .builder()                             // Access the `Contract` builder
  .initialState(state)                   // Give it your initial state
  .action("add_user", (context) => {     // Now you can add actions to modify the state
    const { input } = context.action;    // The `input` object is in the `context.action` field
    const { id, name } = input.payload;  // If we have a user in `input.payload` ...
    context.state.users[id] = { name };  // ... then we can add the user to the state
    return context;                      // Return the `context` object to "end" the action
  })
  .build();                              // When you are done writing your contract, build it ...
                                         // ... to get a contract object with a `handle()` method

// Step 3: Export the handle function
export function handle(state, action) {
  return contract                        // Using your contract object ...
    .handle({ state, action })           // ... call its `handle()` method with a `context` object
    .then((context) => {                 // After your contract is done handling the `context` ...
      return { state: context.state };   // ... you will get it back so you can return the `state`
    })
    .catch((e: any) => {                 // If errors occur, then you need to handle them and ...
      let message = e.message            // ... throw the `ContractError` object yourself`
        ? e.message
        : "We hit an error. Sorry!";
      throw new ContractError(message);
    });
}
```

### Example Write Interaction Handling

This example shows how a write interaction transaction would be handled by the above contract.

If the contract receives the following action ...

```ts
const action = {
  input: {
    function: "add_user",
    payload: {
      id: 1337,
      name: "CRKSTZ",
    },
  },
};
```

... then the `handle()` function would be as follows:

```ts
export function handle(state, action) {
  return contract
    // The `{ state, action }` passed to the `handle()` method becomes the
    // `context` object in the `.action(...)` methods
    .handle({ state, action })

    // The `Contract` instance's internals return the `context` object back to
    // you, so you can do the following to return the state as required by the
    // network (see https://github.com/ArweaveTeam/SmartWeave/blob/master/CONTRACT-GUIDE.md#contract-format-and-interface)
    .then((context) => {
      return { state: context.state };
    })
    
    // The `Contract` instance's internals only throw `Error` objects. They do
    // not throw `ContractError` objects. You have to throw the `ContractError`
    // object yourself similar to how it is shown below.
    .catch((e: any) => {
      let message = e.message
        ? e.message
        : "We hit an error. Sorry!";
      throw new ContractError(message);
    });
}
```
