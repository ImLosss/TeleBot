// listeners/commandListeners.js

const console = require("../app/logs/console");
const { saveError, setVersion } = require("../app/function/function");

module.exports = (function() {
    return function(bot) {
        // Event untuk menangani callback dari tombol
        bot.on('callback_query', (callbackQuery) => {
            const message = callbackQuery.message;
            const data = JSON.parse(callbackQuery.data);

            if (data.action === 'button_click') {
                // Hapus pesan setelah tombol ditekan
                bot.deleteMessage(message.chat.id, message.message_id)
                .then(() => {
                    if(data.cmd == 'version') setVersion(message.chat.id, data.data, bot);
                })
                .catch(err => {
                    console.error(err)
                });
            }

            // Anda juga bisa menggunakan `bot.answerCallbackQuery` untuk merespon callback query
            bot.answerCallbackQuery(callbackQuery.id);
        });
    };
})();