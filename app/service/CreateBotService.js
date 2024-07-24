require('module-alias/register');

const fs = require('fs');
const { readJSONFileSync, writeJSONFileSync, sleep, withErrorHandling } = require('function/function');
const console = require('console');
const { setIp } = require('function/setIp');
const { setVersion } = require('function/setVersion');
const { setUsername } = require('function/setUsername');
const { setRealUsername } = require('function/setRealUsername');
const { removeFromArray } = require('function/utils');

async function cekVersion(id, bot) {
    return new Promise(async (resolve) => {
        let timer, prompt;

        const version = [
            '1.18.x',
            '1.19.x',
            '1.20.x',
            '1.21.x'
        ]

        let userData = readJSONFileSync(`database/data_user/${ id }`);

        if(userData[0].version != undefined) {
            resolve(true);
            return;
        }

        let data = [];
        for (const ver of version) {
            const callback = JSON.stringify({ action: 'button_click_await', cmd: 'version', data: ver })
            data.push({ text: ver, callback_data: callback });
        }

        const options = {
            reply_markup: {
                inline_keyboard: [data, [{ text: 'Auto', callback_data: JSON.stringify({ action: 'button_click_await', cmd: 'version', data: false }) }]]
            }            
        }

        const messageToDel = await bot.sendMessage(id, 'Pilih versi Minecraft anda: ', options);

        prompt = async (callbackQuery) => {
            const message = callbackQuery.message;
            const data = JSON.parse(callbackQuery.data);

            if (data.action === 'button_click_await') {
                // Hapus pesan setelah tombol ditekan
                clearTimeout(timer);
                bot.removeListener('callback_query', prompt);
                bot.deleteMessage(messageToDel.chat.id, messageToDel.message_id)
                .then(() => {
                    if(data.cmd == 'version') setVersion(message.chat.id, data.data, bot);
                    resolve(true);
                    return;
                })
                .catch(err => {
                    console.error(err)
                });
            }
        };

        bot.addListener('callback_query', prompt);

        timer = setTimeout(() => {
            bot.removeListener('callback_query', prompt);
            bot.deleteMessage(messageToDel.chat.id, messageToDel.message_id);
            resolve(false);
            return;
        }, 15000);
    });
}

async function cekUsername(id, bot) {
    return new Promise(async (resolve) => {
        let timer, prompt;

        let userData = readJSONFileSync(`database/data_user/${ id }`);

        if(userData[0].username != undefined) {
            resolve(true);
            return;
        };

        await sleep(1000)
        const message = await bot.sendMessage(id, 'Masukkan username anda:');

        prompt = async (msg) => {
            bot.deleteMessage(message.chat.id, message.message_id)
            .then(() => {
                clearTimeout(timer);
                setUsername(message.chat.id, msg.text, bot);
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
        }, 15000);
    })
}

async function cekRealUsername(id, bot) {
    return new Promise(async (resolve) => {
        let timer, prompt;

        let userData = readJSONFileSync(`database/data_user/${ id }`);

        if(userData[1][userData[0].ip].realUser != undefined) {
            resolve(true);
            return;
        };

        await sleep(1000)
        const message = await bot.sendMessage(id, `Masukkan username asli yang anda mainkan di server ${ userData[0].ip } (bukan akun alt/afk):`);

        prompt = async (msg) => {
            bot.deleteMessage(message.chat.id, message.message_id)
            .then(() => {
                clearTimeout(timer);
                setRealUsername(message.chat.id, msg.text, bot)
                .then(() => {
                    bot.removeListener('message', prompt);
                    resolve(true);
                    return;
                });
            })
        };

        bot.addListener('message', prompt);

        timer = setTimeout(() => {
            bot.removeListener('message', prompt);
            bot.deleteMessage(message.chat.id, message.message_id);
            resolve(false);
            return;
        }, 15000);
    })
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

async function cekAlt(id) {
    let dataUser = readJSONFileSync(`database/data_user/${ id }`);
    const user = dataUser[0].username;
    const ip = dataUser[0].ip;
    const realUser = dataUser[1][ip].realUser;
    let listAlt = [];
    if(dataUser[1][ip].alt) listAlt = dataUser[1][ip].alt;

    const index = listAlt.indexOf(user);
    if (index !== -1) {
        removeFromArray(listAlt, realUser);
        dataUser[1][ip].alt = listAlt;
        writeJSONFileSync(`database/data_user/${ id }`, dataUser);
    } else {
        if(user != dataUser[1][ip].realUser) { 
            listAlt.push(user);
            removeFromArray(listAlt, realUser);
            dataUser[1][ip].alt = listAlt;
            writeJSONFileSync(`database/data_user/${ id }`, dataUser);
        }
    }
}

async function playerOnline(botM, chatId, bot, pesan) {
    try {
        let player = [];
        for (const playerName in botM.players) {
            player.push(playerName);
        }
        let jml = player.length;
        player = player.join(', ');

        return bot.sendMessage(chatId, `<b>Players Online(${ jml }):</b>\n\n${ player }`, { parse_mode: 'HTML' });
    } catch(e) {
        console.error(e);
        return bot.sendMessage(chatId, `Terjadi kesalahan`);
    }
}

module.exports = {
    cekUsername, cekVersion, cekIp, playerOnline, cekRealUsername, cekAlt
}