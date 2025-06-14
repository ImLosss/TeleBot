require('module-alias/register');
const console = require('console');
const { exec, execSync } = require('child_process');
const { readJSONFileSync, cutVal, isJSON } = require('function/utils');
const { uploadFile, generatePublicURL, deleteFileDrive, emptyTrash } = require('function/drive');
const path = require('path');
const fs = require('fs');

async function downloadIqiyi(bot, msg, value, config) {
    if (!value) return bot.sendMessage(msg.chat.id, 'Silakan kirim link video yang valid.');

    let url = value;
    let hardsub = false;
    let fontSize, y, outline, wmSize;
    let format_id = value.split(' ')[2];
    if (value.startsWith('true')) {
        value = value.split(' ');

        if (value.length < 6) return bot.sendMessage(msg.chat.id, 'Format input tidak valid. Gunakan: `/dlvs true <url> <fontSize> <y> <outline> <wmSize>`');

        url = value[1];
        hardsub = true;
        fontSize = value[2];
        y  = value[3];
        outline = value[4];
        wmSize = value[5];
        format_id = value[6]
    }

    const loadingMsg = await bot.sendMessage(msg.chat.id, 'Mulai mendownload...');
    let id = Math.random().toString(36).substr(2, 3);

    if (!url) {
        return bot.answerCallbackQuery(url, { text: 'URL tidak ditemukan.' });
    }

    const outputDir = path.resolve(__dirname, '../../downloads');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputTemplate = path.join(outputDir, `${id}.%(ext)s`);
    cmd = `yt-dlp -f ${format_id} --remux-video ${ext} --write-sub --sub-langs id --sub-format srt --embed-subs -o "${outputTemplate}" "${url}" --no-warnings --no-call-home --no-check-certificate --ffmpeg-location /usr/bin/ffmpeg --cookies-from-browser firefox`;

    if (hardsub) cmd = `yt-dlp -f ${format_id} --remux-video ${ext} --write-sub --sub-langs id --sub-format srt -o "${outputTemplate}" "${url}" --no-warnings --no-call-home --no-check-certificate --ffmpeg-location /usr/bin/ffmpeg --cookies-from-browser firefox && ffmpeg -i "downloads/${id}.${ext}" -crf "27" -vf "subtitles=downloads/${id}.id.srt:force_style='FontName=Arial,FontSize=${fontSize},PrimaryColour=&HFFFFFF&,Outline=${outline},MarginV=${y},Bold=1',drawtext=text='DongWorld':font=Verdana:fontsize=${wmSize}:fontcolor=white@0.5:x=15:y=15" -c:a copy "downloads/${id}_hardsub.${ext}"`;

    bot.answerCallbackQuery(query.id, { text: 'Sedang mengunduh video...' });

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
                let tempMsg = await bot.sendMessage(msg.chat.id, 'File lebih dari 50 MB, mengupload ke Google Drive...');
                uploadFile(videoPath, path.basename(videoPath))
                    .then(async (fileId) => {
                        if (!fileId) {
                            bot.sendMessage(msg.chat.id, 'Gagal upload ke Google Drive.');
                            fs.unlink(videoPath, () => {});
                            return;
                        }
                        const linkData = await generatePublicURL(fileId);
                        if (linkData && linkData.webViewLink) {
                            bot.sendMessage(msg.chat.id, {
                                caption: `File berhasil diupload ke Google Drive\n\n*Durasi:* ${durationStr}\n*Filesize:* ${Math.floor(stats.size / 1048576)}mb\n\nFile akan dihapus dalam 1 jam kedepan`,
                                parse_mode: 'Markdown',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            { text: 'Download', url: linkData.webViewLink }
                                        ]
                                    ]
                                }
                            })
                            .then((msg) => {
                                bot.deleteMessage(msg.chat.id, tempMsg.message_id)
                                fs.unlink(videoPath, () => {});

                                setTimeout(() => {
                                    deleteFileDrive(fileId).then(() => { 
                                        emptyTrash();
                                        bot.deleteMessage(msg.chat.id, msg.message_id)
                                    })
                                }, 3600000);
                            });
                        } else {
                            bot.sendMessage(msg.chat.id, 'Terjadi kesalahan saat mengupload file anda');
                            fs.unlink(videoPath, () => {});
                        }
                    })
                    .catch((err) => {
                        bot.sendMessage(msg.chat.id, 'Gagal upload ke Google Drive.');
                        fs.unlink(videoPath, () => {});
                    });
            }
            else {
                bot.sendChatAction(msg.chat.id, 'upload_video');
                bot.sendVideo(msg.chat.id, videoPath, { caption: `File berhasil diunduh`, parse_mode: 'Markdown' })
                .then(() => {
                    fs.readdir(outputDir, (err, files) => {
                        if (err) return;
                        files
                            .filter(f => f.startsWith(id))
                            .forEach(f => fs.unlink(path.join(outputDir, f), () => {}));
                    });
                })
                .catch(() => {
                    bot.sendMessage(msg.chat.id, `Hanya bisa mengirim file dengan ukuran maksimal 50 MB. (${ Math.floor(stats.size / 1048576) } MB)`);
                    fs.unlink(videoPath, () => {});
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

module.exports = {
    dlvs, downloadIqiyi
}