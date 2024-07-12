const Discord = require("discord.js")
const { player } = require("../../handlers/database.js"); 
const snowflake = require("@pwldev/discord-snowflake"); 

const trades = {}; 

const { settings } = require("../../handlers/config.js");

module.exports = {
    name: "trade",
    category: "dex",
    description: "trade",
    args: false,
    cmd: new Discord.SlashCommandBuilder()
    .setName("trade")
    .setDescription(`${settings["bot-name"]} trading`)
    .addSubcommand(s => s.setName("begin").setDescription("Begin a trade with the chosen user.").addUserOption(u => u.setName("user").setDescription("The user you want to trade with").setRequired(true)))
    .addSubcommand(s => s.setName("add").setDescription(`Add a ${settings["collectible-name"]} to the ongoing trade.`).addIntegerOption(i => i.setName(settings["collectible-name"]).setDescription(`The ${settings["collectible-name"]} you want to add to your proposal`).setAutocomplete(true).setRequired(true)))
    .addSubcommand(s => s.setName("remove").setDescription(`Remove a ${settings["collectible-name"]} from what you proposed in the ongoing trade.`).addIntegerOption(i => i.setName(settings["collectible-name"]).setDescription(`The ${settings["collectible-name"]} you want to add to your proposal`).setAutocomplete(true).setRequired(true))),
    run: () => { return },
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.ChatInputCommandInteraction} interaction 
     */
    runSlash: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand()

        if (subcommand == "begin") {
            const trader1 = interaction.user;
            const trader2 = interaction.options.getUser("user", true);

            if (trader2.bot) {
                return await interaction.reply({ content: `You can't trade with bots`, ephemeral: true });
            } 

            if (interaction.user === trader2) {
                return await interaction.reply({ content: `You can't trade with yourself.`, ephemeral: true  }); 
            }    
            
            const ongoingTrader1 = getTrade(interaction);
            const ongoingTrader2 = getTrade({ guild: interaction.guild, channel: interaction.channel, user: trader2 });

            if (ongoingTrader1) {
                return await interaction.reply({ content: "You already have an ongoing trade.", ephemeral: true });
            }

            if (ongoingTrader2) {
                return await interaction.reply({ content: "The user who you're trying to trade with is already in a trade.", ephemeral: true });
            }

            await interaction.deferReply();

            const embed = new Discord.EmbedBuilder()
            .setTitle(`${settings["bot-name"]} trading`)
            .setDescription(`Add or remove ${settings["collectible-name"]}s you want to propose to the other player using the /trade add and /trade remove commands.\nOnce you're finished, click the lock button below to confirm your proposal.\nYou can also lock with nothing if you're receiving a gift.`)
            .setColor(Discord.Colors.Blurple)
            .setFooter({ text: "Interaction updates every 10 seconds." })
            .addFields(
                {
                    name: trader1.displayName,
                    value: "*Empty*\n",
                    inline: true
                },
                {
                    name: trader2.displayName,
                    value: "*Empty*\n",
                    inline: true
                }
            );

            const lockButton = new Discord.ButtonBuilder()
            .setCustomId("lock_trade")
            .setLabel("Lock proposal")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🔒");

            const resetButton = new Discord.ButtonBuilder()
            .setCustomId("reset_trade")
            .setLabel("Reset")
            .setStyle(Discord.ButtonStyle.Secondary)
            .setEmoji("💨");

            const cancelButton = new Discord.ButtonBuilder()
            .setCustomId("cancel_trade")
            .setLabel("Cancel trade")
            .setStyle(Discord.ButtonStyle.Danger)
            .setEmoji("✖️");

            const row = new Discord.ActionRowBuilder().addComponents(lockButton, resetButton, cancelButton);

            await setTrade(interaction, trader1, trader2);

            const message = await interaction.editReply({ embeds: [embed], components: [row] });
            const updateInterval = setInterval(() => {
                updateProposal(interaction, message, updateInterval)
            }, 15000);

            await loadTradeComponents(interaction, message, updateInterval);
        }

        if (subcommand == "add") {
            const ballId = interaction.options.getInteger(settings["collectible-name"], true);
            var currentPlayer = await player.get(interaction.user.id);
    
            if (!currentPlayer) {
                return await interaction.reply({ content: `You haven't collected any ${settings["collectible-name"]} yet.`, ephemeral: true });
            }
            
            const currentBall = currentPlayer.find((b) => b.id == ballId);

            if (!currentBall) {
                return await interaction.reply({ content: `That ${settings["collectible-name"]} was not found, try to use the autocomplete function.`, ephemeral: true });
            }

            currentBall["trade"] = interaction.user.id;
            currentBall["favorite"] = false;

            const tradeData = getTrade(interaction);

            if (!tradeData) {
                return await interaction.reply({content: `"You don't have an ongoing trade.`, ephemeral:  true})
            }

            const trader = getTrader(tradeData, interaction);

            if (!trader) {
                return await interaction.reply({ content: "Could not fetch user.", ephemeral: true });
            }

            if (trader.locked) {
                return await interaction.reply({ content: "You can't modify your proposal as it is locked. You can cancel the trade instead.", ephemeral: true });
            }

            const existingBall = trader.proposal.find((b) => b.id == ballId);
            if (existingBall) {
                return await interaction.reply({ content: `You already added that ${settings["collectible-name"]} to your proposal.`, ephemeral: true });
            }

            trader.proposal.push(currentBall);

            return await interaction.reply({ content: `Added ${currentBall.countryball.renderedName} to your proposal.`, ephemeral: true });
        }

        if (subcommand == "remove") {
            const ballId = interaction.options.getInteger(settings["collectible-name"], true);
            var currentPlayer = await player.get(interaction.user.id);
    
            if (!currentPlayer) {
                return await interaction.reply({ content: `You haven't collected any ${settings["collectible-name"]} yet.` });
            }
            
            const currentBall = currentPlayer.find((b) => b.id == ballId);

            if (!currentBall) {
                return await interaction.reply({ content: `That ${settings["collectible-name"]} was not found, try to use the autocomplete function.`, ephemeral: true });
            }


            const tradeData = getTrade(interaction);

            if (!tradeData) {
                return await interaction.reply({content: `"You don't have an ongoing trade.`, ephemeral:  true})
            }

            const trader = getTrader(tradeData, interaction);

            if (!trader) {
                return await interaction.reply({ content: "Could not fetch user.", ephemeral: true });
            }

            if (trader.locked) {
                return await interaction.reply({ content: "You can't modify your proposal as it is locked. You can cancel the trade instead.", ephemeral: true });
            }

            const existingBall = trader.proposal.find((b) => b.id == ballId);
            if (!existingBall || existingBall == -1) {
                return await interaction.reply({ content: `That ${settings["collectible-name"]} is not added to the proposal.`, ephemeral: true });
            }

            trader.proposal.splice(existingBall, 1);

            return await interaction.reply({ content: `Removed ${currentBall.countryball.renderedName} from the proposal.`, ephemeral: true });
        }
    },
    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.Interaction} interaction 
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

