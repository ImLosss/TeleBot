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

          const donor = payload.donor_name || payload.name || 'Seseorang';
          const amount = payload.amount || payload.donation_amount;
          const message = payload.message ? ` dengan pesan: ${payload.message}` : '';

          const config = readJSONFileSync('./config.json');
          let text = `${donor} telah melakukan donasi`;
          if (amount) text += ` sebesar ${amount}`;
          text += message;

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