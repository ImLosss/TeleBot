require('module-alias/register');
const { writeJSONFileSync, readJSONFileSync } = require("./function");
const console = require('console');

async function setRealUsername(id, username, bot) {
    if(!await cekIp(id, bot)) return bot.sendMessage(chatId, 'Coba kembali!');
    let userData = readJSONFileSync(`database/data_user/${ id }`);
    const ip = userData[0].ip; 
    userData[1][ip].realUser = username;

    // Menulis data ke file 'error.json'
    writeJSONFileSync(`database/data_user/${ id }`, userData);

    console.log(`@${ userData[0].teleUsername } telah mengatur username asli: ${ username }`);
    return bot.sendMessage(id, `Username asli anda telah diatur ke ${ username }`);
}

async function cekIp(id, bot) {
    return new Promise(async (resolve) => {
        let timer, prompt;

        let userData = readJSONFileSync(`database/data_user/${ id }`);

        if(userData[0].ip != undefined) {
            resolve(true);
            return;
        };

        await sleep(1000)
        const message = await bot.sendMessage(id, 'Masukkan ip anda:');

        prompt = async (msg) => {
            bot.deleteMessage(message.chat.id, message.message_id)
            .then(() => {
                clearTimeout(timer);
                setIp(message.chat.id, msg.text, bot);
                bot.removeListener('message', prompt);
                resolve(true);
                return;
            })
        };

        bot.addListener('message', prompt);

        timer = setTimeout(() => {
            bot.removeListener('message', prompt);
            bot.deleteMessage(message.chat.id, message.message_id);
            resolve(false);
            return;
        }, 30000);
    })
}

module.exports = {
    setRealUsername
}