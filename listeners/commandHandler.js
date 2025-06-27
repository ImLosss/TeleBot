require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync, cutVal, withErrorHandling } = require("function/utils");
const cmd = require('service/commandImport');

const prefixFunctions = {
    'send': withErrorHandling((bot, msg, value, config, fromId) => cmd.sendChannel(bot, msg, value, config)),
    'updatebs': withErrorHandling((bot, msg, value, config, fromId) => cmd.updatebs(bot, msg, value, config)),
    'changechannel': withErrorHandling((bot, msg, value, config, fromId) => cmd.changeChannel(bot, value, config, fromId)),
    'bw': withErrorHandling((bot, msg, value, config, fromId) => cmd.bw(bot, value, config, fromId)),
    'dl': withErrorHandling((bot, msg, value, config, fromId) => cmd.ytdlp(bot, msg, value, config)),
    'dlvs': withErrorHandling((bot, msg, value, config, fromId) => cmd.dlvs(bot, msg, value, config)),
    'dla': withErrorHandling((bot, msg, value, config, fromId) => cmd.dla(bot, msg, value)),
    'iq': withErrorHandling((bot, msg, value, config, fromId) => cmd.downloadIqiyi(bot, msg, value, config)),
}

const prefixFunctionsGroup = {
    'dl': withErrorHandling((bot, msg, value, config, fromId) => cmd.ytdlp(bot, msg, value, config)),
    'dlvs': withErrorHandling((bot, msg, value, config, fromId) => cmd.dlvs(bot, msg, value, config)),
    'dla': withErrorHandling((bot, msg, value, config, fromId) => cmd.dla(bot, msg, value)),
}

module.exports = (function() {
    return function(bot) {
        bot.on('message', async (msg) => {
            console.log(msg);
            
            let config = readJSONFileSync(`./config.json`);
            if(!config.RECEIVE_MESSAGE) return console.log("Skip Message.");
            const prefix = ['/'];

            const text = msg.text || msg.caption;

            if(!text) return;

            if(msg.body != "") console.log(text, `MessageFrom:@${ msg.from.username ? msg.from.username : msg.from.first_name }`);

            if(!config.BLACKLIST_WORDS) config.BLACKLIST_WORDS = [];
            if(config.ID_CHANNEL == msg.chat.id && config.BLACKLIST_WORDS.some(word => text.toLowerCase().includes(word.toLowerCase()))) {
                setTimeout(() => {
                    bot.deleteMessage(msg.chat.id, msg.message_id);
                }, 3000);
            }

            const value = cutVal(text, 1);

            if(msg.text != "") {
                console.log('tess');
                for (const pre of prefix) {
                    if (text.startsWith(`${pre}`)) {
                        const funcName = text.replace(pre, '').trim().split(' ');
                        const fromId = msg.chat.id;

                        if(msg.chat.type == 'private') {
                            if(!config.OWNER.includes(msg.from.id)) return

                            if (prefixFunctions[funcName[0]]) {
                                return prefixFunctions[funcName[0]](bot, msg, value, config, fromId);
                            }
                        } else {
                            if(config.ID_CHANNEL != msg.chat.id) return

                            if (prefixFunctionsGroup[funcName[0]]) {
                                return prefixFunctionsGroup[funcName[0]](bot, msg, value, config, fromId);
                            }
                        }
                        
                    }
                }
            }
        });
    };
})();