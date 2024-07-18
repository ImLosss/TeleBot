const { cekUsername, cekVersion } = require("../service/CreateBotService");

async function mineflayer(bot, chatId, value) {
    if(!await cekVersion(chatId, bot)) return bot.sendMessage(chatId, 'Coba kembali!');
    if(!await cekUsername(chatId, bot)) return bot.sendMessage(chatId, 'Coba kembali!');
    // if(!await)
}

module.exports = {
    mineflayer
}