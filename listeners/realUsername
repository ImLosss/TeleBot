require('module-alias/register');

const { getValue } = require("function/function");
const { setRealUsername } = require("function/setRealUsername");

module.exports = (function() {
    return function(bot) {
        bot.onText(/^\/setrealuser/i, async (msg) => {
            const chatId = msg.chat.id;
            const value = getValue(msg);

            await setRealUsername(chatId, value, bot);
        });
    };
})();