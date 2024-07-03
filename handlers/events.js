const Discord = require("discord.js");

/**
 * 
 * @param {Discord.Client} client 
 */
async function loadEvents(client){
    console.log(`(+) Cargando Eventos...` .yellow);
    const ruta_archivos = await client.utils.loadFiles("/events/");
    client.removeAllListeners();

    if (ruta_archivos.length){
        ruta_archivos.forEach((rutaArchivo) => {
            try {
                const evento = require(rutaArchivo);
                const nombre_evento = rutaArchivo.split("\\").pop().split("/").pop().split(".")[0];

                client.on(nombre_evento, evento.bind(null, client))
            } catch (e) {
                console.log(`❌ ERROR AL CARGAR EL ARCHIVO ${rutaArchivo} ❌` .red);
                console.log(e)
            }
        })
    }

    console.log(`(+) ${ruta_archivos.length} Eventos cargados.` .green)
}

module.exports = { loadEvents }