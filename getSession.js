require('module-alias/register');
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // untuk input terminal
const { readJSONFileSync, writeJSONFileSync } = require("function/utils");

let config = readJSONFileSync('./config2.json');
const apiId = config.API_ID; // ganti
const apiHash = config.API_HASH; // ganti
const stringSession = new StringSession(""); // kosong dulu

(async () => {
  console.log("🔄 Loading client...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("📱 Nomor HP: "),
    password: async () => await input.text("🔐 Password 2FA (jika ada): "),
    phoneCode: async () => await input.text("📩 Kode verifikasi: "),
    onError: (err) => console.log(err),
  });

  console.log("✅ Login berhasil!");
  console.log("🔐 Simpan String Session ini:");
  console.log(client.session.save());

  await client.sendMessage("me", { message: client.session.save() });
})();
