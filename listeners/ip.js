const console = require("../app/logs/console");

const { getValue } = require("../app/function/function");
const { setIp } = require("../app/function/setIp");

module.exports = (function() {
    return function(bot) {
        bot.onText(/^\/setip/i, async (msg) => {
            const chatId = msg.chat.id;
            const value = getValue(msg);

            await setIp(chatId, value, bot);
        });
    };
})();