const console = require("../app/function/console");
const { getValue } = require("../app/function/function");
const { cekVersion, cekUsername } = require("../app/function/mineflayer");

module.exports = (function() {
    return function(bot) {
        // Daftarkan listener
        bot.onText(/^\/join/, async (msg) => {
            const chatId = msg.chat.id;
            const value = await getValue(msg);

            // await cekUsername(chatId, bot);
            if(!await cekVersion(chatId, bot)) return;
            await cekUsername(chatId, bot);
        });
    };
})();