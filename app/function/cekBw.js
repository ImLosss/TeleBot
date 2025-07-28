require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync, cutVal, escapeMarkdownV2 } = require('function/utils');
const cache = require('cache');
const fs = require('fs')

async function cekBw(text, config, bot, msg, username) {
    if(config.ID_CHANNEL == msg.chat.id && config.BLACKLIST_WORDS.some(word => text.toLowerCase().includes(word.toLowerCase()))) {
        let warning = readJSONFileSync('./database/warning.json');

        setTimeout(() => {
            bot.sendMessage(config.OWNER[0], `Pesan dari ${username} telah dihapus karena mengandung kata terlarang:\n\`\`\`\n${ escapeMarkdownV2(text) }\n\`\`\``, { parse_mode: 'MarkdownV2' });
            bot.deleteMessage(msg.chat.id, msg.message_id);

            if(warning[msg.from.id] == undefined || warning[msg.from.id].count == 0) {
                warning[msg.from.id] = {};
                warning[msg.from.id].count = 1;
                warning[msg.from.id].message = text;
                warning[msg.from.id].username = username;

                bot.sendMessage(msg.from.id, `Pesan Anda telah dihapus karena mengandung kata terlarang\\. Jika kamu merasa ini adalah kesalahan klik button dibawah ini\\.\n\nPesan kamu:\n\`\`\`\n${ escapeMarkdownV2(text) }\n\`\`\``, {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Laporkan", callback_data: JSON.stringify({ function: "01", id: msg.from.id }) }
                            ]
                        ]
                    }
                });

                let timeout = setTimeout(() => {
                    let warning = readJSONFileSync('./database/warning.json');
                    console.log(`Peringatan ${username} direset`);
                    warning[msg.from.id].count = 0;
                    cache.del(msg.from.id);
                    writeJSONFileSync(`./database/warning.json`, warning);
                }, 1000 * 60 * 60 * 24);

                timeout = Number(timeout);

                cache.set(msg.from.id, timeout);
            } else if (warning[msg.from.id].count == 1) {
                warning[msg.from.id].count += 1;
                warning[msg.from.id].message = text;

                let timeout = cache.get(msg.from.id);

                if(timeout) clearTimeout(timeout);

                timeout = setTimeout(() => {
                    let warning = readJSONFileSync('./database/warning.json');
                    console.log(`Peringatan ${username} direset`);
                    warning[msg.from.id].count = 0;
                    cache.del(msg.from.id);
                    writeJSONFileSync(`./database/warning.json`, warning);
                }, 1000 * 60 * 60 * 24);

                timeout = Number(timeout);

                cache.set(msg.from.id, timeout);

                bot.sendMessage(msg.from.id, `Pesan Anda telah dihapus karena mengandung kata terlarang, *anda akan dikeluarkan dari grup jika mengulanginya*\\. Jika kamu merasa ini adalah kesalahan klik button dibawah ini\\.\n\nPesan kamu:\n\`\`\`\n${ escapeMarkdownV2(text) }\n\`\`\``, {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Laporkan", callback_data: JSON.stringify({ function: "01", id: msg.from.id }) }
                            ]
                        ]
                    }
                });
            } else {
                let timeout = cache.get(msg.from.id);
                if(timeout) {
                    clearTimeout(timeout);
                    cache.del(msg.from.id);
                }

                warning[msg.from.id].count = 0;
                bot.banChatMember(config.ID_CHANNEL, msg.from.id);

                bot.sendMessage(msg.from.id, `Kamu telah dikeluarkan dan diban dari grup obrolan ${config.USERNAME_CHANNEL} karena menggunakan kata terlarang, jika kamu merasa ini adalah kesalahan klik button dibawah untuk meminta unban\\.\n\nPesan kamu:\n\`\`\`\n${ escapeMarkdownV2(text) }\n\`\`\``, {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Ban Appeal🔓", callback_data: JSON.stringify({ function: "01", id: msg.from.id, action: 'ban_appeal' }) }
                            ]
                        ]
                    }
                });

                bot.sendMessage(config.OWNER[0], `${username} telah diban dan dikeluarkan dari grup obrolan ${config.USERNAME_CHANNEL} karena menggunakan kata terlarang:\n\`\`\`\n${ escapeMarkdownV2(text) }\n\`\`\``, 
                {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Unban🔓", callback_data: JSON.stringify({ function: "01", id: msg.from.id, action: 'unban' }) }
                            ]
                        ]
                    } 
                });
            }

            writeJSONFileSync(`./database/warning.json`, warning);

        }, 1000);
    }
}

module.exports = {
    cekBw
};