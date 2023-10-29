import { Store } from "./Store";

export function store<S>(state: S) {
  const store = new Store(state ?? {});

  if (state && typeof state === "object" && !Array.isArray(state)) {
    for (const [property, value] of Object.entries(state)) {
      Object.defineProperty(store, property, {
        // TODO(crookse) configure property options?
        value,
      });
    }
  }

  return store;
}
