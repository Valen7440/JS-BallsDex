const Discord = require("discord.js")
const config = require("../config/config.json")

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
                console.log(`❌ ERROR AL CARGAR EL ARCHIVO ${rutaArchivo} ❌` .red);
                console.log(e)
            }
        })
    }

    console.log(`(${config.prefix}) ${client.commands.size} comandos prefixes cargados.` .green)
}

module.exports = { loadPrefixCommands }