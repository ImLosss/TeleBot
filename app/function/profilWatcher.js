require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('function/utils');

async function profileWatcher(bot, msg) {
    if (msg.from.is_bot) return;
    let dataUsers = readJSONFileSync(`./database/users.json`);
    let userId = msg.from.id;
    let username = msg.from.username ? `@${msg.from.username}` : 'None';
    let name = msg.from.first_name + ' ' + (msg.from.last_name || '');

    if(!dataUsers[userId]) {
        dataUsers[userId] = {
            username: username,
            name: name
        };
        return writeJSONFileSync(`./database/users.json`, dataUsers);
    }

    if(dataUsers[userId].username !== username || dataUsers[userId].name !== name) {
        const username_str = username != dataUsers[userId].username ? `› Username: ${dataUsers[userId].username} → ${username}\n` : '';
        const name_str = name != dataUsers[userId].name ? `› Nama: *${dataUsers[userId].name}* → *${name}*\n` : '';
        const text = `🔍 *Terdeteksi Perubahan Profil*\n🆔 [UID${userId}](tg://user?id=${userId})\n\n📋*Detail Perubahan:*\n${username_str}${name_str}`;
        bot.sendMessage(msg.chat.id, text, { reply_to_message_id: msg.message_id, parse_mode: 'Markdown' });
        if(!dataUsers[userId]) {
            dataUsers[userId] = {
                username: username,
                name: name
            };
            return writeJSONFileSync(`./database/users.json`, dataUsers);
        }
        dataUsers[userId].username = username;
        dataUsers[userId].name = name;
        return writeJSONFileSync(`./database/users.json`, dataUsers);
    }

    return
}

module.exports = {
    profileWatcher
};