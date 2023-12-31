import { Contract } from "@smartweaver/slick-contract/mod.js";
import { state } from "./v1.state.ts";

declare const ContractError;

const contract = Contract
  .builder()
  .initialState<typeof state>()
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
    context.state.posts.push(post);
    return context;
  })
  .build();

export function handle(state, action) {
  return contract
    .handle({ state, action })
    .then((context) => {
      return { state: context.state };
    })
    .catch((e) => {
      throw new ContractError(e.message);
    });
}
