require('module-alias/register');
const console = require('console');
const { exec, execSync } = require('child_process');
const { readJSONFileSync, cutVal, isJSON } = require('function/utils');
const { uploadFile, generatePublicURL, deleteFileDrive, emptyTrash } = require('function/drive');
const { sendBigFile } = require('function/sendBigFile');
const path = require('path');
const fs = require('fs');

async function downloadIqiyi(bot, msg, value, config) {
    if (!value) return bot.sendMessage(msg.chat.id, 'Silakan kirim link video yang valid.');

    let url = value;
    let hardsub = false;
    let fontSize, y, outline;
    let format_id = value.split(' ')[1];
    let ext = 'mkv';
    if (value.startsWith('true')) {
        value = value.split(' ');
        ext = 'mp4';
        if (value.length < 4) return bot.sendMessage(msg.chat.id, 'Format input tidak valid. Gunakan: `/iq true <url> <fontSize> <y>`');

        url = value[1];
        hardsub = true;
        fontSize = value[2];
        y  = value[3];
        outline = 1;
        format_id = '600';
    }

    let id = Math.random().toString(36).substr(2, 3);

    if (!url) {
        return bot.answerCallbackQuery(url, { text: 'URL tidak ditemukan.' });
    }

    const outputDir = path.resolve(__dirname, '../../downloads');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputTemplate = path.join(outputDir, `${id}.%(ext)s`);
    cmd = `yt-dlp -f ${format_id} --remux-video ${ext} --write-sub --sub-langs id --sub-format srt --embed-subs -o "${outputTemplate}" "${url}" --no-warnings --no-call-home --no-check-certificate --ffmpeg-location /usr/bin/ffmpeg --cookies-from-browser firefox`;

    if (hardsub) cmd = `yt-dlp -f ${format_id} --remux-video ${ext} --write-sub --sub-langs id --sub-format srt -o "${outputTemplate}" "${url}" --no-warnings --no-call-home --no-check-certificate --ffmpeg-location /usr/bin/ffmpeg --cookies-from-browser firefox && sed -i 's/<[^>]*>//g' downloads/${id}.id.srt && ffmpeg -i "downloads/${id}.${ext}" -crf "27" -vf "subtitles=downloads/${id}.id.srt:force_style='FontName=ITC Officina Sans,FontSize=${fontSize},PrimaryColour=&HFFFFFF&,Outline=${outline},MarginV=${y},Bold=1'" -c:a copy "downloads/${id}_hardsub.${ext}" && ffmpeg -y -ss 1 -i "downloads/${id}_hardsub.${ext}" -frames:v 1 -q:v 2 "downloads/ss1.png" && ffmpeg -y -ss 300 -i "downloads/${id}_hardsub.${ext}" -frames:v 1 -q:v 2 "downloads/ss2.png" && ffmpeg -y -ss 480 -i "downloads/${id}_hardsub.${ext}" -frames:v 1 -q:v 2 "downloads/ss3.png"`;

    const loadingMsg = await bot.sendMessage(msg.chat.id, 'Mulai mendownload...');

    exec(cmd, { maxBuffer: 1024 * 1024 * 100 }, (error, stdout, stderr) => {
        if (error) {
            console.log(stderr, 'stderr');
            // return bot.sendMessage(query.message.chat.id, `Gagal mengunduh video: ${stderr || error.message}`);
        }

        // Cari file hasil download
        fs.readdir(outputDir, async (err, files) => {
            if (err) return bot.sendMessage(msg.chat.id, 'Gagal membaca file hasil unduhan.');

            const videoExts = ['.mp4', '.mkv']; // tambahkan sesuai kebutuhan
            const userFiles = files
                .filter(f => f.startsWith(id) && videoExts.includes(path.extname(f).toLowerCase()))
                .map(f => ({ file: f, time: fs.statSync(path.join(outputDir, f)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time);

            if (!userFiles.length) {
                return bot.sendMessage(msg.chat.id, 'File video tidak ditemukan.');
            }

            const videoPath = path.join(outputDir, userFiles[0].file);
            let durationStr = getDuration(videoPath);
            const stats = fs.statSync(videoPath);
            bot.deleteMessage(msg.chat.id, loadingMsg.message_id);
            if (stats.size > 50 * 1024 * 1024) {
                let tempMsg = await bot.sendMessage(msg.chat.id, 'Mengirim file...');
                await sendBigFile(videoPath)
                .then(() => {
                    bot.deleteMessage(msg.chat.id, tempMsg.message_id)
                    deleteFiles(outputDir, id);
                }).catch(() => {
                    bot.deleteMessage(msg.chat.id, tempMsg.message_id)
                    bot.sendMessage(msg.chat.id, 'Gagal mengirim file.');
                });

            }
            else {
                bot.sendChatAction(msg.chat.id, 'upload_video');
                bot.sendVideo(msg.chat.id, videoPath, { caption: `File berhasil diunduh`, parse_mode: 'Markdown' })
                .then(() => {
                    deleteFiles(outputDir, id);
                })
                .catch(() => {
                    bot.sendMessage(msg.chat.id, `Hanya bisa mengirim file dengan ukuran maksimal 50 MB. (${ Math.floor(stats.size / 1048576) } MB)`);
                    deleteFiles(outputDir, id);
                });
            }
        });
    });
}

function getDuration (videoPath) {
    try {
        const ffprobeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
        const output = execSync(ffprobeCmd).toString().trim();
        const seconds = parseFloat(output);
        if (isNaN(seconds)) return '';
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    } catch (e) {
        console.log(`gagal mengambil durasi: ${ e.message }`, 'error');
        return '';
    }
};

function deleteFiles(outputDir, id) {
    fs.readdir(outputDir, (err, files) => {
        if (err) return;
        files
            .filter(f => f.startsWith(id))
            .forEach(f => fs.unlink(path.join(outputDir, f), () => {}));
    });
}

module.exports = {
    downloadIqiyi
}