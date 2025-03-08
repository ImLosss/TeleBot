require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync, cutVal, withErrorHandling } = require("function/utils");
const cmd = require('service/commandImport');

const prefixFunctions = {
    'send': withErrorHandling((bot, msg, value, config, fromId) => cmd.sendChannel(bot, msg, value, config)),
    'updatebs': withErrorHandling((bot, msg, value, config, fromId) => cmd.updatebs(bot, msg, value, config)),
    'changechannel': withErrorHandling((bot, msg, value, config, fromId) => cmd.changeChannel(bot, value, config, fromId)),
}

module.exports = (function() {
    return function(bot) {
        bot.on('message', async (msg) => {
            if(msg.chat.type != 'private') return 
            let config = readJSONFileSync(`./config.json`);
            const prefix = ['/'];

            const text = msg.text || msg.caption;

            if(msg.body != "") console.log(text, `MessageFrom:@${ msg.chat.username }`);
            const value = cutVal(text, 1);

            if(msg.text != "") {

                for (const pre of prefix) {
                    if (text.startsWith(`${pre}`)) {
                        if(!config.OWNER.includes(msg.from.id)) return
                        
                        const funcName = text.replace(pre, '').trim().split(' ');
                        const fromId = msg.chat.id;
                    
                        if(config.MAINTENANCE) {
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