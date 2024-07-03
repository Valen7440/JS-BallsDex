const Discord = require("discord.js");
const path = require("node:path")

const { spawnManager } = require("../../utils/spawner.js");
/**
 * Ready event
 * @param {Discord.Client} client 
 */
module.exports = client => {
    console.log(`Logged in as ${client.user.tag}`)
    setTimeout(() => console.info(`Connected in ${client.guilds.cache.size} guilds.`), 15000)

    spawnManager(client);
}