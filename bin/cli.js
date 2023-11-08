#!/usr/bin/env node

import fs from "node:fs";
import * as esbuild from "esbuild";
import prettier from "prettier";

class Help {
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
    console.log(`
Usage:

  Build your contract JS file
  
      npx @smartweaver/slick-contract build <CONTRACT_FILE>

`);

    return this;
  }

  exit(code = 0) {
    console.log(); // Spacer
    process.exit(code);
  }
}

const help = new Help();

(async () => {
  const [
    _a, // Ignore
    _b, // Ignore
    command,
    file1,
  ] = process.argv;

  if (command === "build") {
    return await build(file1);
  }

  help.usage();
})();

/**
 * Build the contract file at the given `contractFilepath`.
 * @param {string} contractFilepath
 */
async function build(contractFilepath) {
  const outfile = contractFilepath + ".build.js";

  if (!contractFilepath) {
    help
      .error(`Arg CONTRACT_FILE not provided`)
      .usage()
      .exit(1);
  }

  if (!contractFilepath) {
    help
      .error(`Arg STATE_FILE not provided`)
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

  let formatted = await prettier
    .format(fs.readFileSync(outfile, "utf-8"), {
      filepath: outfile,
      parser: "typescript",
    });

  help.log(`Fixing handle function export statement`);

  formatted = formatted
    .replace(
      /export\s+\{.+};/g,
      "",
    )
    .replace(
      "function handle(state",
      `
// Created using @smartweaver/slick-contract
// Submit build issues to @smartweaver/slick-contract
// Date created: ${new Date().toUTCString()}
export async function handle(state`,
    );

  fs.writeFileSync(outfile, formatted, "utf-8");

  help.log(`Done. View your view at:\n\n  ${outfile}`);
}
