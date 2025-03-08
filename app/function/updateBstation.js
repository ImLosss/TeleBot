require('module-alias/register');
const console = require('console');
const { readJSONFileSync, cutVal } = require('function/utils');

function updatebs(bot, msg, value, config) {
    let message_id = value.split(' ')[0];
    let notif = value.split(' ')[2] == 'false' ? false : true;
    value = value.split(' ')[1];
    bot.editMessageReplyMarkup(
        {
            inline_keyboard: [
                [
                    { text: 'Nonton di Bstation', url: value }
                ],
                [
                    { text: 'Channel', url: 't.me/dongworld' },
                    { text: 'Obrolan', url: 't.me/dongworld_ngobrol' }
                ],
                [
                    { text: 'Support', url: config.DONATE_LINK }
                ]
            ]
        },
        {
            chat_id: config.ID_CHANNEL,
            message_id: message_id
        }
    )
    .then(() => {
        if (notif) bot.sendMessage(config.ID_CHANNEL, 'Bstation ✅', { reply_to_message_id: message_id });
    })
}

module.exports = {
    updatebs
}