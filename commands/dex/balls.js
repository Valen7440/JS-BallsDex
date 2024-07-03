const Discord = require("discord.js");
const { Canvas } = require("canvas");
const { player } = require("../../handlers/database.js"); 
const { drawCard } = require("../../utils/card");
const snowflake = require("@pwldev/discord-snowflake"); 


const path = require("node:path");
const fs = require("node:fs");

module.exports = {
    name: "balls", 
    category: "dex",
    description: "Balls",
    args: false,
    cmd: new Discord.SlashCommandBuilder()
    .setName("balls").setDescription("BallsDex Collectibles")
    .addSubcommand(s => s.setName("info").setDescription("View info of a countryball").addIntegerOption(o => o.setName("ball").setDescription("Ball to inspect").setAutocomplete(true).setRequired(true)))
    .addSubcommand(s => s.setName("last").setDescription("View you last catched countryball"))
    .addSubcommand(s => s.setName("completion").setDescription("View you completion of TestDex").addUserOption(u => u.setName("user").setDescription("Usuario a ver la completion").setRequired(false)))
    .addSubcommand(s => s.setName("list").setDescription("List your countryballs").addUserOption(o => o.setName("user").setDescription("User to inspect countryballs").setRequired(false)))
    .addSubcommand(s => s.setName("favorite").setDescription("Set a countryball as favorite").addIntegerOption(o => o.setName("ball").setDescription("Ball to inspect").setAutocomplete(true).setRequired(true)))
    .addSubcommand(s => s.setName("give").setDescription("Give a countryball to a user.").addUserOption(o => o.setName("user").setDescription("User to give.").setRequired(true)).addIntegerOption(o => o.setName("ball").setDescription("Ball to inspect").setAutocomplete(true).setRequired(true))),
    run: () => { return },
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.ChatInputCommandInteraction} interaction 
     */
    runSlash: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand()

        if (subcommand == "info") {
            const ballId = interaction.options.getInteger("ball", true);
            var currentPlayer = await player.get(interaction.user.id);
    
            if (!currentPlayer) {
                return await interaction.reply({ content: "You haven't collected any countryball yet." });
            }
    
            const currentBall = currentPlayer.find((b) => b.id == ballId);

            if (!currentBall) {
                return await interaction.reply({ content: "That countryball was not found, try to use the autocomplete function.", ephemeral: true });
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
    
            return await interaction.editReply({ files: [cardAttachment], content: `ID: \`#${currentBall.id.toString(16)}\`\nObtenido el <t:${currentBall.date ?? Math.round(Date.now() / 1000)}:F>${currentBall.trade ? `\nObtenido por tradeo con <@${currentBall.trade}>` : ""}\n\nHP: ${hp} (${currentBall.hp >= 0 ? "+" : ""}${currentBall.hp}%)\nATK: ${atk} (${currentBall.atk >= 0 ? "+" : ""}${currentBall.atk}%) ` });
        }

        if (subcommand == "last") {            
            var currentPlayer = await player.get(interaction.user.id);

            if (!currentPlayer) {
                return await interaction.reply({ content: "You haven't collected any countryball yet." });
            }

            const currentBall = currentPlayer[currentPlayer.length - 1];
    
            if (!currentBall) {
                return await interaction.reply({ content: "No countryball was found.", ephemeral: true });
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
            
            return await interaction.editReply({ files: [cardAttachment], content: `ID: \`#${currentBall.id.toString(16)}\`\nObtenido el <t:${currentBall.date ?? Math.round(Date.now() / 1000)}:F>${currentBall.trade ? `\nObtenido por tradeo con <@${currentBall.trade}>` : ""}\n\nHP: ${hp} (${currentBall.hp >= 0 ? "+" : ""}${currentBall.hp}%)\nATK: ${atk} (${currentBall.atk >= 0 ? "+" : ""}${currentBall.atk}%) ` });
        }

        if (subcommand === "completion") {
            const mentionUserId = interaction.options.get("user")?.value;
            const targetUserId = mentionUserId || interaction.member.id;
            const targetUserObj = await interaction.guild.members.fetch(targetUserId)

            const currentPlayer = await player.get(targetUserId); 
            const { countryballs } = require("../../config/countryballs.json");

            // if (!currentPlayer) {
            //     return await interaction.reply({ content: "You haven't collected any countryball yet.", ephemeral: true });
            // }

            await interaction.deferReply();

            var cbNames = [];
            var gotNames = [];
            var cbText = "";
            var gotText = "";

            for (const countryball of countryballs) {
                cbNames.push(countryball.names[0]);

                const emoji = client.emojis.cache.get(countryball.emoji);
                cbText += `${emoji}`;
            }

            if (currentPlayer) {
                for (const collected of currentPlayer) {
                    const cbName = collected.countryball.names[0];

                    if (
                        cbNames.includes(cbName) &&
                        !gotNames.includes(cbName)
                    ) {
                        const cbIndex = cbNames.indexOf(cbName);
                        cbNames.splice(cbIndex, 1);

                        gotNames.push(cbName);

                        const emoji = client.emojis.cache.get(collected.countryball.emoji);
                        gotText += `${emoji}`;
                    }
                }
            } else {
                gotText = "Todavia no has conseguido ningún countryball.";
            }

            if (cbNames.length == 0) {
                cbText = ":tada: **__Felicitaciones conseguiste todos los countryballs__** :tada:"
            }
            

            const percentage = (gotNames.length * 100 / countryballs.length).toFixed(2);

            const embed = new Discord.EmbedBuilder()
            .setAuthor({ name: targetUserObj.user.displayName, iconURL: targetUserObj.user.displayAvatarURL({ size: 512 }) })
            .setColor(Discord.Colors.Blurple)
            .setDescription(`BallsDex progression: *${percentage}%*\n\n**__Owned Countryballs__**\n${gotText}\n\n${gotNames.length >= countryballs.length ? "" : "**__Missing Countryballs__**\n"}${cbText}`)
            
            return await interaction.editReply({ embeds: [embed] });
        }

        if (subcommand == "list") {
            const user = interaction.options.getUser("user") ?? interaction.user;
            const currentPlayer = await player.get(user.id);

            if (!currentPlayer) {
                return await interaction.reply({ content: `<@${user.id}> No tiene countryballs.`, ephemeral: true });
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
                const response = await interaction.editReply({ content: `Viewing <@${user.id}>'s countryballs.`, components: [actions, row2] })
                await generateListResponse(interaction, response, currentPlayer, user.id);
            } else {
                return await interaction.editReply({ content: `Viewing <@${user.id}>'s countryballs.`, components: [row2] });
            }
        }

        if (subcommand == "favorite") {
            const ballId = interaction.options.getInteger("ball", true);
            var currentPlayer = await player.get(interaction.user.id);
            var currentBall = undefined;
    
            if (!currentPlayer) {
                return await interaction.reply({ content: "You haven't collected any countryball yet." });
            }
    
            for (var ball of currentPlayer) {
                if (ball.id == ballId) {
                    currentBall = ball;
                }
            }

            await interaction.deferReply();
            const index = currentPlayer.indexOf(currentBall);
    
            if (!currentBall || index == -1) {
                return await interaction.editReply({ content: "No countryball was found, use the autocomplete function.", ephemeral: true });
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
            const ballId = interaction.options.getInteger("ball", true);

            const oldPlayer = await player.get(interaction.user.id);
            const newPlayer = await player.get(user.id);

            if (user.bot) {
                return await interaction.reply({content: `No puedes regalar balls a bots.`, ephemeral: true})
            }

            if (interaction.user === user) {
                return await interaction.reply({content: `No puedes regalar balls a ti mismo.`, ephemeral: true})
            }

            if (!oldPlayer) {
                return await interaction.reply({ content: `<@${interaction.user.id}> No tiene countryballs.`, ephemeral: true });
            }

            const currentBall = oldPlayer.find((b) => b.id == ballId);

            await interaction.deferReply();
            const index = oldPlayer.indexOf(currentBall);

            if (!currentBall || index == -1) {
                return await interaction.reply({ content: "That countryball was not found, try to use the autocomplete function.", ephemeral: true });
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
        .setCustomId(`list_${userId}`); // no será por el interaction.user? yo creo

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

// /**
//  * Reloads the list 
//  * 
//  * @param {Discord.MessageComponentCollectorOptions} response
//  * @param {Discord.User} user 
//  * @param {Number} page
//  */
// async function reloadList(response, user, page) {
//     const currentPlayer = await player.get(user.id);     

//     if (!currentPlayer) {
//         return await response.reply({ content: `<@${user.id}> No tiene countryballs.`, ephemeral: true });
//     }

//     // Split array in chunks
//     var chunks = [];
//     for (var i = 0; i < currentPlayer.length; i += 25) {
//         chunks.push(currentPlayer.splice(i, i + 25));
//     }

//     var cbOptions = [];
            
//     const cbMenu = new Discord.StringSelectMenuBuilder()
//     .setCustomId(`list_${user.id}`);

//     var chunkedPlayer = chunks[page];
//     for (var currentBall in chunkedPlayer) {
//         const ball = chunkedPlayer[currentBall]

//         var atk = 0;
//         var hp = 0;
//         if (ball.atk > 0) {
//             atk = ball.countryball.defaultAtk * ((ball.atk / 100) + 1);
//         } else {
//             atk = ball.countryball.defaultAtk * (1 - (Math.abs(ball.atk) / 100));
//         }
        
//         if (ball.hp > 0) {
//             hp = ball.countryball.defaultHp * ((ball.hp / 100) + 1);
//         } else {
//             hp = ball.countryball.defaultHp * (1 - (Math.abs(ball.hp) / 100));
//         }
    
//         atk = Math.floor(atk);
//         hp = Math.floor(hp);

//         const emoji = client.emojis.cache.get(ball.countryball.emoji)

//         cbOptions.push({
//             label: `${(ball.shiny ? "✨ " : "")} ${ball.countryball.renderedName}`,
//             value: `${ball.id}`,
//             description: `#${ball.id.toString(16)} HP: ${hp} (${ball.hp >= 0 ? "+" : ""}${ball.hp}%)\nATK: ${atk} (${ball.atk >= 0 ? "+" : ""}${ball.atk}%)`,
//             emoji: `${emoji}`
//         });

//         console.log(ball.countryball.renderedName)
//     }

//     cbMenu.setOptions(cbOptions);

//     const actions = new Discord.ActionRowBuilder();

//     const prevButton = new Discord.ButtonBuilder()
//     .setCustomId(`prev_${response.id}`) 
//     .setLabel("«") 
//     .setStyle(Discord.ButtonStyle.Secondary)
//     .setDisabled(true)

//     const nextButton = new Discord.ButtonBuilder()
//     .setCustomId(`next_${response.id}`) 
//     .setLabel("»") 
//     .setStyle(Discord.ButtonStyle.Secondary)
//     .setDisabled(false)

//     actions.addComponents(prevButton);

//     const sections = Math.floor(currentPlayer.length / 25);

//     for (var i = page; i < (page + 3); i++) {
//         const button = new Discord.ButtonBuilder()
//         .setCustomId(`page_${i}`)
//         .setStyle(Discord.ButtonStyle.Primary)

//         if (i == 0 || i > sections) { 
//             button.setLabel("...").setDisabled(true);
//         } else if (i == page) {
//             button.setStyle(Discord.ButtonStyle.Secondary).setDisabled(true)
//         }

//         button.setLabel(i.toString());

//         actions.addComponents(button);
//     }

//     console.log(typeof response) // sale object

//     const row = new Discord.ActionRowBuilder().addComponents(cbMenu);
    
//     const buttonRes = await response.editReply({ content: `Estás viendo la completion de <@${user.id}>`, components: [actions, row] });

//     try {
//         const collected = await buttonRes.awaitMessageComponent({ filter: i => i.user.id == response.user.id });

//         if (collected.isStringSelectMenu()) {
//             return; 
//         }

//         if (collected.isButton()) {
//             if (collected.id.startsWith("prev")) {
//                 const page = collected.id.split("_")[1];
//                 reloadList(collected, interaction.user, page - 1);
//             }
            
//             if (collected.id.startsWith("next")) {
//                 const page = collected.id.split("_")[1];
//                 reloadList(collected, interaction.user, page + 1);
//             }
            
//             if (collected.id.startsWith("page")) {
//                 const page = collected.id.split("_")[1];
//                 reloadList(collected, interaction.user, page);
//             }
//         }
//     } catch (e) {
//         console.log(e)
//     }