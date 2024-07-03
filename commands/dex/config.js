const Discord = require("discord.js")
const { config } = require("../../handlers/database.js");
const { cooldowns, intervals } = require("../../utils/spawner.js");

module.exports = {
    name: "config",
    category: "dex",
    description: "Configura a Testdex",
    args: false,
    cmd: new Discord.SlashCommandBuilder() 
        .setName("config")
        .setDescription("Configura a TestDex") 
        .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild)
        .addSubcommandGroup(s => s
            .setName("testdex")
            .setDescription("Configurar TestDex")
            .addSubcommand(e => e
                .setName("enable")
                .setDescription("Habilita a TestDex.")
                .addChannelOption(c => c.setName("channel").setDescription("Canal en el cuál aparecerá las balls.").setRequired(true))
                .addIntegerOption(i => i.setName("interval").setDescription("Intervalo de aparición (Minimo: 1, Máximo: 1440, Por defecto: 10).").setMinValue(1).setMaxValue(1440).setRequired(false))
            )
            .addSubcommand(d => d
                .setName("disable")
                .setDescription("Deshabilita a TestDex.")
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

        if (option === "testdex") {
            if (options === "enable") {
                await config.set(interaction.guildId, {
                    "channel": channel.id,
                    "interval": interval
                });

                intervals.set(interaction.guildId, (interval * 60))
                cooldowns.set(interaction.guildId, Math.round(Date.now() / 1000) + (interval * 60)) 
                
                return await interaction.reply({
                    embeds: [{
                        author: {name: "TestDex", icon_url: `${client.user.displayAvatarURL({size: 1024})}`},
                        title: "TestDex activado",
                        description: `TestDex se habilitó correctamente en el canal ${channel} cada **${interval}** minuto(s).`,
                    }] 
                });
            }
            if (options === "disable") {
                await config.delete(interaction.guildId);

                intervals.delete(interaction.guildId);
                cooldowns.delete(interaction.guildId);  

                return await interaction.reply({
                    embeds: [{
                        author: {name: "TestDex", icon_url: `${client.user.displayAvatarURL({size: 1024})}`},
                        title: "TestDex deshabilitado",
                        description: "Gracias por utilizar TestDex. Vuelve pronto a utilizarlo."
                    }]
                });
            }
        }
    }
}