const { readJSONFileSync, getValue, withErrorHandling } = require("../function/function");
const { cekUsername, cekVersion, cekIp, playerOnline } = require("../service/CreateBotService");
const mineflayer = require('mineflayer');
const console = require('../logs/console');
const { injectTitle } = require("../function/utils");
const fs = require('fs');

const commandMap = {
    '/playerlist': playerOnline
};

const joinServer = withErrorHandling(async (bot, chatId, value) => {
    let Lmessagestr, list2;

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

    if(!fs.existsSync(`database/chat_game/log_${ chatId }.json`)) {
        let data_user = []
        fs.writeFileSync(`database/chat_game/log_${ chatId }.json`, JSON.stringify(data_user, null, 2));
        fs.writeFileSync(`database/chat_game/error_${ chatId }.json`, JSON.stringify(data_user, null, 2));
    }

    injectTitle(botM);

    let message = '';
    Lmessagestr = withErrorHandling(async (msgstr) => {
        if(msgstr.trim().length == 0 || message == msgstr) return;

        console.game(msgstr, chatId);
        bot.sendMessage(chatId, msgstr);
    })

    botM.once('spawn', withErrorHandling(() => {
        bot.sendMessage(chatId, 'connected')
        .then(() => {
            console.log('connected');
            sendMsg(chatId, botM, bot);
        })
    }))

    botM.once('kicked', withErrorHandling((msgK) => {
        msgK = JSON.parse(msgK);
        console.log(msgK, 'kicked');
        if (msgK.text != undefined && msgK.text != '') bot.sendMessage(chatId, `Kicked : ${ msgK.text }`);
        if (msgK.translate != undefined) bot.sendMessage(chatId, `Kicked : ${ msgK.translate }`);
        if (msgK.extra != undefined) {
            let strKick = '';
            msgK.extra.map((item) => {
                if(item.text != undefined) strKick += item.text;
            })
            bot.sendMessage(chatId, `Kicked : ${ strKick }`);
        }
    }))

    botM.once('error', withErrorHandling((err) => {
        console.error(err);
    }))

    botM.addListener('messagestr', Lmessagestr);

    function sendMsg(chatId, botM, bot) {
        list2 = withErrorHandling(async (msg2) => {
            if(msg2.chat.id == chatId) {
                const pesan = msg2.text;
                let cmd = pesan.toLowerCase();
                const args = cmd.split(' '); 
                cmd = args[0]; 

                console.game(pesan, chatId, 'message_send');

                if(cmd == '/dc' || cmd == '/disconnect') botM.quit();
                else if (commandMap[cmd]) {
                    await commandMap[cmd](botM, chatId, bot, getValue(msg2)); // Memanggil fungsi dengan sisa argumen
                }
                else {
                    try {
                        botM.chat(pesan)
                    } catch (err) {
                        bot.sendMessage(chatId, 'Terjadi kesalahan saat mengirim pesan anda');
                        console.gameError(err, chatId);
                    }
                }
            }
        });
        bot.addListener('message', list2);

        botM.once('end', withErrorHandling((msg) => {
            console.log(msg, 'disconnect');
            bot.sendMessage(chatId, 'Disconnected');
    
            const numListenersMessageBeforeRemoval = bot.listeners('message').length;
            console.log(`Jumlah listener message sebelum dihapus : ${ numListenersMessageBeforeRemoval }`);
    
            bot.removeListener('message', list2);
            const numListenersMessageAfterRemoval = bot.listeners('message').length;
            console.log(`Jumlah listener message setelah dihapus : ${  numListenersMessageAfterRemoval }`);
        }))
    }
});

module.exports = {
    joinServer
}