function initList(interaction) {
    const guildTrades = trades[interaction.guildId];

    if (!guildTrades) {
        trades[interaction.guildId] = [];
    }

    const tradeList = trades[interaction.guildId][interaction.channelId];

    if (!tradeList) {
        trades[interaction.guildId][interaction.channelId] = [];
    }
}

/**
 * Gets the trade
 * @param {Discord.Interaction} interaction
 */
function getTrade(interaction) { 
    const { channel, guild } = interaction;
    
    if (!trades[guild.id]) {   
        return null;
    }

    if (!channel.id in trades[guild.id]) {
        return null;
    }

    for (const trade of trades[guild.id][channel.id]) {
        if ((trade.trader1.accepted && trade.trader2.accepted) || (trade.trader1.cancelled && trade.trader2.cancelled)) {
            const allTrades = trades[interaction.guild.id][interaction.channel.id];
            const index = allTrades.findIndex((t) => t?.trader1.id == interaction.user.id || t?.trader2.id == interaction.user.id);
            trades[guild.id][channel.id][trade] = undefined; // remove concluded trades 
        } 
        if (!trade) {
            continue;
        }
        
        if (trade.trader1.id == interaction.user.id) {
            return trade; 
        }
        
        if (trade.trader2.id == interaction.user.id) {
            return trade;
        }
    }

    return null;
}

