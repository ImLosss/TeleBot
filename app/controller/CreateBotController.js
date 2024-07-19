const { readJSONFileSync, getValue, withErrorHandling } = require("../function/function");
const { cekUsername, cekVersion, cekIp } = require("../service/CreateBotService");
const mineflayer = require('mineflayer');
const console = require('../logs/console');
const { injectTitle } = require("../function/utils");

const joinServer = withErrorHandling(async (bot, chatId, value) => {
    let Lmessagestr;

    if(!await cekVersion(chatId, bot)) return bot.sendMessage(chatId, 'Coba kembali!');
    if(!await cekUsername(chatId, bot)) return bot.sendMessage(chatId, 'Coba kembali!');
    if(!await cekIp(chatId, bot)) return bot.sendMessage(chatId, 'Coba kembali!');

    let dataUser = readJSONFileSync(`database/data_user/${ chatId }`);
    
    const botM = mineflayer.createBot({
        host: dataUser[0].ip, 
        username: dataUser[0].username, 
        auth: 'offline',
        version: dataUser[0].version
        // "mapDownloader-outputDir": filePathMap
    })

    injectTitle(botM);

    let message = '';
    Lmessagestr = async (msgstr) => {
        if(msgstr.trim().length == 0 || message == msgstr) return;

        console.log(msgstr, 'message_client');
        bot.sendMessage(chatId, msgstr);
    }

    botM.once('spawn', () => {
        bot.sendMessage(chatId, 'connected');
        console.log('connected');
        sendMsg(chatId, botM, bot);
    })

    botM.once('error', (err) => {
        console.error(err);
    })

    botM.addListener('messagestr', Lmessagestr);

    function sendMsg(chatId, botM, bot) {
        list2 = withErrorHandling(async (msg2) => {
            if(msg2.chat.id == chatId) {
                const pesan = msg2.text;

                console.log(pesan);

                botM.chat(pesan);
            }
        });
        bot.addListener('message', list2);
    }
});

module.exports = {
    joinServer
}