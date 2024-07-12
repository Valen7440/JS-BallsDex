const Discord = require("discord.js");
const { player } = require("../../handlers/database.js"); 
const { drawCard } = require("../../utils/card");
const { settings } = require("../../handlers/config.js");

const snowflake = require("@pwldev/discord-snowflake"); 

module.exports = {
    name: settings["command-name"], 
    category: "dex",
    description: "Balls",
    args: false,
    cmd: new Discord.SlashCommandBuilder()
    .setName(settings["command-name"]).setDescription("Collectibles")
    .addSubcommand(s => s.setName("info").setDescription(`View info of a ${settings["collectible-name"]}`).addIntegerOption(o => o.setName(settings["collectible-name"]).setDescription(`${settings["collectible-name"]} to inspect`).setAutocomplete(true).setRequired(true)))
    .addSubcommand(s => s.setName("last").setDescription(`View you last catched ${settings["collectible-name"]}`))
    .addSubcommand(s => s.setName("completion").setDescription("View your completion").addUserOption(u => u.setName("user").setDescription("User to view completion").setRequired(false)))
    .addSubcommand(s => s.setName("list").setDescription(`List your ${settings["collectible-name"]}s`).addUserOption(o => o.setName("user").setDescription(`User to inspect ${settings["collectible-name"]}s`).setRequired(false)))
    .addSubcommand(s => s.setName("favorite").setDescription(`Set a ${settings["collectible-name"]} as favorite`).addIntegerOption(o => o.setName(settings["collectible-name"]).setDescription(`${settings["collectible-name"]} to inspect`).setAutocomplete(true).setRequired(true)))
    .addSubcommand(s => s.setName("give").setDescription(`Give a ${settings["collectible-name"]} to a user.`).addUserOption(o => o.setName("user").setDescription("User to give.").setRequired(true)).addIntegerOption(o => o.setName(settings["collectible-name"]).setDescription(`${settings["collectible-name"]} to inspect`).setAutocomplete(true).setRequired(true))),
    run: () => { return },
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.ChatInputCommandInteraction} interaction 
     */
    runSlash: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand()

        if (subcommand == "info") {
            const ballId = interaction.options.getInteger(settings["collectible-name"], true);
            var currentPlayer = await player.get(interaction.user.id);
    
            if (!currentPlayer) {
                return await interaction.reply({ content: `You haven't collected any ${settings["collectible-name"]} yet.` });
            }
    
            const currentBall = currentPlayer.find((b) => b.id == ballId);

            if (!currentBall) {
                return await interaction.reply({ content: `That ${settings["collectible-name"]} was not found, try to use the autocomplete function.`, ephemeral: true });
            }

            await interaction.deferReply();
    
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
    
            return await interaction.editReply({ files: [cardAttachment], content: `ID: \`#${currentBall.id.toString(16)}\`\nCaught on <t:${currentBall.date ?? Math.round(Date.now() / 1000)}:F> (<t:${currentBall.date ?? Math.round(Date.now() / 1000)}:R>)${currentBall.trade ? `\nObtained by a trade with <@${currentBall.trade}>` : ""}\n\nHP: ${hp} (${currentBall.hp >= 0 ? "+" : ""}${currentBall.hp}%)\nATK: ${atk} (${currentBall.atk >= 0 ? "+" : ""}${currentBall.atk}%) ` });
        }

        if (subcommand == "last") {            
            var currentPlayer = await player.get(interaction.user.id);

            if (!currentPlayer) {
                return await interaction.reply({ content: `You haven't collected any ${settings["collectible-name"]} yet.` });
            }

            const currentBall = currentPlayer[currentPlayer.length - 1];
    
            if (!currentBall) {
                return await interaction.reply({ content: `No ${settings["collectible-name"]} was found.`, ephemeral: true });
            }

            await interaction.deferReply();
    
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
            
            return await interaction.editReply({ files: [cardAttachment], content: `ID: \`#${currentBall.id.toString(16)}\`\nCaught on <t:${currentBall.date ?? Math.round(Date.now() / 1000)}:F> (<t:${currentBall.date ?? Math.round(Date.now() / 1000)}:R>)${currentBall.trade ? `\nObtained by a trade with <@${currentBall.trade}>` : ""}\n\nHP: ${hp} (${currentBall.hp >= 0 ? "+" : ""}${currentBall.hp}%)\nATK: ${atk} (${currentBall.atk >= 0 ? "+" : ""}${currentBall.atk}%) ` });
        }

        if (subcommand === "completion") {
            const mentionUserId = interaction.options.get("user")?.value;
            const targetUserId = mentionUserId || interaction.member.id;
            const targetUserObj = await interaction.guild.members.fetch(targetUserId)

            const currentPlayer = await player.get(targetUserId); 
            const { countryballs } = require("../../config/countryballs.json");

            await interaction.deferReply();

            var cbNames = [];
            var gotNames = [];
            var cbText = "";
            var gotText = "";

            if (currentPlayer) {
                for (const collected of currentPlayer) {
                    const cbName = collected.countryball.names[0];

                    if (!gotNames.includes(cbName)) { 
                        gotNames.push(cbName);

                        const emoji = client.emojis.cache.get(collected.countryball.emoji);
                        gotText += `${emoji}`;
                    }
                }
            } else {
                gotText = `You haven't collected any ${settings["collectible-name"]} yet.`;
            }

            for (const countryball of countryballs) {
                if (!gotNames.includes(countryball.names[0])) {
                    cbNames.push(countryball.names[0]);

                    const emoji = client.emojis.cache.get(countryball.emoji);
                    cbText += `${emoji}`;
                }
            }

            if (cbNames.length == 0) {
                cbText = `:tada: **__Congrats, you collected all the ${settings["collectible-name"]}s__** :tada:`
            }
            

            const percentage = (gotNames.length * 100 / countryballs.length).toFixed(2);

            const embed = new Discord.EmbedBuilder()
            .setAuthor({ name: targetUserObj.user.displayName, iconURL: targetUserObj.user.displayAvatarURL({ size: 512 }) })
            .setColor(Discord.Colors.Blurple)
            .setDescription(`${settings["bot-name"]} progression: *${percentage}%*\n\n**__Owned ${settings["collectible-name"]}s__**\n${gotText}\n\n${gotNames.length >= countryballs.length ? "" : `**__Missing ${settings["collectible-name"]}s__**\n`}${cbText}`)
            
            return await interaction.editReply({ embeds: [embed] });
        }

        if (subcommand == "list") {
            const user = interaction.options.getUser("user") ?? interaction.user;
            const currentPlayer = await player.get(user.id);

            if (!currentPlayer) {
                return await interaction.reply({ content: `That user does not have any ${settings["collectible-name"]}s.`, ephemeral: true });
            }

            await interaction.deferReply();

            var cbOptions = [];
            
            const cbMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId(`list_${user.id}`);

            for (var ball of currentPlayer) {
                if (!ball?.countryball) {
                    continue;
                }

                var atk = 0;
                var hp = 0;
                if (ball.atk > 0) {
                    atk = ball.countryball.defaultAtk * ((ball.atk / 100) + 1);
                } else {
                    atk = ball.countryball.defaultAtk * (1 - (Math.abs(ball.atk) / 100));
                }
                
                if (ball.hp > 0) {
                    hp = ball.countryball.defaultHp * ((ball.hp / 100) + 1);
                } else {
                    hp = ball.countryball.defaultHp * (1 - (Math.abs(ball.hp) / 100));
                }
            
                atk = Math.floor(atk);
                hp = Math.floor(hp);

                const emoji = client.emojis.cache.get(ball.countryball.emoji);

                const cbOption = {
                    label: `${ball.favorite ? "❤️ " : ""}${(ball.shiny ? "✨ " : "")} ${ball.countryball.renderedName}`,
                    value: `${ball.id}`,
                    description: `#${ball.id.toString(16)} HP: ${hp} (${ball.hp >= 0 ? "+" : ""}${ball.hp}%)\nATK: ${atk} (${ball.atk >= 0 ? "+" : ""}${ball.atk}%)`,
                    emoji: `${emoji}`
                }

                if (ball?.favorite) {
                    cbOptions.unshift(cbOption);
                } else {
                    cbOptions.push(cbOption);
                }
            }

            if (cbOptions.length > 25) {
                cbOptions = cbOptions.slice(0, 25);
            }

            cbMenu.addOptions(cbOptions); 
            const actions = generateListButtons(currentPlayer);
            const row2 = new Discord.ActionRowBuilder().addComponents(cbMenu)

            if (currentPlayer.length > 25) {
                const response = await interaction.editReply({ content: `Viewing <@${user.id}>'s ${settings["collectible-name"]}s.`, components: [actions, row2] })
                await generateListResponse(interaction, response, currentPlayer, user.id);
            } else {
                return await interaction.editReply({ content: `Viewing <@${user.id}>'s ${settings["collectible-name"]}s.`, components: [row2] });
            }
        }

        if (subcommand == "favorite") {
            const ballId = interaction.options.getInteger(settings["collectible-name"], true);
            var currentPlayer = await player.get(interaction.user.id);
            var currentBall = undefined;
    
            if (!currentPlayer) {
                return await interaction.reply({ content: `You haven't collected any ${settings["collectible-name"]} yet.`, ephemeral: true });
            }
    
            for (var ball of currentPlayer) {
                if (ball.id == ballId) {
                    currentBall = ball;
                }
            }

            await interaction.deferReply();
            const index = currentPlayer.indexOf(currentBall);
    
            if (!currentBall || index == -1) {
                return await interaction.editReply({ content: `No ${settings["collectible-name"]} was found, use the autocomplete function.`, ephemeral: true });
            }

            if (currentBall["favorite"]) {
                currentBall["favorite"] = false;
            } else {
                currentBall["favorite"] = true;
            }

            currentPlayer[index] = currentBall;

            const emoji = client.emojis.cache.get(currentBall.countryball.emoji);

            try {
                await player.set(interaction.user.id, currentPlayer);
                return await interaction.editReply({ content: `Successfully ${currentBall["favorite"] ? "set" : "unset"} \`#${currentBall.id.toString(16)}\` ${emoji} **${currentBall.countryball.renderedName}** as favorite.` });
            } catch (error) {
                console.error(error);
                return await interaction.editReply({ content: "Something went wrong, please retry in a moment." });
            }
        }

        if (subcommand == "give") {
            const user = interaction.options.getUser("user", true);
            const ballId = interaction.options.getInteger(settings["collectible-name"], true);

            const oldPlayer = await player.get(interaction.user.id);
            const newPlayer = await player.get(user.id);

            if (user.bot) {
                return await interaction.reply({content: `You can't give ${settings["collectible-name"]}s to bots.`, ephemeral: true})
            }

            if (interaction.user === user) {
                return await interaction.reply({content: `You can't give ${settings["collectible-name"]}s to yourself.`, ephemeral: true})
            }

            if (!oldPlayer) {
                return await interaction.reply({ content: `<@${interaction.user.id}> has any ${settings["collectible-name"]}s yet.`, ephemeral: true });
            }

            const currentBall = oldPlayer.find((b) => b.id == ballId);

            await interaction.deferReply();
            const index = oldPlayer.indexOf(currentBall);

            if (!currentBall || index == -1) {
                return await interaction.reply({ content: `That ${settings["collectible-name"]} was found, use the autocomplete function.`, ephemeral: true });
            }

            // Reset ball values.
            currentBall["trade"] = interaction.user.id;
            currentBall["favorite"] = false;

            // Perform trade
            oldPlayer.splice(index, 1);

            await player.set(interaction.user.id, oldPlayer);
            
            if (newPlayer) {
                newPlayer.push(currentBall); 
                await player.set(user.id, newPlayer);
            } else {
                const newArray = [];
                newArray.push(currentBall);
                await player.set(user.id, newArray);
            }

            const emoji = client.emojis.cache.get(currentBall.countryball.emoji);

            await interaction.editReply({ content: `You gave \`#${currentBall.id.toString(16)}\` ${emoji} **${currentBall.countryball.renderedName}** to <@${user.id}>!` })
        }
    },
    /**
     * Autocompletion
     * @param {Discord.Client} client 
     * @param {Discord.AutocompleteInteraction} interaction 
     */
    autocomplete: async (client, interaction) => {
        var focused = interaction.options.getFocused();
        var currentPlayer = await player.get(interaction.user.id);

        var cbArray = []

        if (!currentPlayer || currentPlayer.length <= 0) {
            return await interaction.respond([]);
        }

        for (var ball of currentPlayer) {
            const renderedName = String(ball.countryball.renderedName).toLowerCase();
            if (renderedName.startsWith(focused)) {
                const option = {
                    name: `${ball.favorite ? "❤️ " : ""}${(ball.shiny ? "✨ " : "")} #${parseInt(ball.id).toString(16)} ${ball.countryball.renderedName} ATK: ${ball.atk}% HP: ${ball.hp}%`,
                    value: ball.id 
                }
                
                if (ball?.favorite) {
                    cbArray.unshift(option);
                } else {
                    cbArray.push(option);
                }
            } 
        }

        if (cbArray.length > 25) {
            cbArray = cbArray.slice(0, 25);
        }

        return await interaction.respond(cbArray); 
    }   
}

