/**
 * Returns an integer between a range.
 * Inspired by "random" python library.
 * @param {Number} min
 * @param {Number} max
 */
function randInt(min, max) {
    return (Math.floor(Math.random() * (max - min)) + min);
}

module.exports = { randInt };