/**
 * Initialize a trade!
 * Returns if exists or not
 * @param {Discord.Interaction} interaction
 * @param {Discord.User} trader1
 * @param {Discord.User} trader2
 */
async function setTrade(interaction, trader1, trader2) {
    const guildTrades = trades[interaction.guildId];

    if (!guildTrades) {
      initList(interaction);
    } 
     
    trades[interaction.guildId][interaction.channelId].push({
        "trader1": {
            id: trader1.id,
            name: trader1.displayName,
            proposal: [],
            locked: false,
            cancelled: false,
            accepted: false
        },
        "trader2": {
            id: trader2.id,
            name: trader2.displayName,
            proposal: [],
            locked: false,
            cancelled: false,
            accepted: false
        },
    });

    return false;
}

/**
 * Update trade
 * @param {Discord.Interaction} interaction
 */
function updateTrade(interaction, data) { 
    const allTrades = trades[guild.id][channel.id];
    const trade = getTrade(interaction);
    const index = allTrades.indexOf(trade);

    trades[guild.id][channel.id][index] = data; 
}

/**
 * @param {Discord.Interaction | Discord.ButtonInteraction} interaction 
 * @param {Discord.Message} message 
 * @param {NodeJS.Timeout} interval
 */
async function updateProposal(interaction, message, interval) {
    var tradeData = getTrade(interaction);

    if (!tradeData) {
        if (interval) {
            clearInterval(interval);
        }
        return;
    }

    if (interval) {
        if (tradeData.trader1.cancelled || tradeData.trader2.cancelled) {
            clearInterval(interval);
            return;
        }

        if (tradeData.trader1.accepted && tradeData.trader2.accepted) {
            clearInterval(interval);
            return;
        }
    }

    const embed = Discord.EmbedBuilder.from(message.embeds[0]);

    var t1proposal = new String();
    var t2proposal = new String();

    const tradeCancelled = tradeData.trader1.cancelled || tradeData.trader2.cancelled;

    if (tradeData.trader1.proposal.length > 0) {
        for (var ball of tradeData.trader1.proposal) {
            const emoji = interaction.client.emojis.cache.get(ball.countryball.emoji);
            t1proposal += `${tradeCancelled ? "~~" : ""}${(ball.shiny ? "✨ " : "")} *#${parseInt(ball.id).toString(16)} ${emoji} ${ball.countryball.renderedName} ATK: ${ball.atk}% HP: ${ball.hp}%*${tradeCancelled ? "~~" : ""}\n`;
        }
    } else {
        t1proposal = "*Empty*\n"
    }
    
    if (tradeData.trader2.proposal.length > 0) {
        for (var ball of tradeData.trader2.proposal) {
            const emoji = interaction.client.emojis.cache.get(ball.countryball.emoji);
            t2proposal += `${tradeCancelled ? "~~" : ""}${(ball.shiny ? "✨ " : "")} *#${parseInt(ball.id).toString(16)} ${emoji} ${ball.countryball.renderedName} ATK: ${ball.atk}% HP: ${ball.hp}%*${tradeCancelled ? "~~" : ""}\n`;
        }
    } else {
        t2proposal = "*Empty*\n"
    }

    const bothLocked = tradeData.trader1.locked && tradeData.trader2.locked;

    if (bothLocked) {
        embed.setDescription("Now confirm the trade to conclude it.")
        embed.setColor(0xFFFF00)
        embed.setFooter(null)
    }

    embed.setFields(
        {
            name: `${(tradeData.trader1.locked && !bothLocked) ? "🔒" : ""}${tradeData.trader1.accepted ? "✅" : ""}${tradeData.trader1.cancelled ? "🚫" : ""} ${tradeData.trader1.name}`,
            value: t1proposal,
            inline: true
        },
        {
            name: `${(tradeData.trader2.locked && !bothLocked) ? "🔒" : ""}${tradeData.trader2.accepted ? "✅" : ""}${tradeData.trader2.cancelled ? "🚫" : ""} ${tradeData.trader2.name}`,
            value: t2proposal,  
            inline: true
        } 
    ); 

    if (tradeData.trader1.cancelled || tradeData.trader2.cancelled) {
        // no hay una manera de eliminar lo almacenado en un {}? creo que si
        embed.setDescription("**This trade was cancelled.**").setColor(Discord.Colors.DarkRed); 

        const disabledButtons = message.components[0].components.map((button) => Discord.ButtonBuilder.from(button).setDisabled(true));
        const disabledRow = new Discord.ActionRowBuilder().addComponents(disabledButtons);

        const allTrades = trades[interaction.guild.id][interaction.channel.id]; // lo anuncios mexicanos 💀 xd puro sobre droga
        const index = allTrades.findIndex((t) => t?.trader1.id == interaction.user.id || t?.trader2.id == interaction.user.id);

        trades[interaction.guild.id][interaction.channel.id].splice(index, 1); 

        return await message.edit({ embeds: [embed], components: [disabledRow] }); // c
    }

    if (tradeData.trader1.accepted && tradeData.trader2.accepted) {
        embed.setDescription("Trade concluded")
        .setColor(Discord.Colors.Green);

        const disabledButtons = message.components[0].components.map((button) => Discord.ButtonBuilder.from(button).setDisabled(true));
        const disabledRow = new Discord.ActionRowBuilder().addComponents(disabledButtons);                        

        const allTrades = trades[interaction.guild.id][interaction.channel.id]; // lo anuncios mexicanos 💀 xd puro sobre droga
        const index = allTrades.findIndex((t) => t?.trader1.id == interaction.user.id || t?.trader2.id == interaction.user.id);

        trades[interaction.guild.id][interaction.channel.id].splice(index, 1); 

        return await message.edit({ embeds: [embed], components: [disabledRow] }); // c
    }

    await message.edit({ embeds: [embed] });
}

