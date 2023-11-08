#!/usr/bin/env node

import fs from "node:fs";
import * as esbuild from "esbuild";
import prettier from "prettier";

const help = new class Help {
  error(message) {
    this.write(`[ERROR] ${message}`);
  }

  log(...messages) {
    console.log(); // Spacer

    for (const message of messages) {
      console.log(message);
    }

    return this;
  }

  usage() {
    console.log(
      "\nUsage:\n\n    npx @smartweaver/slick-contract <PATH_TO_CONTRACT_FILE> <PATH_TO_STATE_FILE>",
    );
    return this;
  }

  exit(code = 0) {
    console.log(); // Spacer
    process.exit(code);
  }
}();

(async () => {
  const contractFilepath = process.argv[2];
  const outfile = contractFilepath + ".build.js";

  if (!contractFilepath) {
    help
      .error(`Arg PATH_TO_CONTRACT_FILE not provided`)
      .usage()
      .exit(1);
  }

  help.log(`Using esbuild to bundle ${contractFilepath}`);

  await esbuild.build({
    entryPoints: [contractFilepath],
    bundle: true,
    format: "esm",
    logLevel: "debug",
    minifyWhitespace: true,
    outfile,
    platform: "node",
    sourcemap: false,
    splitting: false,
    target: "es2015",
  });

  help.log(`Using prettier to format esbuild bundle output`);

  const formatted = await prettier
    .format(fs.readFileSync(outfile, "utf-8"), {
      filepath: outfile,
      parser: "typescript",
    });

  fs.writeFileSync(outfile, formatted, "utf-8");

  help.log(`Done`);
})();
