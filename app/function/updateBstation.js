require('module-alias/register');
const console = require('console');
const { readJSONFileSync, cutVal, isJSON } = require('function/utils');

function updatebs(bot, msg, value, config) {
    let notif = true;

    if(!msg.reply_to_message) return bot.sendMessage(msg.chat.id, 'Silakan balas pesan yang ingin diubah');
    if(!isJSON(msg.reply_to_message.text)) return bot.sendMessage(msg.chat.id, 'Pesan anda bukan format JSON');

    if(value.startsWith('false')) {
        value = cutVal(value, 1);
        notif = false;
    }

    let json = JSON.parse(msg.reply_to_message.text);

    let inline_keyboard = [
        [
            { text: 'Nonton di Bstation', url: value }
        ],
        [
            { text: 'Support', url: `sociabuzz.com/dongworld/tribe` },
            { text: 'Obrolan', url: 't.me/dongworld_ngobrol' }
        ],
        [
            { text: 'Episode sebelumnya', url: `t.me/${ json.channel }` }
        ]
    ]

    if(json.channel == "false") inline_keyboard = [
        [
            { text: 'Nonton di Bstation', url: value }
        ],
        [
            { text: 'Support', url: `sociabuzz.com/dongworld/tribe` },
            { text: 'Obrolan', url: 't.me/dongworld_ngobrol' }
        ]
    ]

    bot.editMessageCaption(
        json.title, // Caption baru
        {
            chat_id: config.ID_CHANNEL,
            message_id: json.message_id
        }
    );

    bot.editMessageReplyMarkup(
        {
            inline_keyboard: inline_keyboard
        },
        {
            chat_id: config.ID_CHANNEL,
            message_id: json.message_id
        }
    )
    .then(() => {
        if (notif) bot.sendMessage(config.ID_CHANNEL, `${ json.title }\n\nBstation ✅\n\nGood Sub + Video High Bitrate ✅\n\nNonton di bstation biar hemat kuota\n\nJanlupa di share y ges🔥`, { reply_to_message_id: json.message_id });
    })
}

module.exports = {
    updatebs
}