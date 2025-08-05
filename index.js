require('module-alias/register');
const TelegramBot = require('node-telegram-bot-api');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync } = require("function/utils");
const fs = require('fs');
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
let config = readJSONFileSync('./config2.json');

const apiId = config.API_ID; // ganti
const apiHash = config.API_HASH;
const stringSession = new StringSession(config.STRING_SESSION || "");

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

(async () => {
  await client.start(); // Tidak perlu parameter jika string session sudah ada

  console.log(await client.getMe(), 'Login sebagai');
})();

config.RECEIVE_MESSAGE = false;
writeJSONFileSync('./config.json', config);

setTimeout(() => {
    let config = readJSONFileSync('./config2.json');
    config.RECEIVE_MESSAGE = true;
    writeJSONFileSync('./config2.json', config);
    console.log("Bot aktif dan hanya menerima pesan baru.");
}, 5000);

if(!fs.existsSync('./app/logs/log.json')) writeJSONFileSync('./app/logs/log.json', []);

if(!fs.existsSync('./app/logs/error.json')) writeJSONFileSync('./app/logs/error.json', []);

if(!fs.existsSync('./database/warning.json')) writeJSONFileSync('./database/warning.json', {})

require('import')(client);