const Discord = require("discord.js");
const { spawnRandom } = require("./countryball");
const { config } = require("../handlers/database");
const { randInt } = require("./utils")

const cooldowns = new Map();
const intervals = new Map(); 

function resetCooldown(guild) {

}

let print = (value) => {
    console.log(`${value}`)
} 

/**
 * BallsDex Spawn Manager
 * @param {Discord.Client} client 
 */
async function spawnManager(client) {
    client.guilds.cache.forEach(async (guild) => {
        // Reducir tiempo muerto del bot
        var gainCalc = randInt(60, 80) / 100; // este porcentaje reduce de un 30 a 50% el primer spawn para no tener muchos tiempos muertos

        var data = await config.get(guild.id);
        if (!data) return;

        var interval = parseInt(data.interval) 

        intervals.set(guild.id, (interval * 60))
        cooldowns.set(guild.id, (Math.round(Date.now() / 1000) + ((interval * 60) * gainCalc))) 
    });

    client.on("messageCreate", (message) => {
        if (message.author.bot) return;

        if (!cooldowns.has(message.guildId)) {
            return; 
        }

        var cooldown = cooldowns.get(message.guildId);
        console.log("Cooldown", cooldowns.get(message.guildId))
        
        let delta = (cooldown - Math.floor(message.createdTimestamp / 1000));
        console.log(delta)

        if (delta < 0) {
            var interval = intervals.get(message.guildId);
            cooldowns.set(message.guildId, Math.round(Date.now() / 1000) + interval); 

            setTimeout(() => {
                spawnRandom(message.channel);
            }, randInt(3, 7) * 1000);
        }
    }); 
}

module.exports = { spawnManager, cooldowns, intervals };