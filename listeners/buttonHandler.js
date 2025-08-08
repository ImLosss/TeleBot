require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync, cutVal, withErrorHandling } = require("function/utils");
const cmd = require('service/commandImport');

const callbackFunctions = {
    downloadVideo: cmd.downloadVideo,
    dlvs_choose_sub: cmd.dlvs_choose_sub,
    dlvs_downloadVideo: cmd.dlvs_downloadVideo,
    '01': cmd.appleReq,
    jadwal_select: cmd.jadwal_select,
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

            if (query.message) {
                bot.deleteMessage(query.message.chat.id, query.message.message_id);
            }

            const fn = callbackFunctions[data.function];
            if (typeof fn === 'function') {
                fn(bot, query, data);
            } else {
                bot.answerCallbackQuery(query.id, { text: 'Unknown action' });
            }
        });

    };
})();