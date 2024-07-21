require('module-alias/register');

const { joinServer } = require("controller/CreateBotController");
const { getValue } = require("function/function");

module.exports = (function() {
    return function(bot) {
        bot.onText(/^\/join$/i, async (msg) => {
            const chatId = msg.chat.id;
            const value = getValue(msg);

            await joinServer(bot, chatId, value);
        });
    };
})();