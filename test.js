const { exec, execSync } = require('child_process');

exec(`yt-dlp -q --no-warnings --no-call-home --no-check-certificate --cookies-from-browser firefox --list-subs --skip-download "https://youtu.be/fZtWRYfaUAM?si=CYkRCmQ5Hi0_4Dot"`, { maxBuffer: 1024 * 1024 * 200 }, async (error, stdout, stderr) => {
        if (error) {
            console.log('stderr:', stderr);
            // return bot.sendMessage(chat_id, `Gagal mengambil subtitle atau subtitle tidak tersedia.`);
        }

        const list_subs = await get_subs(stdout);

        console.log(list_subs);
    });

async function get_subs(stdout) {
    const lines = stdout.split('\n');
    const startIdx = lines.findIndex(line => line.includes('Language Name') || line.includes('Language Format') || line.includes('Language'));
    let subtitleLines = [];
    if (startIdx !== -1) {
        for (let i = startIdx + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            console.log(line);
            if (!line || line.startsWith('{')) break;
            subtitleLines.push(line);
        }
    }

    if (subtitleLines.length === 0) return [];

    const allowedExts = ['srt', 'ass', 'ssa', 'vtt', 'sup', 'sub', 'idx'];

    const subtitleJson = subtitleLines.map(line => {
        const clean = line.replace(/^\d+:\s*/, '').trim();

        console.log(clean);

        // Format: kode nama format1, format2, ...
        let match = clean.match(/^([a-z-]+)\s+(.+?)\s+([a-z0-9,\s-]+)$/i);
        if (match) {
            const formats = match[3].split(',').map(f => f.trim()).filter(f => allowedExts.includes(f));
            return {
                lang: match[1],
                name: match[2].trim(),
                format: formats
            };
        }

        // Format: kode format1, format2, ...
        match = clean.match(/^([a-z-]+)\s+([a-z0-9,\s-]+)$/i);
        if (match) {
            const formats = match[2].split(',').map(f => f.trim()).filter(f => allowedExts.includes(f));
            return {
                lang: match[1],
                name: '',
                format: formats
            };
        }

        // Fallback
        return { lang: '', name: '', format: [] };
    }).filter(obj => obj.format.length > 0 && /^[a-z]{2,3}(-[a-z]{2,3})?$/i.test(obj.lang) && !obj.lang.includes('-')); // hanya yang punya format yang diizinkan

    return subtitleJson;
}