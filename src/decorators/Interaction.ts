import { Context } from "../types/Context.ts";

export function Interaction<P = any>(
  action: Context<unknown, P>["action"],
) {
  return new class Interaction {
    readonly input = action?.input;
    readonly function = action?.input?.function;
    readonly payload = action?.input?.payload;
  }();
}
