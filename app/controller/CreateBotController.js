const { cekUsername, cekVersion } = require("../service/CreateBotService");

async function mineflayer(bot, chatId, value) {
    if(!await cekVersion(chatId, bot)) return;
    await cekUsername(chatId, bot);
}

module.exports = {
    mineflayer
}