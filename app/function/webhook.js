require('module-alias/register');
const http = require('http');
const console = require('console');
const { readJSONFileSync } = require('function/utils');

module.exports = function(bot) {
  const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const headerToken = req.headers["sb-webhook-token"];
          if(headerToken != "sbwhook-lwatbodiymchocuj2fdbt1qs") return;
          console.log(payload, 'Sociabuzz payload');

          // Ambil nama & jumlah donasi
          const donor = payload.supporter == "Someone" ? 'Seseorang' : payload.supporter;
          const amountRaw = payload.amount_settled ?? payload.amount ?? payload.level?.price ?? payload.donation_amount ?? 0;
          const currency = payload.currency_settled || payload.currency || 'IDR';
          const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(Number(amountRaw) || 0);

          // Format dengan kutipan Telegram (blockquote)
          const esc = (s) => String(s ?? '').replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]));
          const donorLine = `✨ ${esc(donor)} telah melakukan donasi sebesar <b>${formattedAmount}</b>. ✨`;
          const noteBlock = (payload.message && String(payload.message).trim())
            ? `\n\n<blockquote>${esc(String(payload.message).trim())}</blockquote>\n`
            : '';

          const config = readJSONFileSync('./config.json');
          const text = `${donorLine}${noteBlock}\nDukunganmu sangat membantu kami agar dapat rilis lebih cepat. 🙏\n\n#donation`;

          bot.sendMessage(config.ID_CHANNEL, text, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Dukung Kami', url: 'https://sociabuzz.com/dongworld/tribe' }]] } }).catch(err => console.error('Failed to send message:', err));
        } catch (e) {
          console.error('Error handling Sociabuzz webhook:', e);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      });
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    }
  });

  const PORT = process.env.PORT || 2045;
  server.listen(PORT, () => console.log(`Sociabuzz webhook listening on port ${PORT}`));
};