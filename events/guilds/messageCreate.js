const Discord = require("discord.js")

const ownerIds = ["626928937355706373", "1072942897680371713"]
const prefix = "t."

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 */
module.exports = (client, message) => {
    if (message.author.bot) return;

    if (!message.guildId && message.content.toLowerCase().replace(" ","").startsWith(prefix)) return message.reply({content: "Lo siento, no puedes usarme en DM.\nSi deseas añadirme a un servidor, da clic en mi perfil y pulsa Añadir a servidor."})
    if (!message.content.toLowerCase().replace(" ","").startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command) || client.commands.find(cmd => cmd.alias && cmd.alias.includes(command));
    if (!cmd) return;

    if (cmd.ownerOnly) {
        if (!ownerIds.includes(message.author.id)) return;
    }

    try {   
        cmd.run(client, message, args);
    } catch (e) {
        message.reply({content: `Se produjo un error al ejecutar el comando. Contacte al desarrollador para resolver el problema.`})
        console.warn(e);
    }
}