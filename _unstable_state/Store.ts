import { Recursive } from "./types";

type Action<
  State,
  Payload = unknown,
> = (store: State, payload: Payload) => State | Promise<State>;

export class Store<State = unknown> {
  #state: State;
  readonly actions: Record<string, Action<State>>;

  constructor(state: State, actions?: any) {
    this.#state = state;
    this.actions = actions;
  }

  dispatch<P>(state: string, actionName: string, payload: P) {
    console.log(`dispatching:`, { state, actionName, payload });
    return this.actions[actionName](this.#state, payload);
  }

  action<A extends Action<State>>(name: string, action: A) {
    Object.defineProperty(action, "name", {
      value: name,
    });

    action.bind(this);

    this.actions[name] = action;
    return new Store(this.#state, this.actions);
  }

  json(): Recursive<State> {
    // TODO(crookse) Remove empty objects from private class fields using `#`
    return JSON.parse(this.text());
  }

  text() {
    if (Array.isArray(this.#state)) {
      const array = this.#toPojoArray(this.#state);

      return JSON.stringify(array);
    }

    return JSON.stringify(this.#toPojoObj(this.#state));
  }

  #toPojoArray(store: unknown[]) {
    return store.map((value) => {
      return this.#getPojoValue(value);
    });
  }

  #toPojoObj(store: unknown) {
    const ret: unknown[] | Partial<Record<string, unknown>> = {};

    if (!store) {
      return ret;
    }

    if (typeof store === "object") {
      for (let [key, value] of Object.entries(store)) {
        if (Array.isArray(value)) {
          ret[key] = this.#toPojoArray(value);
          continue;
        }

        ret[key] = this.#getPojoValue(value);
      }
    }

    return ret;
  }

  #getPojoValue(value: unknown) {
    if (!value) {
      return value;
    }

    if (value instanceof Store) {
      return value.json();
    }

    if (typeof value === "object") {
      return this.#toPojoObj(value);
    }

    return value;
  }
}
