require('module-alias/register');
const console = require('console');
const { writeJSONFileSync, cutVal } = require('function/utils');
const { parse } = require('path');

async function bw(bot, value, config, fromId) {
    if (value.length < 2) return bot.sendMessage(fromId, 'Command salah, kirim kembali dengan format: `/bw <add/rm/list> <word>`.');

    if(value.startsWith('add')) {
        value = cutVal(value, 1);

        if(config.BLACKLIST_WORDS.includes(value)) {
            return bot.sendMessage(fromId, `Kata *${value}* sudah ada dalam blacklist.`, { parse_mode: 'Markdown' });
        }

        config.BLACKLIST_WORDS.push(value);

        bot.sendMessage(fromId, `Kata *${value}* berhasil ditambahkan ke blacklist.`, { parse_mode: 'Markdown' });
    } else if(value.startsWith('rm')) {
        value = cutVal(value, 1);

        const initialLength = config.BLACKLIST_WORDS.length;
        config.BLACKLIST_WORDS = config.BLACKLIST_WORDS.filter(word => word !== value);

        if(config.BLACKLIST_WORDS.length === initialLength) return bot.sendMessage(fromId, `Kata *${value}* tidak ditemukan dalam blacklist.`, { parse_mode: 'Markdown' });

        bot.sendMessage(fromId, `Kata *${value}* berhasil dihapus dari blacklist.`, { parse_mode: 'Markdown' });
    } else if(value.startsWith('list')) {
        if(config.BLACKLIST_WORDS.length == 0) return bot.sendMessage(fromId, 'Blacklist masih kosong.');

        return bot.sendMessage(fromId, `Daftar kata yang diblacklist:\n- ${config.BLACKLIST_WORDS.join('\n- ')}`);
    } else return bot.sendMessage(fromId, 'Command salah, kirim kembali dengan format: `</bw add/rm/list> <word>`');

    writeJSONFileSync('./config.json', config);
}

module.exports = {
    bw
};