/**
 * @param {Discord.Interaction} interaction
 * @param {Discord.Message} message
 */
async function loadTradeComponents(interaction, message, interval) {
    const tradeData = getTrade(interaction);

    if (!tradeData) {
        return;
    }

    const tradeFilter = (i) => i.user.id == tradeData.trader1.id || i.user.id == tradeData.trader2.id;

    try {
        const response = await message.awaitMessageComponent({ filter: tradeFilter, time: (30 * 60000) });

        if (response.isButton()) {
            if (response.customId == "lock_trade") { 
                var trader = getCurrentTrader(response);

                if (!trader["locked"]) { 
                    trader.locked = true;
                    await response.reply({ content: "You locked your proposal, wait for the other user to lock it.", ephemeral: true });

                    if (tradeData.trader1.locked && tradeData.trader2.locked) {
                        const messageEmbed = Discord.EmbedBuilder.from(message.embeds[0]);
                        messageEmbed.setDescription("Now confirm the trade to conclude it.")
                        messageEmbed.setColor(0xFFFF00) 
                        messageEmbed.setFooter(null);

                        const confirmButton = new Discord.ButtonBuilder()
                        .setEmoji("✔️")
                        .setCustomId("accept_trade")
                        .setStyle(Discord.ButtonStyle.Success)

                        const denyButton = new Discord.ButtonBuilder()
                        .setEmoji("✖️")
                        .setCustomId("cancel_trade")
                        .setStyle(Discord.ButtonStyle.Danger);

                        const newRow = new Discord.ActionRowBuilder().addComponents([confirmButton, denyButton]);
    
                        const update = await message.edit({ embeds: [messageEmbed], components: [newRow] });

                        updateProposal(response, update); 
                        return loadTradeComponents(response, update, interval);
                    }
                } else {
                    await response.reply({ content: "You've already locked your proposal.", ephemeral: true });
                } 

                loadTradeComponents(response, message, interval);
            }

            if (response.customId == "reset_trade") {
                var trader = getCurrentTrader(response);

                if (trader.locked) {
                    await response.reply({ content: "You can't modify your proposal as it is locked. You can cancel the trade instead.", ephemeral: true });
                    loadTradeComponents(response, message, interval);
                    return;
                }

                trader.proposal = [];

                await response.reply({ content: "Your proposal has been reset.", ephemeral: true });

                loadTradeComponents(response, message, interval);
            }

            if (response.customId == "cancel_trade") {
                var trader = getCurrentTrader(response);

                trader.cancelled = true;

                await response.reply({ content: "You cancelled the trade.", ephemeral: true }); 

                updateProposal(response, response.message);
            }

            if (response.customId == "accept_trade") {
                var trader = getCurrentTrader(response);

                if (!trader["accepted"]) {
                    trader.accepted = true; // acepta el tradeo
                    
                    if (tradeData.trader1.accepted && tradeData.trader2.accepted) {
                        performTrade(interaction); 
                    }

                    updateProposal(response, response.message);

                    await response.reply({ content: "You accepted your proposal.", ephemeral: true });

                    loadTradeComponents(response, message, interval);
                } else {
                    return await response.reply({ content: "You've already accepted the trade.", ephemeral: true });
                } 
            }
        }
    } catch (e) {
        clearInterval(interval);
        console.error(e);
    }

    function getCurrentTrader(response) {
        if (response.user.id == tradeData.trader1.id) {
            return tradeData.trader1; 
        }

        if (response.user.id == tradeData.trader2.id) {
            return tradeData.trader2;
        }
    }
}

