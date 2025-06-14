const fs = require('fs');

const [, , path_srt] = process.argv;

if (!path_srt) {
  console.error('❌ Usage: node merged.js path_to_srt');
  process.exit(1);
}

function parseSRT(file) {
  const content = fs.readFileSync(file, 'utf-8');
  return content.split(/\r?\n\r?\n/).map((block) => block.trim()).filter(Boolean);
}

// ⏱️ Fungsi untuk mengubah string waktu jadi detik
function timeToSeconds(timeStr) {
  const [h, m, s] = timeStr.split(':');
  const [sec, ms] = s.split(',');
  return Number(h) * 3600 + Number(m) * 60 + Number(sec) + Number(ms) / 1000;
}

// 🕒 Cari detik awal dari subtitle pertama
function getFirstStartTime(blocks) {
  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    if (lines.length >= 2) {
      const match = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})/);
      if (match) {
        return timeToSeconds(match[1]);
      }
    }
  }
  return 25; // default fallback
}

// 🔄 Ubah durasi promosi.srt
function adjustPromoDuration(promoBlock, endSeconds) {
  const lines = promoBlock.split(/\r?\n/);
  if (lines.length < 2) return promoBlock;

  const start = "00:00:00,000";
  const endSec = Math.min(endSeconds, 25); // maksimal 25 detik
  const sec = Math.floor(endSec);
  const ms = Math.floor((endSec - sec) * 1000);
  const end = `00:00:${String(sec).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  lines[1] = `${start} --> ${end}`;

  return lines.join('\n');
}

// 🔄 Proses utama
const blocks1 = parseSRT('promosi.srt');
const blocks2 = parseSRT(path_srt);

const firstStart = getFirstStartTime(blocks2);
const promoFixed = adjustPromoDuration(blocks1[0], firstStart);

// Gabungkan dan renumber
const merged = [promoFixed, ...blocks2]
  .map((block, i) => {
    const lines = block.split(/\r?\n/);
    lines[0] = String(i + 1);
    return lines.join('\n');
  });

fs.writeFileSync(path_srt, merged.join('\n\n'), 'utf-8');
console.log(`✅ Merged SRT with dynamic promo duration written to ${path_srt}`);
