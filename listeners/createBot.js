const console = require("../app/function/console");
const { mineflayer } = require("../app/function/createBot");
const { getValue } = require("../app/function/function");

module.exports = (function() {
    return function(bot) {
        bot.onText(/^\/join$/, async (msg) => {
            const chatId = msg.chat.id;
            const value = await getValue(msg);

            await mineflayer(bot, chatId, value);
        });
    };
})();