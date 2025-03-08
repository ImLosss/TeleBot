require('module-alias/register');
const console = require('console');
const { readJSONFileSync } = require('function/utils');

function sendChannel(bot, msg, value, config) {
    const chatId = msg.chat.id;

    // Cek jika pesan mengandung video
    if (msg.video) {
        const videoFileId = msg.video.file_id; // Ambil file_id dari video

        // Membuat tombol inline
        const inlineKeyboard = {
            inline_keyboard: [
                [
                    // { text: 'Bstation (Soon)', url: 'https://bili.im/wtwd7MY' }
                    { text: 'Bstation (Soon)', callback_data: 'not_available' }
                ],
                [
                    { text: 'Channel', url: 't.me/dongworld' },
                    { text: 'Obrolan', url: 't.me/dongworld_ngobrol' }
                ],
                [
                    { text: 'Support', url: config.DONATE_LINK }
                ]
            ]
        };

        // Mengirim video ke channel dengan tombol
        bot.sendVideo(config.ID_CHANNEL, videoFileId, {
            caption: value,
            reply_markup: inlineKeyboard
        })
        .then((result) => {
            bot.sendMessage(chatId, `Message_id: ${ result.message_id }`, { reply_to_message_id: msg.message_id });
            bot.editMessageCaption(`${ value }\n\nLink to Share:\nhttps://t.me/${ config.ID_CHANNEL.replace('@', '') }/${ result.message_id }`, {
                chat_id: config.ID_CHANNEL,
                message_id: result.message_id,
                reply_markup: inlineKeyboard
            })
        })
        .catch((err) => {
            console.error('Gagal mengirim video:', err);
        });
    } else {
        bot.sendMessage(chatId, 'Silakan kirim video.');
    }
}

module.exports = {
    sendChannel
}