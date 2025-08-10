require('module-alias/register');
const http = require('http');
const console = require('console');
const { readJSONFileSync } = require('function/utils');

module.exports = function(bot) {
  const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
      console.log(req.url);
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          console.log(payload, 'Sociabuzz payload');

          // Ambil nama & jumlah donasi
          const donor = payload.supporter || payload.donor_name || payload.name || 'Seseorang';
          const amountRaw = payload.amount_settled ?? payload.amount ?? payload.level?.price ?? payload.donation_amount ?? 0;
          const currency = payload.currency_settled || payload.currency || 'IDR';
          const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(Number(amountRaw) || 0);

          // Susun pesan:
          // "<nama> telah melakukan donasi sebesar <amount>."
          // Tambah pesan (jika ada) pakai tanda kutip
          // + ucapan terima kasih bertema donghua
          const userNote = (payload.message && String(payload.message).trim())
            ? `\nPesan: “${String(payload.message).trim()}”`
            : '';

          const config = readJSONFileSync('./config.json');
          const text =
            `${donor} telah melakukan donasi sebesar ${formattedAmount}.${userNote}\n` +
            `Terima kasih atas dukungannya untuk rilisan donghua! 🙏`;

          bot.sendMessage(config.ID_CHANNEL, text).catch(err => console.error('Failed to send message:', err));
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