const fs = require("node:fs");

const packageJson = fs.readFileSync("./package.json");
const json = JSON.parse(packageJson);

const {
    devDependencies,
    scripts,
    ...rest
} = json;

fs.writeFileSync("./lib/package.json", JSON.stringify(rest, null, 2));
