const { Contract } = require(
  "@crookse/smart-weaver-contract-slick-contract/mod",
);

const state = {
  users: {},
  posts: [],
};

const contract = Contract
  .builder()
  .initialState(state)
  .action("add_user", (context) => {
    const { user } = context.action.input.payload;
    context.state.users[user.id] = user;
    return context;
  })
  .action("delete_user", (context) => {
    const { user } = context.action.input.payload;
    delete context.state.users[user.id];
    return context;
  })
  .action("add_post", (context) => {
    const { post } = context.action.input.payload;
    delete context.state.posts.push(post);
    return context;
  })
  .build();

function handle(state, action) {
  return contract
    .handle({ state, action })
    .then((context) => {
      return { state: context.state };
    })
    .catch((e) => {
      console.log({ e });
    });
}

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
