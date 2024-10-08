const Discord = require("discord.js")
const { config } = require("../../handlers/database.js");
const { spawners, intervals } = require("../../utils/spawner.js");
const { settings } = require("../../handlers/config.js");

module.exports = {
    name: "config",
    category: "dex",
    description: "Configure BallsDex",
    args: false,
    cmd: new Discord.SlashCommandBuilder() 
        .setName("config")
        .setDescription(`Set up ${settings["bot-name"]}`) 
        .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
        .addSubcommandGroup(s => s
            .setName(settings["bot-name"].toLowerCase())
            .setDescription(`Set up ${settings["bot-name"]}`)
            .addSubcommand(e => e
                .setName("enable")
                .setDescription(`Enable ${settings["bot-name"]}`)
                .addChannelOption(c => c.setName("channel").setDescription("Channel to spawn.").setRequired(true))
                .addIntegerOption(i => i.setName("interval").setDescription("Interval for spawning (Min: 1, Max: 1440, Default: 10).").setMinValue(1).setMaxValue(1440).setRequired(false))
            )
            .addSubcommand(d => d
                .setName("disable")
                .setDescription(`Disabled ${settings["bot-name"]}`)
            )
    ),
    run: () => { return },
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.CommandInteraction} interaction 
     */
    runSlash: async (client, interaction) => {
        const option = interaction.options.getSubcommandGroup();
        const options = interaction.options.getSubcommand();

        const channel = interaction.options.get("channel")?.channel;
        const interval = interaction.options.get("interval")?.value ? parseInt(interaction.options.get("interval")?.value) : 10;

        if (option === settings["bot-name"].toLowerCase()) {
            if (options === "enable") {
                await config.set(interaction.guildId, {
                    "channel": channel.id,
                    "interval": interval
                });

                intervals.set(interaction.guildId, (interval * 60))
                spawners.set(interaction.guildId, {
                    "snowflake": Math.round(Date.now() / 1000) + (interval * 60),
                    "channel": channel.id
                });
                
                return await interaction.reply({
                    embeds: [{
                        author: {name: settings["bot-name"], icon_url: `${client.user.displayAvatarURL({size: 1024})}`},
                        title: `${settings["bot-name"]} enabled`,
                        description: `${settings["bot-name"]} successfully enabled in channel ${channel} every **${interval}** minute(s).`,
                    }] 
                });
            }
            if (options === "disable") {
                await config.delete(interaction.guildId);

                intervals.delete(interaction.guildId);
                spawners.delete(interaction.guildId);  

                return await interaction.reply({
                    embeds: [{
                        author: {name: settings["bot-name"], icon_url: `${client.user.displayAvatarURL({size: 1024})}`},
                        title: `${settings["bot-name"]} disabled`,
                        description: `Thanks for using ${settings["bot-name"]}. Come back soon.`
                    }]
                });
            }
        }
    }
}