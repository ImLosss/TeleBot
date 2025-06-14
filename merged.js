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

const blocks1 = parseSRT('promosi.srt');
const blocks2 = parseSRT(path_srt);

const merged = [...blocks1, ...blocks2]
  .map((block, i) => {
    const lines = block.split(/\r?\n/);
    lines[0] = String(i + 1); // Re-numbering
    return lines.join('\n');
  });

fs.writeFileSync(path_srt, merged.join('\n\n'), 'utf-8');
console.log(`✅ Merged SRT written to ${path_srt}`);
