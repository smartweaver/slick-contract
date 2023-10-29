export type Context<S = unknown, P = any> = {
  state: S;
  action: {
    input: {
      function: string;
      payload: P;
    };
    caller?: string;
  };
};
