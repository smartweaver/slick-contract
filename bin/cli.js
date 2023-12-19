#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";
import prettier from "prettier";

const esbuildConfigs = {
  bundle: true,
  format: "esm",
  logLevel: "debug",
  minifyWhitespace: true,
  platform: "browser",
  sourcemap: false,
  splitting: false,
  target: "esnext",
}

const colors = {
  bg: {
    red: "\x1b[41m",
  },
  reset: "\x1b[0m",
};

class Help {
  error(message) {
    return this.log(`\n\n${colors.bg.red}[ERROR]${colors.reset} ${message}\n`);
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
USAGE
  
    npx @smartweaver/slick-contract <COMMAND> <CONTRACT_FILE> [STATE_FILE]


EXAMPLE USAGE

    npx @smartweaver/slick-contract build src/contract.ts src/state.ts


COMMANDS

    The commands for this script are as follows:

    build        Build your contract's source and state files
`);

    return this;
  }

  exit(code = 0) {
    console.log(); // Spacer
    process.exit(code);
  }
}

const help = new Help();

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - CLI BEGIN /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

(async () => {
  const [
    _a, // Ignore
    _b, // Ignore
    command,
    file1,
    file2,
  ] = process.argv;

  if (command === "build") {
    return await build(file1, file2);
  }

  help.error(`Arg COMMAND not provided`).usage();
})();

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - CLI END ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Build the contract file at the given `contractFilepath`.
 * @param {string} contractFilepath
 * @param {string} stateFilepath
 */
async function build(contractFilepath, stateFilepath) {
  const outfile = contractFilepath + ".build.js";

  if (!contractFilepath) {
    help
      .error(`Arg CONTRACT_FILE not provided`)
      .usage()
      .exit(1);
  }

  help.log(`Using esbuild to bundle ${contractFilepath}`);

  await bundleTypeScriptFile(contractFilepath, outfile);

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

  help.log(`Creating ${stateFilepath}.json file`);

  if (stateFilepath) {
    let state;

    if (path.extname(stateFilepath) === ".ts") {
      state = await getStateFromTypeScriptFile(stateFilepath);
    } else {
      state = await getStateFromJavaScriptFile(stateFilepath);
    }

    if (!state) {
      help.error(`Could not read state from ${stateFilepath}.
- File does not export a \`state\` variable
- File does not have a \`default\` export

You will have to fix your state file to export a \`state\` variable or export a
\`default\` value as the state. You can also create your state.json file manually.
`);
    } else {
      fs.writeFileSync(
        stateFilepath + ".build.json",
        JSON.stringify(state, null, 2),
        "utf-8",
      );
    }
  }

  help.log(`Done building contract files. If they built properly, view them at:

  - ${outfile}
  - ${
    stateFilepath ? (stateFilepath + ".build.json") : "(no state file provided)"
  }
  
`);
}

/**
 * This function only exists to bundle files with the same esbuild configs.
 * @param {string} filepath 
 * @param {string} outfile 
 */
async function bundleTypeScriptFile(filepath, outfile) {
  await esbuild.build({
    entryPoints: [filepath],
    outfile,
    ...esbuildConfigs,
  });
}

/**
 * Attempt to get the state from the given TypeScript `filepath` file.
 * @param {string} filepath The state file's filepath. This will be converted to
 * JavaScript, saved to disk, and dynamically imported to get the `state`
 * variable or default export value.
 * @returns The value of the `state` variable or default export.
 */
async function getStateFromTypeScriptFile(filepath) {
  help.log(
    `State file is a TypeScript file`,
    `Using esbuild to bundle ${filepath}`,
  );

  const tmpFilepath = filepath + ".tmp.js";

  await bundleTypeScriptFile(filepath, tmpFilepath);

  const state = await getStateFromJavaScriptFile(tmpFilepath);

  fs.unlinkSync(tmpFilepath);

  return state;
}

/**
 * Attempt to get the state from the given JavaScript `filepath` file.
 * @param {string} filepath The state file's filepath. This will be dynamically
 * imported to get the `state` variable or default export value.
 * @returns The value of the `state` variable or default export.
 */
async function getStateFromJavaScriptFile(filepath) {
  help.log(`Importing ${filepath}`);

  const imported = await import(path.join(process.cwd(), filepath));

  help.log(`Using \`\state\`\ variable (if it exists)`);

  let state = imported.state;

  if (!state) {
    help.log(
      `Variable \`state\` does not exist. Using \`default\` import value instead.`,
    );
    state = imported.default;
  }

  return state;
}
