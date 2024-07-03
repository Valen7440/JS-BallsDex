const Discord = require("discord.js");
const { REST, Routes } = require("discord.js")
const fs = require("fs");
const yaml = require("js-yaml")

const config = yaml.load(fs.readFileSync('./config.yml', 'utf-8'))

/**
 * 
 * @param {Discord.Client} client 
 */
async function loadCommands(client){
    client.slashArray = [];

    fs.readdirSync("./commands").forEach(async(categorys) => {
        const commandFiles = fs.readdirSync(`./commands/${categorys}`).filter((archivo) => archivo.endsWith(".js"))
        for (const file of commandFiles) {
            const command = require(`../commands/${categorys}/${file}`); 
            
            if ("cmd" in command) {
                client.slashcommands.set(command.cmd.name, command);
            }

            if (command.cmd instanceof Discord.SlashCommandBuilder) {
                client.slashArray.push(command.cmd.toJSON());
            } else {
                client.slashArray.push(command.cmd);
            }
        }
    })

    const rest = new REST({
        version: '10'
    }).setToken(config["token"]);

    var clientId = config["client-id"];
    if (clientId == "number") {
        clientId = config["client-id"].toString();
    }

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(clientId), {
                    body: client.slashArray
                },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
}

module.exports = { loadCommands }