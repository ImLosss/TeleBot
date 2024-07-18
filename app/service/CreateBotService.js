const fs = require('fs');
const { setVersion, readJSONFileSync, getValue, setUsername, sleep } = require('../function/function');
const console = require('../logs/console');
const lockfile = require('proper-lockfile');

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
                inline_keyboard: [data, [{ text: 'Auto', callback_data: JSON.stringify({ action: 'button_click_await', cmd: 'version', data: 'auto' }) }]]
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
        }, 5000);
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
        }, 5000);
    })
}

module.exports = {
    cekUsername, cekVersion
}