const { Keyv } = require("keyv");
const { KeyvSqlite } = require("@keyv/sqlite")
const path = require("node:path");

const data_sqlite = new KeyvSqlite(`sqlite://${path.resolve("./data/data.sqlite")}`);
const config_sqlite = new KeyvSqlite(`sqlite://${path.resolve("./data/config.sqlite")}`);
const player_sqlite = new KeyvSqlite(`sqlite://${path.resolve("./data/player.sqlite")}`);
const metrics_sqlite = new KeyvSqlite(`sqlite://${path.resolve("./data/metrics.sqlite")}`);

const data = new Keyv({ store: data_sqlite });
const config = new Keyv({ store: config_sqlite });
const player = new Keyv({ store: player_sqlite });
const metrics = new Keyv({ store: metrics_sqlite });

module.exports = { data, config, metrics, player };
