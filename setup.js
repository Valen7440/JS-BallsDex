const fs = require("node:fs");

const template = `
# JS BallsDex Configuration
# made by Valen7440 and PwlDev
# original bot made by Laggron42

# paste your token here
token: 

# client ID of your application
# example: 1253441398146076732
client-id:

# add custom prefix
prefix: b.
`

console.log("We've installed the required dependencies.");
console.log("Generating configuration file...");

try {
    fs.writeFileSync("./config.yml", template, { encoding: "utf-8" });
    console.log("Configuration file generated.");
    console.log("Add your bot token to config.yml.");
} catch (e) {
    throw new Error("Could not generate configuration file.\n", e);
}