export type KeyValues<
  O = any,
> = { [K in keyof O]: O[K] };
