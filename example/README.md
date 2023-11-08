# Users and Posts Example

## Quickstart

1. Install [Node](https://nodejs.org) (v18+).

1. Install the dependencies.

   ```bash
   npm install
   ```

1. Build the contract.

   ```bash
   npm run build
   ```

   This command will create a `src/v1.contract.ts.build.js` file.

1. Run the test application that exercises the contract's actions and state.

   ```bash
   npm run test-app
   ```

## Deploying

- This example app does not have a deployer. You will have to deploy using your own techniques/methods.

- Before deploying a contract to the Arweave network, make sure your state file is in JSON format. This example app uses a `v1.state.ts` file for exercising the contract. If it were to be deployed, it would be dynamically imported in a script and its contents transformed using `JSON.stringify()`.
