require('module-alias/register');
const console = require('console');
const { readJSONFileSync, cutVal } = require('function/utils');

function sendChannel(bot, msg, value, config) {
    const chatId = msg.chat.id;

    // Cek jika pesan mengandung video
    if (msg.video || msg.reply_to_message?.video?.file_id) {
        let caption;
        const videoFileId = msg.video?.file_id || msg.reply_to_message.video.file_id; // Ambil file_id dari video

        const forwardChannel = value.split(' ')[0];
        value = cutVal(value, 1); // Ambil judul video

        caption = `${ value }\n\nEpisode sebelumnya:\nt.me/${ forwardChannel }\n\nDonasi buat ngopi:\nhttps://sociabuzz.com/dongworld/tribe` ;
        if(forwardChannel == "false") caption = `${ value }\n\nDonasi buat ngopi:\nhttps://sociabuzz.com/dongworld/tribe`;

        if(!value) return bot.sendMessage(chatId, 'Silakan kirim video dengan caption yang benar.\n\nContoh:\n/send <channel> <Judul Video>')

        // Mengirim video ke channel dengan tombol
        bot.sendVideo(config.ID_CHANNEL, videoFileId, { 
            caption
        })
        .then((result) => {
            bot.sendVideo(`@${ forwardChannel }`, videoFileId, { caption: `${ value }\n\nDonasi buat ngopi:\nhttps://sociabuzz.com/dongworld/tribe`, reply_markup: { inline_keyboard: [[{ text: "Channel Utama", url: 't.me/dongworld' }]] } });
            bot.sendMessage(chatId, JSON.stringify({ response: 'Video Berhasil dikirim', channel: forwardChannel, title: value, caption: `${ value }\n\nDonasi buat ngopi:\nhttps://sociabuzz.com/dongworld/tribe`, message_id: result.message_id }), { reply_to_message_id: msg.message_id });
        })
        .catch((err) => {
            console.error('Gagal mengirim video:', err);
            bot.sendMessage(chatId, 'Terjadi kesalahan saat mengirim video');
        });
    } else {
        bot.sendMessage(chatId, 'Silakan kirim video.');
    }
}

module.exports = {
    sendChannel
}