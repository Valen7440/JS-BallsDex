const path = require("node:path");
const fs = require("node:fs");
const { Canvas, loadImage, registerFont } = require("canvas");

/**
 * Draws a BallsDex Card
 */
async function drawCard(
    ball,
    cardName,
    regime,
    economy = "capitalist"
) {
    const baseCardDir = path.resolve(`./assets/regimes/${regime}.png`);
    const shinyCardDir = path.resolve(`./assets/regimes/shiny.png`)
    const economyCardDir = path.resolve(`./assets/economies/${economy}.png`);
    const cardDir = path.resolve(`./assets/cards/${cardName}.png`);

    const canvas = new Canvas(1428, 2000, "image");
    const ctx = canvas.getContext("2d");

    var baseImage = await loadImage(fs.readFileSync(baseCardDir));
    if (ball?.shiny) {
        baseImage = await loadImage(fs.readFileSync(shinyCardDir));
    }
    ctx.drawImage(baseImage, 0, 0);

    var economyImage = await loadImage(fs.readFileSync(economyCardDir));
    ctx.drawImage(economyImage, 1180, 30, 200, 200)

    const artImage = await loadImage(fs.readFileSync(cardDir));
    ctx.drawImage(artImage, 34, 260, 1360, 735);
    
    // Draw text
    registerFont(path.resolve("./assets/fonts/ArsenicaTrial-Extrabold.ttf"), { family: "Arsenica Trial Extrabold" });
    registerFont(path.resolve("./assets/fonts/OpenSans-Semibold.ttf"), { family: "Open Sans Semibold" });
    registerFont(path.resolve("./assets/fonts/Bobby-Jones-Soft.otf"), { family: "Bobby Jones Soft" });

    ctx.fillStyle = "#fff";
    ctx.font = "165px Arsenica Trial Extrabold";
    ctx.fillText(ball.countryball.renderedName, 40, 195);

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

    ctx.font = "110px Bobby Jones Soft";

    ctx.fillStyle = "#fec44c";
    ctx.fillText(atk, 980, 1780);

    ctx.fillStyle = "#eb7264";
    ctx.fillText(hp, 325, 1780);
    
    if (ball.countryball?.capacity) {
        ctx.fillStyle = "#fff";
        ctx.font = "95px Bobby Jones Soft";
        ctx.fillText("Hability: "+ ball.countryball.capacity.name, 70, 1130);

        ctx.font = "bold 60px Open Sans Semibold"

        var words = ball.countryball.capacity.description; 
        var line = "";
        var x = 70;
        var y = 1365;
        var maxWidth = 1200;
        var lineHeight = 70;
        for(var n = 0; n < words.length; n++) {
            var testLine = line + words[n];
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n];
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }

    return canvas.toBuffer("image/png");
}

module.exports = { drawCard };