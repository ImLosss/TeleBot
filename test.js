const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");
const config = require("./config2.json");
const { Api } = require("telegram");

const apiId = 22345648; // ganti
const apiHash = "35b9687edeb4c4d2a825052100b9d069";
const stringSession = new StringSession(config.STRING_SESSION || "");

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

(async () => {
  await client.start();

  console.log("🔓 Login sebagai:", await client.getMe());

  // 🔔 Listener untuk semua pesan masuk
  client.addEventHandler(async (event) => {
    const message = event.message;
    const sender = await message.getSender();

    console.log(`📩 Pesan dari ${sender?.username || sender?.phone || "unknown"}:`, message.text);

    // Opsional: Balas pesan
    await message.reply({
        message: "Halo! Saya sedang aktif ✨",
        buttons: [
            [
            {
                text: "🌐 Website",
                url: "https://example.com",
            },
            ],
            [
            {
                text: "🔁 Ping",
                callback_data: "terss",
            },
            ],
        ],
    });
  }, new NewMessage({ incoming: true }));

  console.log("🤖 Bot siap menerima pesan.");
})();
