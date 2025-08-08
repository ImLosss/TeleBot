require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require('function/utils');
const moment = require('moment-timezone');
moment.locale('id');

const schedulePath = './database/jadwal.json';
const days = ['senin','selasa','rabu','kamis','jumat','sabtu','minggu'];

function getKeyboard() {
    const buttons = days.map(d => ({ text: capitalize(d), callback_data: JSON.stringify({ function: 'jadwal_select', day: d }) }));
    const keyboard = [];
    for (let i = 0; i < buttons.length; i += 3) {
        keyboard.push(buttons.slice(i, i + 3));
    }
    // keyboard.push([{ text: 'Hari ini', callback_data: JSON.stringify({ function: 'jadwal_select', day: 'today' }) }]);
    return keyboard;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function readSchedule() {
    try {
        return readJSONFileSync(schedulePath);
    } catch (e) {
        return {};
    }
}

function writeSchedule(data) {
    writeJSONFileSync(schedulePath, data);
}

function formatText(day, schedule) {
    const label = day === getToday() ? 'hari ini' : `hari ${capitalize(day)}`;
    const list = schedule[day] || [];
    let text = `*Jadwal Donghua ${label}:*\n`;
    if (list.length === 0) text += '- Tidak ada jadwal';
    else list.forEach((item, i) => { text += `${i+1}. ${item}\n`; });
    return text;
}

function getToday() {
    return moment().tz('Asia/Makassar').format('dddd').toLowerCase();
}

async function jadwal(bot, msg, value, config) {
    const chatId = msg.chat.id;
    const args = value ? value.split(' ') : [];
    const schedule = readSchedule();

    if (msg.chat.type !== 'private') {
        const day = args[0] ? args[0].toLowerCase() : 'today';
        const target = day === 'today' ? getToday() : day;
        return bot.sendMessage(chatId, formatText(target, schedule), { parse_mode: 'Markdown', reply_markup: { inline_keyboard: getKeyboard() } });
    }

    if (!config.OWNER.includes(msg.from.id)) {
        return bot.sendMessage(chatId, 'Perintah ini khusus owner.');
    }

    const action = args[0] ? args[0].toLowerCase() : '';

    if (action === 'add') {
        const day = args[1] ? args[1].toLowerCase() : '';
        const item = args.slice(2).join(' ');
        if (!days.includes(day) || !item) {
            return bot.sendMessage(chatId, 'Format: /jadwal add <hari> <judul>');
        }
        if (!schedule[day]) schedule[day] = [];
        schedule[day].push(item);
        writeSchedule(schedule);
        return bot.sendMessage(chatId, `Berhasil menambahkan jadwal ke ${capitalize(day)}.`);
    }

    if (action === 'rm') {
        const day = args[1] ? args[1].toLowerCase() : '';
        const index = parseInt(args[2], 10) - 1;
        if (!days.includes(day) || isNaN(index)) {
            return bot.sendMessage(chatId, 'Format: /jadwal rm <hari> <nomor>');
        }
        if (!schedule[day] || !schedule[day][index]) {
            return bot.sendMessage(chatId, 'Data tidak ditemukan.');
        }
        schedule[day].splice(index, 1);
        writeSchedule(schedule);
        return bot.sendMessage(chatId, `Berhasil menghapus jadwal dari ${capitalize(day)}.`);
    }

    const day = action ? action.toLowerCase() : 'today';
    const target = day === 'today' ? getToday() : day;
    if (!days.includes(target)) {
        return bot.sendMessage(chatId, 'Hari tidak valid.');
    }
    return bot.sendMessage(chatId, formatText(target, schedule), { parse_mode: 'Markdown', reply_markup: { inline_keyboard: getKeyboard() } });
}

async function jadwal_select(bot, query, data) {
    let config = readJSONFileSync(`./config.json`);
    if(query.message.chat.id == config.ID_CHANNEL) return;
    const schedule = readSchedule();
    const day = data.day === 'today' ? getToday() : data.day;
    return bot.sendMessage(query.message.chat.id, formatText(day, schedule), { parse_mode: 'Markdown', reply_markup: { inline_keyboard: getKeyboard() } });
}

module.exports = {
    jadwal,
    jadwal_select
};