const Discord = require("discord.js");
const snowflake = require("@pwldev/discord-snowflake");
const fs = require("node:fs");
const path = require("node:path")
const { countryballs } = require("../config/countryballs.json")
const { player, metrics } = require("../handlers/database");
const { settings } = require("../handlers/config.js");

var spawns = new Map();

function getRandom() {
    var total = 0; // Weighted values
 
    for (var i = 0; i < countryballs.length; i++) {
        total += countryballs[i].rarity;
    }

    // Calcular
    const threshold = Math.random() * total;

    total = 0; // Resetear total
    for (var i = 0; i < countryballs.length; i++) {
        total += countryballs[i].rarity;

        if (total > threshold) {
            return countryballs[i]; 
        }
    }   
}

/**
 * Spawns a random countryball
 * @param {Discord.TextBasedChannel} channel
 */
async function spawnRandom(channel) {
    var cb = getRandom();
    var code = snowflake.generate(Date.now()); 
    var components = new Discord.ActionRowBuilder();
    var button = new Discord.ButtonBuilder({
        label: "Catch me!",
        style: Discord.ButtonStyle.Primary, 
        custom_id: `catch_${code}`
    });

    components.addComponents(button);

    var file = new Discord.AttachmentBuilder(fs.readFileSync(path.resolve(`./assets/spawn/${cb.names[0]}.png`))) 
    var message = await channel.send({ content: `A wild ${settings["collectible-name"]} appeared!`, components: [components], files: [file] })

    spawns.set(message.id, cb);

    setTimeout(() => {
        if (spawns.has(message.id)) { 
            var components = new Discord.ActionRowBuilder();
            var button = new Discord.ButtonBuilder({
                label: "Catch me!",
                style: Discord.ButtonStyle.Primary,
                custom_id: "despawned_ball",
                disabled: true
            });
        
            components.addComponents(button);

            if (message) {
                
                message.edit({content: `A wild ${settings["collectible-name"]} appeared!`, components: [components] });
            } 
        }
    }, (3 * 60000));
}

/**
 * Send modal
 * @param {Discord.ButtonInteraction} response 
 */
async function sendModal(response, countryball) {
    var modal = new Discord.ModalBuilder()
    .setTitle(`Catch this ${settings["collectible-name"]}`)    
    .setCustomId(`catch_modal`);
    
    var input = new Discord.TextInputBuilder()
    .setLabel(`Name of the ${settings["collectible-name"]}`)
    .setStyle(Discord.TextInputStyle.Short)
    .setCustomId("catch_value")
    .setValue("")
    .setRequired(true);

    var row = new Discord.ActionRowBuilder().addComponents(input);

    modal.addComponents(row);

    await response.showModal(modal);
} 

/**
 *  Performs a catched countryball
 * @param {Discord.ModalSubmitInteraction} response
 */
async function performCatch(response, countryball) {
    spawns.delete(response.message.id);
    
    await response.deferReply();

    var hp = Math.round(Math.random() * (20 - -20)) + -20;
    var atk = Math.round(Math.random() * (20 - -20)) + -20;
    var shiny = (Math.round(Math.random() * (2048 - 1)) + 1) == 1;

    var components = new Discord.ActionRowBuilder();
    var button = new Discord.ButtonBuilder({
        label: "Catch me!",
        style: Discord.ButtonStyle.Primary,
        custom_id: "catched_ball",
        disabled: true
    });

    components.addComponents(button);

    var countryballId = Number(await metrics.get("count"));
    if (!countryballId) {
        countryballId = 1; 
    } else {
        countryballId++;
    }

    var countryballList = await player.get(response.user.id);

    if (!countryballList) {
        countryballList = [{
            "id": countryballId,
            "countryball": countryball,
            "hp": hp,
            "atk": atk,
            "shiny": shiny,
            "date": Math.round(Date.now() / 1000)
        }]; 
    } else {
        countryballList.push({
            "id": countryballId,
            "countryball": countryball,
            "hp": hp,
            "atk": atk,
            "shiny": shiny,
            "date": Math.round(Date.now() / 1000)
        });
    }

    player.set(response.user.id, countryballList);
    
    metrics.set("count", countryballId);
 
    await response.message.edit({ components: [components] });
    await response.editReply(`<@${response.user.id}>, you caught **${countryball.renderedName}**! (\`#${countryballId.toString(16)}, ${hp}/${atk}\`)`);
} 

module.exports = { getRandom, spawnRandom, sendModal, performCatch, spawns }