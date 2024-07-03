const Discord = require("discord.js")
const fs = require("fs")
const yaml = require("js-yaml")

const config = yaml.load(fs.readFileSync('./config.yml', 'utf-8'))

/**
 * 
 * @param {Discord.Client} client 
 */
async function loadPrefixCommands(client) {
    console.log(`(${config.prefix}) Cargando comandos prefixes...` .yellow);
    await client.commands.clear();

    const ruta_archivos = await client.utils.loadFiles("/commands/");

    if (ruta_archivos.length){
        ruta_archivos.forEach((rutaArchivo) => {
            try {
                const comando = require(rutaArchivo);
                const nombre_comando = rutaArchivo.split("\\").pop().split("/").pop().split(".")[0]
                comando.name = nombre_comando;

                if (nombre_comando) client.commands.set(nombre_comando, comando);

            } catch (e) {
                console.log(`❌ Error loading ${rutaArchivo} ❌` .red);
                console.log(e)
            }
        })
    }

    console.log(`(${config.prefix}) ${client.commands.size} prefix commands loaded.` .green)
}

module.exports = { loadPrefixCommands }