import { Client } from "@crookse/smart-weaver-client-arweave";
import { getWallet } from "./wallet.js";
import { readFileSync } from "node:fs";
import { state } from "./contract.state.js";

(async () => {
  const deployer = Client.deployer({
    api_config: {
      port: 1984,
    },
  });

  const result = await deployer
    .handle({
      creator: getWallet().jwk,
      source_code: {
        data: readFileSync("./contract.handler.js", "utf-8"),
      },
      initial_state: {
        data: JSON.stringify(state),
      },
    });

  console.log({ result });

  console.log(`\n\nView your transactions (may take some time to post):`);
  console.log(
    `  - Source code: https://viewblock.io/arweave/block/${result.source_code_id}`,
  );
  console.log(
    `  - Contract: https://viewblock.io/arweave/block/${result.contract_id}`,
  );
})();
