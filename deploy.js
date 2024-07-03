const fs = require("node:fs")
const path = require("node:path")

client.slashArray = [];

fs.readdirSync("./slashCommands").forEach(async(categorys) => {
    const commandFiles = fs.readdirSync(`./slashCommands/${categorys}`).filter((archivo) => archivo.endsWith(".js"))
    for (const file of commandFiles) {
        const command = require(`../slashCommands/${categorys}/${file}`);
        this.slashCommands.set(command.cmd.name, command);

        if (command.cmd instanceof Discord.SlashCommandBuilder) {
            this.slashArray.push(command.cmd.toJSON());
        } else {
            this.slashArray.push(command.cmd);
        }
    }
})