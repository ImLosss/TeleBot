require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync, cutVal, withErrorHandling } = require("function/utils");
const cmd = require('service/commandImport');

const callbackFunctions = {
    downloadVideo: cmd.downloadVideo,
};

module.exports = (function() {
    return function(bot) {
        bot.on('callback_query', (query) => {
            let data;
            try {
                data = JSON.parse(query.data);
            } catch (e) {
                return bot.answerCallbackQuery(query.id, { text: 'Invalid callback data' });
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