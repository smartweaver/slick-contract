# SmartWeaver Slick Contract

Slick builder APIs for Arweave smart contract creation

## Installation

```text
npm install @smartweaver/slick-contract
```

## Usage

This is a simple example showing how to:

- define an initial state;
- define a `contract` object using the initial state;
- add actions to the `contract`; and
- providing the `contract` to the exported `handle()` function.

### Steps

1. Create your `state.ts` file.

    ```ts
    // File: state.ts

    export const state = {
      users: {},
      posts: {},
    };
    ```

1. Create your `contract.ts` file.

    ```ts
    // File: contract.ts

    import { Contract } from "@smartweaver/slick-contract";
    import { state } from "./state.ts";

    //
    // Create your contract
    //

    const contract = Contract
      .builder()                             // Access the `Contract` class' builder

      .initialState<typeof state>()          // Call `initialState()` and (optionally) pass your state's typing

      .action("add_user", (context) => {     // Now you can add actions to modify the state

        const { input } = context.action;    // The `input` object is in the `context.action` field

        const { id, name } = input.payload;  // If we have a user in `input.payload` ...
        context.state.users[id] = { name };  // ... then we can add the user to the state

        return context;                      // Return the `context` object to "end" the action
      })

      .build();                              // Build your contract when you are done (this returns a `.handle()` method)

    //
    // Export the required handle function
    //

    export function handle(state, action) {

      return contract                        // Using your contract object ...
        .handle({ state, action })           // ... call its `handle()` method (mentioned above) with a `context` object

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

1. Build your `contract.ts` file.

    ```bash
    npx @smartweaver/slick-contract build contract.ts
    ```

    The above command will create a `contract.ts.build.js` file in the same directory as your `contract.ts` file. This is the file (aka smart contract) you should deploy to the network.

    _Note: This script tries to be smart about ensuring your built contract file has a valid `export async function handle(...)`, but please verify this manually. Otherwise your contract might not work in the Arweave network._

### Example Write Interaction Handling

This example shows how a write interaction transaction would be handled by the above contract.

If the contract receives the following action for the given state...

```json
// State
{
  "users": {},
  "posts": {}
}

// Action
{
  "input": {
    "function": "add_user",
    "payload": {
      "id": 1337,
      "name": "CRKSTZ"
    }
  }
}
```

... then the `handle()` function would process as follows:

```ts
//
// ... code shortened for brevity
//

export async function handle(state, action) {

  const context = { state, action };               // Create a `context`` object. This becomes the `context` param
                                                   // in the `.action("some_name", (context) => { ... })` methods.

  try {
    const result = await contract.handle(context); // Pass the `context` object to your contract to get a `result`

    return { state: reuslt.state };                // The `result` will contain the `state` object that you return.
                                                   // Returning the `state` is required. See the following:
                                                   // https://github.com/ArweaveTeam/SmartWeave/blob/master/CONTRACT-GUIDE.md#contract-format-and-interface
  } catch (error) {
    const message = e.message                      // Slick Contract's internals only throw `Error` objects. They
      ? e.message                                  // not throw `ContractError` objects. You have to throw the
      : "We hit an error. Sorry!";                 // `ContractError` object yourself like how it is shown here.
    throw new ContractError(message);
  }
}
```
