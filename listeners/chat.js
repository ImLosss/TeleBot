require('module-alias/register');

const { getValue } = require("function/function");
const { setUsername } = require("function/setUsername");
const { setChat } = require('function/setChat');

module.exports = (function() {
    return function(bot) {
        bot.onText(/^\/chat/i, async (msg) => {
            const chatId = msg.chat.id;
            const value = getValue(msg);

            await setChat(chatId, value, bot);
        });
    };
})();