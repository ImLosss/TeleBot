require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync, cutVal, withErrorHandling } = require("function/utils");
const cmd = require('service/commandImport');

const prefixFunctions = {
    // 'send': withErrorHandling((bot, msg, value, config, fromId) => cmd.sendChannel(bot, msg, value, config)),
    // 'updatebs': withErrorHandling((bot, msg, value, config, fromId) => cmd.updatebs(bot, msg, value, config)),
    // 'changechannel': withErrorHandling((bot, msg, value, config, fromId) => cmd.changeChannel(bot, value, config, fromId)),
    'ytdlp': withErrorHandling((bot, msg, value, config, fromId) => cmd.ytdlp(bot, msg, value, config)),
}

let tempData = {};

module.exports = (function() {
    return function(bot) {
        bot.on('message', async (msg) => {
            console.log(msg);
            if(msg.chat.type == 'private') return 
            let config = readJSONFileSync(`./config.json`);
            const prefix = ['/'];

            const text = msg.text || msg.caption;

            if(!text) return;

            if(msg.body != "") console.log(text, `MessageFrom:@${ msg.chat.username }`);
            const value = cutVal(text, 1);

            if(msg.text != "") {
                for (const pre of prefix) {
                    if (text.startsWith(`${pre}`)) {
                        if(config.ID_CHANNEL != msg.chat.id) return
                        
                        const funcName = text.replace(pre, '').trim().split(' ');
                        const fromId = msg.chat.id;
                    
                        if(config.MAINTENANCE) {
                            console.log('tess');
                            const whitelist = config.MAINTENANCE_WHITELIST;
                            if(prefixFunctions[funcName[0]] && !whitelist.includes(sender)) {
                                console.log(`@${ msg.chat.username }`, `cmd:${ funcName[0] }`)
                                return msg.reply('Bot sedang melakukan pengujian fitur, Anda tidak termasuk dalam whitelist!');
                            }
                        }

                        if (prefixFunctions[funcName[0]]) {
                            return prefixFunctions[funcName[0]](bot, msg, value, config, fromId);
                        }
                    }
                }
            }
        });
    };
})();