async function performTrade(interaction) {
    const tradeData = getTrade(interaction);

    if (!tradeData) {
        return;
    }

    const player1 = await player.get(tradeData.trader1.id)
    const player2 = await player.get(tradeData.trader2.id)

    if (!player1 || !player2) {
        return;
    }

    var balls1 = [];
    var balls2 = [];

    for (const proposal of tradeData.trader1.proposal) {
        const index = player1.findIndex((b) => b.id == proposal.id);
        console.log(index)
        balls1.push(proposal);
        player1.splice(index, 1);
    }

    for (const proposal of tradeData.trader2.proposal) {
        const index = player2.findIndex((b) => b.id == proposal.id);
        console.log(index) // mira el sv        
        balls2.push(proposal);
        player2.splice(index, 1);
    }

    var newArray2 = [];
    for (const ball of balls1) {
        if (!player2) {
            newArray2.push(ball);
        } else {
            player2.push(ball);
        }
    }

    var newArray1 = [];
    for (const ball of balls2) {
        if (!player1) {
            newArray1.push(ball);
        } else {
            player1.push(ball);
        }
    }

    if (newArray1.length > 0) {
        await player.set(tradeData.trader1.id, newArray1);
    } else {
        await player.set(tradeData.trader2.id, player1);
    }

    if (newArray2.length > 0) {
        await player.set(tradeData.trader2.id, newArray2);
    } else {
        await player.set(tradeData.trader2.id, player2);
    }
}

function getTrader(tradeData, response) {
    if (response.user.id == tradeData.trader1.id) {
        return tradeData.trader1; 
    }

    if (response.user.id == tradeData.trader2.id) {
        return tradeData.trader2;
    }
}
