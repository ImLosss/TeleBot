require('module-alias/register');
const TelegramBot = require('node-telegram-bot-api');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require("function/utils");
const fs = require('fs');
const cache = require('cache');

// Ganti token ini dengan token bot Anda
let config = readJSONFileSync('./config.json');
config.RECEIVE_MESSAGE = false;
writeJSONFileSync('./config.json', config);

setTimeout(() => {
    let config = readJSONFileSync('./config.json');
    config.RECEIVE_MESSAGE = true;
    writeJSONFileSync('./config.json', config);
    console.log("Bot aktif dan hanya menerima pesan baru.");
}, 5000);

// Buat instance bot
const bot = new TelegramBot(config.API_TELEGRAM, { polling: false });

if(!fs.existsSync('./app/logs/log.json')) writeJSONFileSync('./app/logs/log.json', []);

if(!fs.existsSync('./app/logs/error.json')) writeJSONFileSync('./app/logs/error.json', []);

if(!fs.existsSync('./database/warning.json')) writeJSONFileSync('./database/warning.json', {})

// Fungsi untuk memulai bot setelah pesan lama dihapus
async function startBot() {

    // Mulai polling setelah membersihkan pesan lama
    bot.startPolling();

    require('import')(bot);
}

// Jalankan fungsi untuk membersihkan pesan lama & mulai bot
startBot();


// errorHandling
bot.on('polling_error', (err) => {
    console.error(err);
})