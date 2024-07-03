const Discord = require("discord.js")
const fs = require("fs")
require("colors")

const BotUtils = require("./utils/loadFiles.js")
const { loadEvents } = require("./handlers/events.js")
const { loadCommands } = require("./handlers/slashCommands.js")
const { loadPrefixCommands } = require("./handlers/commands.js");
const { settings } = require("./handlers/config.js");
 
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
    ],
    partials: [Discord.Partials.User, Discord.Partials.Channel, Discord.Partials.GuildMember, Discord.Partials.Message, Discord.Partials.Reaction],
    presence: {
        status: "online",
        afk: false,
    }
})

client.commands = new Discord.Collection();
client.slashcommands = new Discord.Collection();
client.slashArray = [];
client.utils = new BotUtils(client);
client.config = settings;

loadEvents(client);
loadCommands(client);
loadPrefixCommands(client);

client.login(settings["token"]) 