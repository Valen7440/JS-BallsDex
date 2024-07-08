const Discord = require("discord.js");
const { spawnRandom } = require("./countryball");
const { config } = require("../handlers/database");
const { randInt } = require("./utils")

const channels = new Map();
const spawners = new Map();
const intervals = new Map(); 

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
        spawners.set(guild.id, {
            cooldown: (Math.round(Date.now() / 1000) + ((interval * 60) * gainCalc)),
            channel: data.channel
        });
    });

    client.on("messageCreate", (message) => {
        if (message.author.bot) return;

        if (!spawners.has(message.guildId)) {
            return; 
        }

        var cooldown = spawners.get(message.guildId).cooldown;
        var channel = spawners.get(message.guildId).channel;

        if (channel != message.channel.id) {
            return;
        }

        let delta = (cooldown - Math.floor(message.createdTimestamp / 1000));

        if (delta < 0) {
            var interval = intervals.get(message.guildId);
            spawners.set(message.guildId, {
                cooldown: Math.round(Date.now() / 1000) + interval,
                channel: channel
            }); 

            setTimeout(() => {
                spawnRandom(message.channel);
            }, randInt(3, 7) * 1000);
        }
    }); 
}

module.exports = { spawnManager, spawners, intervals };