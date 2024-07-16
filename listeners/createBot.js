const { getValue } = require("../app/function/function");

// listeners/commandListeners.js
const version = [
    '1.16.x',
    '1.17.x',
    '1.18.x',
    '1.19.x',
    '1.20.x',
    '1.20.x'
]

module.exports = (function() {
    return function(bot) {
        // Daftarkan listener
        bot.onText(/^\/join/, async (msg) => {
            const chatId = msg.chat.id;
            const value = await getValue(msg);

            let data = [];
            for (const ver of version) {
                const callback = JSON.stringify({ action: 'button_click', data: ver })
                data.push({ text: ver, callback_data: callback });
            }

            const options = {
                reply_markup: {
                    inline_keyboard: [data, [{ text: 'Auto', callback_data: JSON.stringify({ action: 'button_click', data: 'auto' }) }]]
                }            
            }

            bot.sendMessage(chatId, 'Pilih versi Minecraft anda: ', options);
        });
    };
})();