require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync, cutVal, withErrorHandling } = require("function/utils");
const cmd = require('service/commandImport');
const { NewMessage } = require("telegram/events");

const prefixFunctions = {
    'send': withErrorHandling((bot, msg, value, config, fromId) => cmd.sendChannel(bot, msg, value, config)),
    'updatebs': withErrorHandling((bot, msg, value, config, fromId) => cmd.updatebs(bot, msg, value, config)),
    'changechannel': withErrorHandling((bot, msg, value, config, fromId) => cmd.changeChannel(bot, value, config, fromId)),
    'dl': withErrorHandling((bot, msg, value, config, fromId) => cmd.ytdlp(bot, msg, value, config)),
    'dlvs': withErrorHandling((bot, msg, value, config, fromId) => cmd.dlvs(bot, msg, value, config)),
    'dla': withErrorHandling((bot, msg, value, config, fromId) => cmd.dla(bot, msg, value)),
    'iq': withErrorHandling((bot, msg, value, config, fromId) => cmd.downloadIqiyi(bot, msg, value, config)),
}

const prefixFunctionsGroup = {
    'dl': withErrorHandling((bot, msg, value, config, fromId) => cmd.ytdlp(bot, msg, value, config)),
    'dlvs': withErrorHandling((bot, msg, value, config, fromId) => cmd.dlvs(bot, msg, value, config)),
}

module.exports = (function() {
    return function(client) {
        client.addEventHandler(async (event) => {
            const message = event.message
            let config = readJSONFileSync(`./config2.json`);
            if(!config.RECEIVE_MESSAGE) return console.log("Skip Message.");
            const prefix = ['/'];

            console.log(message.message);

            if(!message.message) return;

            const value = cutVal(message.message, 1);

            if(message.message != "") {
                for (const pre of prefix) {
                    if (message.message.startsWith(`${pre}`)) {
                        const funcName = message.message.replace(pre, '').trim().split(' ');
                        const fromId = message.fromId.userId;

                        console.log(fromId);

                        if(!config.OWNER.includes(fromId)) return

                        if (prefixFunctions[funcName[0]]) {
                            return console.log('jalan');
                        }
                        
                    }
                }
            }
        }, new NewMessage({ incoming: true }));
    };
})();