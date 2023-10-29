export type Recursive<O> = {
  [K in keyof O]: O[K] extends object ? Recursive<O[K]>
    : O[K];
};
