const fs = require("node:fs");
const path = require("node:path");
const YAML = require("js-yaml");

const config = YAML.load(fs.readFileSync(path.resolve("./config.yml"), 'utf-8'));

module.exports = { config };