const colors = require("colors");

module.exports = (message, clearable = false) => {
    message = `[JAKAS]`.bgWhite.black + ` ${message}`;
    if (clearable === true) {
        process.stdout.write(message)
        process.stdout.cursorTo(0);
        return
    }
    console.log(message)

}

module.exports.clear = () => {
    process.stdout.cursorTo(0)
    process.stdout.clearLine();
}