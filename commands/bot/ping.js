const Discord = require("discord.js")

module.exports = {
    name: "ping",
    category: "bot",
    description: "Mira la latencia del bot",
    args: false,
    cmd: new Discord.SlashCommandBuilder()
    .setName("ping")
    .setDescription("Mira la latencia del bot."),
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Message} message 
     */
    run: (client, message) => {
        return message.reply({content: `\`${client.ws.ping}ms\``})
    },
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.CommandInteraction} interaction 
     */
    runSlash: (client, interaction) => {
        // const member = Discord.PresenceUpdateStatus
        // const user = interaction.member

        // const estado = user.presence.status || "Offline"

        return interaction.reply({content: `\`${client.ws.ping}ms\``})
    }
}