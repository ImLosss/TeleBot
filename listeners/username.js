require('module-alias/register');

const { getValue } = require("function/function");
const { setUsername } = require("function/setUsername");

module.exports = (function() {
    return function(bot) {
        bot.onText(/^\/setuser/i, async (msg) => {
            const chatId = msg.chat.id;
            const value = getValue(msg);

            await setUsername(chatId, value, bot);
        });
    };
})();