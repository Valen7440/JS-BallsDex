const Discord = require("discord.js");
const { sendModal, performCatch, spawns } = require("../../utils/countryball");
const { drawCard } = require("../../utils/card");
const { player } = require("../../handlers/database.js");
const { settings } = require("../../handlers/config.js");

const snowflake = require("@pwldev/discord-snowflake");

/**
 * @param {Discord.Client} client
 * @param {Discord.Interaction} interaction
 */
module.exports = async (client, interaction) => {
    if (!interaction.guild || !interaction.channel) return;

    if (interaction.isButton()) {
        if (interaction.customId.startsWith("catch")) {
            var cb = spawns.get(interaction.message.id);
            if (!cb) {
                return await interaction.reply({ content: `<@${interaction.user.id}>, ya fui atrapado.` });
            }

            sendModal(interaction, cb);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId == "catch_modal") {
            var cb = spawns.get(interaction.message.id);
            if (!cb) {
                return await interaction.reply({ content: `<@${interaction.user.id}>, I was caught already!` });
            }

            var givenName = interaction.fields.getTextInputValue("catch_value")
            .toLowerCase()
            .replace(" ", "");
            
            if (cb.names.includes(givenName)) {
                performCatch(interaction, cb);
            } else {
                return await interaction.reply({
                    content: `<@${interaction.user.id}> Wrong name!`, components: []
                });
            }
        }
    }

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith("list_")) {
            const userId = interaction.customId.split("_")[1];

            await interaction.deferReply();

            const ballId = parseInt(interaction.values[0]);
            const currentPlayer = await player.get(userId);

            if (!currentPlayer) {
                return await interaction.editReply({ content: `<@${userId}>, you don't have any ${settings["collectible-name"]}s yet`, ephemeral: true }); 
            }

            const currentBall = currentPlayer.find((b) => b.id == ballId);

            if (!currentBall) {
                return await interaction.editReply({ content: `This ${settings["collectible-name"]} was not found.` });
            }

            const card = await drawCard(
                currentBall,
                currentBall.countryball.names[0],
                currentBall.countryball.regime ?? "democracy",
                currentBall.countryball.economy ?? "capitalist",
            );

            var atk = 0;
            var hp = 0;
            if (currentBall.atk > 0) {
                atk = currentBall.countryball.defaultAtk * ((currentBall.atk / 100) + 1);
            } else {
                atk = currentBall.countryball.defaultAtk * (1 - (Math.abs(currentBall.atk) / 100));
            }
            
            if (currentBall.hp > 0) {
                hp = currentBall.countryball.defaultHp * ((currentBall.hp / 100) + 1);
            } else {
                hp = currentBall.countryball.defaultHp * (1 - (Math.abs(currentBall.hp) / 100));
            }
        
            atk = Math.floor(atk);
            hp = Math.floor(hp);
            
            const fileId = snowflake.generate(Date.now());
            const cardAttachment = new Discord.AttachmentBuilder(card, { name: `card_${fileId}.png` });
    
            return await interaction.editReply({ files: [cardAttachment], content: `ID: \`#${currentBall.id.toString(16)}\`\nObtenido el <t:${currentBall.date ?? Math.round(Date.now() / 1000)}:F>${currentBall.trade ? `\nObtenido por tradeo con <@${currentBall.trade}>` : ""}\n\nHP: ${hp} (${currentBall.hp >= 0 ? "+" : ""}${currentBall.hp}%)\nATK: ${atk} (${currentBall.atk >= 0 ? "+" : ""}${currentBall.atk}%) ` });
        }
    }

    if (interaction.isAutocomplete()) {
        const comando = client.slashcommands.get(interaction?.commandName);

        if (comando) {
            try {
                comando.autocomplete(client, interaction);
            } catch (e) {
                interaction.respond([]);
                console.log(e);
                return;
            }
        }
    }

    if (interaction.isChatInputCommand()) {
        const comando = client.slashcommands.get(interaction?.commandName);


        if (comando) {
            try {
                comando.runSlash(client, interaction, "/")
            } catch (e) {
                interaction.reply({content: "An error occured while trying to run this command.\nContact support if this persists.", ephemeral: true});
                console.log(e);
                return;
            }
        }
    }
}
