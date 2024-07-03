const { glob } = require("glob");

class BotUtils {
    constructor(client) {
        this.client = client
    }

    async loadFiles(dirName){
        const Files = await glob(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/*.{cjs,js,json,ts}`)
        Files.forEach((file) => delete require.cache[require.resolve(file)])
        return Files
    }
}

module.exports = BotUtils;