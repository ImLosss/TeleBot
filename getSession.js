const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // untuk input terminal

const apiId = 22345648; // ganti
const apiHash = "35b9687edeb4c4d2a825052100b9d069"; // ganti
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