function generateListButtons(data, response, page = 0) {
    if (!data) {
        return;
    }

    const sections = Math.floor(data.length / 25);

    const row = new Discord.ActionRowBuilder();

    const prevButton = new Discord.ButtonBuilder()
    .setCustomId(`prev_${page}`) 
    .setLabel("«") 
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled((page == 0))

    const nextButton = new Discord.ButtonBuilder()
    .setCustomId(`next_${page}`) 
    .setLabel("»") 
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled((page == sections));
    
    row.addComponents(prevButton);
         
    for (var i = (page - 1); i < (page + 2); i++) {
        const button = new Discord.ButtonBuilder()
        .setCustomId(`page_${i}`)
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel((i + 1).toString())

        if (i == page || i > sections) {
            button.setDisabled(true);
        }

        if (i == page) {
            button.setStyle(Discord.ButtonStyle.Secondary);
        }

        if (i < 0 || i > sections) {
            button.setLabel("...").setDisabled(true)
        }

        row.addComponents(button);
    }

    row.addComponents(nextButton);
    return row;
}

/**
 * @param {Discord.Interaction} interaction
 * @param {Discord.Message} response
 */
async function generateListResponse(interaction, response, data, userId){
    const sections = Math.floor(data.length / 25);

    const filter = (i) => i.user.id == interaction.user.id;

    try {
        const collected = await response.awaitMessageComponent({ time: 180000, filter: filter });

        if (collected.isButton()) {
            const page = parseInt(collected.customId.split("_")[1])

            if (collected.customId.startsWith("prev")) {
                const { newRow, menuRow } = await updateList(collected, 0);
                const button = await collected.update({ components: [newRow, menuRow] });
                generateListResponse(collected, button, data, userId);
            }

            if (collected.customId.startsWith("next")) {
                const { newRow, menuRow } = await updateList(collected, sections);
                const button = await collected.update({ components: [newRow, menuRow] });
                generateListResponse(collected, button, data, userId);
            }

            if (collected.customId.startsWith("page")) {
                const { newRow, menuRow } = await updateList(collected, page);
                const button = await collected.update({ components: [newRow, menuRow] });
                generateListResponse(collected, button, data, userId);
            }

        }

        if (collected.isStringSelectMenu()) {
            generateListResponse(collected, response, data, userId)
        }
    } catch (e) {
        console.error(e);
    }

    async function updateList(collect, page) {
        const newRow = generateListButtons(data, response, page);

        var chunks = [];
        for (var i = 0; i < data.length; i += 25) {
            chunks.push(data.slice(i, i + 25));
        }

        console.log(data.length, chunks.length)

        var cbOptions = [];
                
        const cbMenu = new Discord.StringSelectMenuBuilder()
        .setCustomId(`list_${userId}`); 

        var chunkedPlayer = chunks[page];
        for (var ball of chunkedPlayer) {
            if (!ball?.countryball) {
                continue;
            }
            
            var atk = 0;
            var hp = 0;
            if (ball.atk > 0) {
                atk = ball.countryball.defaultAtk * ((ball.atk / 100) + 1);
            } else {
                atk = ball.countryball.defaultAtk * (1 - (Math.abs(ball.atk) / 100));
            }
            
            if (ball.hp > 0) {
                hp = ball.countryball.defaultHp * ((ball.hp / 100) + 1);
            } else {
                hp = ball.countryball.defaultHp * (1 - (Math.abs(ball.hp) / 100));
            }
        
            atk = Math.floor(atk);
            hp = Math.floor(hp);

            const emoji = interaction.client.emojis.cache.get(ball.countryball.emoji)

            const cbOption = {
                label: `${ball.favorite ? "❤️ " : ""}${(ball.shiny ? "✨ " : "")} ${ball.countryball.renderedName}`,
                value: `${ball.id}`,
                description: `#${ball.id.toString(16)} HP: ${hp} (${ball.hp >= 0 ? "+" : ""}${ball.hp}%)\nATK: ${atk} (${ball.atk >= 0 ? "+" : ""}${ball.atk}%)`,
                emoji: `${emoji}`
            }

            if (ball?.favorite) {
                cbOptions.unshift(cbOption);
            } else {
                cbOptions.push(cbOption);
            }
        }

        cbMenu.setOptions(cbOptions);

        const menuRow = new Discord.ActionRowBuilder(); 
        menuRow.addComponents(cbMenu);
        
        return { newRow, menuRow };
    }
}
