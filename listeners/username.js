require('module-alias/register');

const { getValue, setUsername } = require("function/function");

module.exports = (function() {
    return function(bot) {
        bot.onText(/^\/setusername/i, async (msg) => {
            const chatId = msg.chat.id;
            const value = getValue(msg);

            await setUsername(chatId, value, bot);
        });
    };
})();