# Slick Contract

Slick builder APIs for Arweave smart contract creation

## Installation

```text
npm install @smartweaver/slick-contract
```

## Usage - Creating a Contract and State File

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

    import { Contract } from "@smartweaver/slick-contract/mod.js";
    import { state } from "./state.ts";

    declare const ContractError;

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

    export async function handle(state, action) {

      const context = { state, action };     // Create a `context`` object. This becomes the `context` param
                                             // in the `.action("some_name", (context) => { ... })` methods.

      try {
        const result = await contract        // Pass the `context` object to your contract to get a `result`
          .handle(context);

        return { state: result.state };      // The `result` will contain the `state` object that you return.
                                             // Returning the `state` is required. See the following:
                                             // https://github.com/ArweaveTeam/SmartWeave/blob/master/CONTRACT-GUIDE.md#contract-format-and-interface
      } catch (e) {
        const message = e.message            // Slick Contract's internals only throw `Error` objects. They
          ? e.message                        // not throw `ContractError` objects. You have to throw the
          : "We hit an error. Sorry!";       // `ContractError` object yourself like how it is shown here.
        throw new ContractError(message);
      }
    }
    ```

1. Build your `contract.ts` file (and optionally your `state.ts` file).

    ```bash
    npx @smartweaver/slick-contract build contract.ts state.ts
    ```

    The above command will create:

   - a `contract.ts.build.js` file in the same directory as your `contract.ts` file; and
   - a `state.ts.build.json` file in the same directory as your `state.ts` file.
   
   These are the files you deploy to the Arweave network.

    _Note: This script tries to be smart about ensuring your built contract file has a valid `export async function handle(...)`, but please verify this manually. Otherwise your contract might not work in the Arweave network._

## Usage - CLI

The CLI only exists to help you build your contract. It only:

- bundles your contract file into a single `.js` file; and
- converts your state file from `.ts|.js` to `.json`.

You can run the CLI using:

```bash
npx @smartweaver/slick-contract <COMMAND> <CONTRACT_FILE> [STATE_FILE]
```

The full CLI usage is below:

```text
## Summary

Add optional arg to CLI to build state file. Updated CLI usage is below:

```text
USAGE
  
    npx @smartweaver/slick-contract <COMMAND> <CONTRACT_FILE> [STATE_FILE]


EXAMPLE USAGE

    npx @smartweaver/slick-contract build src/contract.ts src/state.ts


COMMANDS

    The commands for this script are as follows:

    build        Build your contract's source and state files
```

## Data Types

Slick Contract has a strict syntax. It requires the `action` and `context` objects to match the data types below. Validation is performed on these objects to ensure they are in the correct data type format. If not, an error will be thrown with a message showing how to correct the objects.

### Action Objects

The `action` argument in the `handle` function should have the following `Action` data type shown below:

```ts
type Action = {
  input: {
    function: string;
    payload?: any;
  }
};

export function handle(state: any, action: Action) {
  //
  // ... code shortened for brevity
  //
}
```

### Context Objects

The `context` argument in the `.action("some_name", (context) => { ... })` method should have the following `Context` data type shown below:

```ts
//
// ... code shortened for brevity
//

type Action = {
  input: {
    function: string;
    payload?: any;
  }
};

type Context = {
  state: any;
  action: Action;
};

export function handle(state: any, action: Action) {

  try {

    const context: Context = { state, action };
    const result = contract.handle(context);
    return { state: result.state };

  } catch (error) {

    throw new ContractError(error.message);

  }
}
```
