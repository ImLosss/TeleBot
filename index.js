const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment-timezone');
const fungsi = require('./app/function/function');

// Ganti token ini dengan token bot Anda
const token = '6407569253:AAGtuRac6eA52IQBrLjjmlDcaqGH9SE8Eyc';

// Buat instance bot
const bot = new TelegramBot(token, { polling: true });
require('./listeners/createBot')(bot);
require('./listeners/callback')(bot);
require('./listeners/cekDatabase')(bot);


// errorHandling
bot.on('polling_error', (err) => {
    // Tentukan zona waktu Makassar
    const time = fungsi.getTime();

    console.log(`[${ time } / Error] ${ err.message }`);

    fungsi.saveError(err);
})