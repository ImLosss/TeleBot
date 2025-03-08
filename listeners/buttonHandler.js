require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync, cutVal, withErrorHandling } = require("function/utils");
const cmd = require('service/commandImport');

module.exports = (function() {
    return function(bot) {
        bot.on('callback_query', (callbackQuery) => {
            const chatId = callbackQuery.message.chat.id;
            const data = callbackQuery.data;

            if (data === 'not_available') {
                // Tampilkan pemberitahuan kecil
                bot.answerCallbackQuery(callbackQuery.id, {
                    text: 'Proses upload, coba lagi dalam beberapa menit kedepan...🤗 [ADMIN]', // Pesan yang ditampilkan
                    show_alert: true // false = toast notification, true = alert box
                });
            }
        });
    };
})();