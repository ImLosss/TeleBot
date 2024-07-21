const console = require("../app/logs/console");
const { joinServer } = require("../app/controller/CreateBotController");
const { getValue } = require("../app/function/function");

module.exports = (function() {
    return function(bot) {
        bot.onText(/^\/join$/, async (msg) => {
            const chatId = msg.chat.id;
            const value = getValue(msg);

            await joinServer(bot, chatId, value);
        });
    };
})();