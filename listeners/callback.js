// listeners/commandListeners.js

module.exports = (function() {
    return function(bot) {
        // Event untuk menangani callback dari tombol
        bot.on('callback_query', (callbackQuery) => {
            const message = callbackQuery.message;
            const data = JSON.parse(callbackQuery.data);
            console.log(message);

            if (data.action === 'button_click') {
                // Hapus pesan setelah tombol ditekan
                bot.deleteMessage(message.chat.id, message.message_id)
                .then(() => {
                    bot.sendMessage(message.chat.id, `Tombol  telah ditekan dan pesan telah dihapus! Versi yang dipilih: ${data.data}`);
                })
                .catch(err => {
                    console.error('Error deleting message:', err);
                });
            }

            // Anda juga bisa menggunakan `bot.answerCallbackQuery` untuk merespon callback query
            bot.answerCallbackQuery(callbackQuery.id);
        });
    };
})();