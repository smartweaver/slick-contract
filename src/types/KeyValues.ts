export type KeyValues<O = {}> = { [K in keyof O]: O[K] };
