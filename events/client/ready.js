const Discord = require("discord.js");
const path = require("node:path")

const { spawnManager } = require("../../utils/spawner.js");
/**
 * Ready event
 * @param {Discord.Client} client 
 */
module.exports = client => {
    console.log(`Se inició sesión como ${client.user.tag}`)
    setTimeout(() => console.info(`El bot está conectado en ${client.guilds.cache.size} servidores.`), 15000)

    spawnManager(client);
}