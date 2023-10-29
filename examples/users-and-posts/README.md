# Users and Posts

This CommonJS example shows the output of the state when actions are sent to the
contract.

**Note: This does not show you how to bundle all the files that make up your
contract. It only shows a single file. However, you https://tsup.egoist.dev
makes bundling easier for you if you are looking for a bundler.**

## Quickstart

1. Install the dependencies.

```text
npm install
```

1. Start an `arlocal` instance.

   ```text
   npx arlocal
   ```

1. Run the `deployer.js` client.

   ```text
   node deployer.js
   ```

   You should see something similar to the following:

   ```text
   ```

**If you want to deploy to the Arweave network, you can do the following:**

**Note: You will need some AR tokens for this.**

1. Open `deployer.js`.

1. Change the `Client.deployer({ ... })` to the following:

   ```ts
   const deployer = Client.deployer({
     api_config: {
       host: "arweave.net",
       port: 443,
       logging: true,
       protocol: "https",
     },
   });
   ```

1. Save the `deployer.js` file and run it.

   ```text
   node deployer.js
   ```

   You should see something similar to the following:

   ```text
   Requesting: https://arweave.net:443/tx_anchor
   Response:   https://arweave.net/tx_anchor - 200
   Requesting: https://arweave.net:443/price/885
   Response:   https://arweave.net/price/885 - 200
   Requesting: https://arweave.net:443/tx
   Response:   https://arweave.net/tx - 400
   Requesting: https://arweave.net:443/tx_anchor
   Response:   https://arweave.net/tx_anchor - 200
   Requesting: https://arweave.net:443/price/23
   Response:   https://arweave.net/price/23 - 200
   Requesting: https://arweave.net:443/tx
   Response:   https://arweave.net/tx - 400
   {
   result: {
      source_code_id: 'zhUiT8rVlt6CYnluQ-x5fyxYgAssDDfs0MRmwB1-MKM',
      contract_id: 'fojRJh7NDWysAclGNadMyyO0PvdL86C92d6IOZfnjWQ'
   }
   }


   View your transactions (may take some time to post):
   - Source code: https://viewblock.io/arweave/block/zhUiT8rVlt6CYnluQ-x5fyxYgAssDDfs0MRmwB1-MKM
   - Contract: https://viewblock.io/arweave/block/fojRJh7NDWysAclGNadMyyO0PvdL86C92d6IOZfnjWQ
   ```

## Misc

The `app.js` file in this directory shows you how the `Contract` processes
interactions. You can use it as a playground for testing out the `Contract`
instance or as a way to understand how data flows through the `Contract`
actions.

1. Run the following command:

   ```
   npm install && node app.js
   ```

1. Check the console. You should see the following:

   ```text
   Function "add_user" result:
   { users: { '1337': { id: 1337, name: 'crkstz' } }, posts: [] }


   Function "add_post" result:
   {
   users: { '1337': { id: 1337, name: 'crkstz' } },
   posts: [ { title: 'Hello', body: 'Ok' } ]
   }


   Function "delete_user" result:
   { users: {}, posts: [ { title: 'Hello', body: 'Ok' } ] }
   ```

1. Take a look in the `app.js` file to see how it results in the above output.
