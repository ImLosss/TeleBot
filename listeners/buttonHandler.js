require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync, cutVal, withErrorHandling } = require("function/utils");
const cmd = require('service/commandImport');

const callbackFunctions = {
    downloadVideo: { handler: cmd.downloadVideo, delete: true },
    dlvs_choose_sub: { handler: cmd.dlvs_choose_sub, delete: true },
    dlvs_downloadVideo: { handler: cmd.dlvs_downloadVideo, delete: true },
    '01': { handler: cmd.appleReq, delete: true },
    jadwal_select: { handler: cmd.jadwal_select, delete: false },
};

module.exports = (function() {
    return function(bot) {
        bot.on('callback_query', (query) => {
            let data;
            let config = readJSONFileSync(`./config.json`);

            if(!config.RECEIVE_MESSAGE) return console.log("Skip Callback Query.");
            try {
                data = JSON.parse(query.data);
            } catch (e) {
                return bot.answerCallbackQuery(query.id, { text: 'Invalid callback data' });
            }

            const fn = callbackFunctions[data.function]?.handler || false;
            if (typeof fn === 'function') {
                if (callbackFunctions[data.function].delete) bot.deleteMessage(query.message.chat.id, query.message.message_id);
                fn(bot, query, data);
            } else {
                bot.answerCallbackQuery(query.id, { text: 'Unknown action' });
                bot.deleteMessage(query.message.chat.id, query.message.message_id);
            }
        });

    };
})();