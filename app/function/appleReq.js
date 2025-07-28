require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('function/utils');

async function appleReq(bot, query, data) {
    let warning = readJSONFileSync(`./database/warning.json`);
    let config = readJSONFileSync('./config.json');
    let username = warning[data.id]?.username || 'seseorang';
    let message = warning[data.id]?.message || 'data terhapus';

    if(data.action == "ban_appeal") {
        bot.sendMessage(config.OWNER[0], `*${username}* telah mengajukan banding untuk unban\\.\n\nPesan yang dihapus:\n\`\`\`\n${message}\n\`\`\``, {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Unban🔓", callback_data: JSON.stringify({ function: "01", id: data.id, action: 'unban' }) }
                    ],
                    [
                        { text: "Tolak❌", callback_data: JSON.stringify({ function: "01", id: data.id, action: 'reject_unban' }) }
                    ]
                ]
            } 
        });

        bot.sendMessage(data.id, 'Pengajuan unban kamu telah dikirimkan ke admin.');
    } else if(data.action == "unban") {
        bot.unbanChatMember(config.ID_CHANNEL, data.id);
        delete warning[data.id];
        writeJSONFileSync(`./database/warning.json`, warning);
        bot.sendMessage(config.OWNER[0], `Pengguna ${username} telah diunban.`);
        bot.sendMessage(data.id, `Kamu telah diunban dari grup obrolan ${config.USERNAME_CHANNEL}. Silakan bergabung kembali.`);
    } else if (data.action == "reset") {
        warning[data.id].count = 0;
        writeJSONFileSync(`./database/warning.json`, warning);

        bot.sendMessage(config.OWNER[0], `Peringatan untuk ${username} telah direset.`);
        bot.sendMessage(data.id, `Peringatan kamu telah dihapus. Mohon patuhi aturan di grup obrolan ${config.USERNAME_CHANNEL}.`);
    } else if (data.action == "reject_unban") {
        bot.sendMessage(data.id, 'Pengajuan unban kamu telah ditolak.');
    } else if (data.action == "reset_warning") {
        delete warning[data.id];
        writeJSONFileSync(`./database/warning.json`, warning);
        bot.sendMessage(config.OWNER[0], `Warning ${username} telah direset.`);
    } else {
        bot.sendMessage(config.OWNER[0], `*${username}* meminta untuk menghapus peringatannya\\.\n\nPesan yang dihapus:\n\`\`\`\n${message}\n\`\`\``, {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Terima✅", callback_data: JSON.stringify({ function: "01", id: data.id, action: 'reset_warning' }) }
                    ]
                ]
            } 
        });

        bot.sendMessage(data.id, 'Laporan telah dikirimkan ke admin.');
    }
}

module.exports = {
    appleReq
};