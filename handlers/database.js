const Keyv = require("keyv");
const path = require("node:path");

const data = new Keyv(`sqlite://${path.resolve("./data/data.sqlite")}`);
const config = new Keyv(`sqlite://${path.resolve("./data/config.sqlite")}`);
const player = new Keyv(`sqlite://${path.resolve("./data/player.sqlite")}`);
const metrics = new Keyv(`sqlite://${path.resolve("./data/metrics.sqlite")}`);

module.exports = { data, config, metrics, player };
