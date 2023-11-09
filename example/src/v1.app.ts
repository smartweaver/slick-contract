import { handle } from "./v1.contract.ts.build.js";
import { state } from "./v1.state.ts";

(async () => {
  // Add ContractError that gets injected when run in the execution environment

  globalThis.ContractError = class ContractError extends Error {
    constructor(...args) {
      super(...args);
      this.name = "ContractError";
    }
  };

  // Define some reusable vars (yay DRY)

  let result;
  let currentState = state;

  // Simulate the contract handling an "add_user" interaction

  console.log(`\n\nSending "add_user" function for 1337 user`);
  result = await handle(
    currentState,
    {
      input: {
        function: "add_user",
        payload: {
          user: {
            id: 1337,
            name: "CRKS",
          },
        },
      },
    },
  );
  currentState = result.state;
  console.log(`Function "add_user" result:`);
  console.log(currentState);

  // Simulate the contract handling an "add_post" interaction

  console.log(`\n\nSending "add_post" function`);
  result = await handle(
    currentState,
    {
      input: {
        function: "add_post",
        payload: {
          post: {
            title: "Hello",
            body: "Ok",
          },
        },
      },
    },
  );
  currentState = result.state;
  console.log(`Function "add_post" result:`);
  console.log(currentState);

  // Simulate the contract handling an "add_user" interaction

  console.log(`\n\nSending "add_user" function for 1338 user`);
  result = await handle(
    currentState,
    {
      input: {
        function: "add_user",
        payload: {
          user: {
            id: 1338,
            name: "moab",
          },
        },
      },
    },
  );
  currentState = result.state;
  console.log(`Function "add_user" result:`);
  console.log(currentState);

  // Simulate the contract handling an "delete_user" interaction

  console.log(`\n\nSending "delete_user" function`);
  result = await handle(
    currentState,
    {
      input: {
        function: "delete_user",
        payload: {
          user: {
            id: 1337,
          },
        },
      },
    },
  );
  currentState = result.state;
  console.log(`Function "delete_user" result:`);
  console.log(currentState);

  // Simulate the contract handling an unknown function

  console.log(`\n\nSending "hello" function`);
  try {
    result = await handle(
      currentState,
      {
        input: {
          function: "hello",
          payload: "; console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n');",
        },
      },
    );
  } catch (error) {
    console.log(`\nThe contract threw an error: ${error}\n`);
  }

  currentState = result.state;
  console.log(`Current state after error being thrown:`);
  console.log(currentState);

  console.log(`\n\n`);
})();
