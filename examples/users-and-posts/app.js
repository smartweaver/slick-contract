import { handle } from "./contract.handler.js";
import { state } from "./contract.state.js";

(async () => {
  let result;
  let currentState = state;

  result = await handle(
    currentState,
    {
      input: {
        function: "add_user",
        payload: {
          user: {
            id: 1337,
            name: "crkstz",
          },
        },
      },
    },
  );

  currentState = result.state;

  console.log(`\n\nFunction "add_user" result:`);
  console.log(currentState);

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

  console.log(`\n\nFunction "add_post" result:`);
  console.log(currentState);

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

  console.log(`\n\nFunction "delete_user" result:`);
  console.log(currentState);
})();
