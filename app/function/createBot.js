const console = require('./console');
const { cekUsername, cekVersion } = require('./mineflayer');

async function mineflayer(bot, chatId, value) {
    if(!await cekVersion(chatId, bot)) return;
    await cekUsername(chatId, bot);
}

module.exports = {
    mineflayer
}