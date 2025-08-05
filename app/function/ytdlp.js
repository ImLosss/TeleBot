require('module-alias/register');
const console = require('console');
const { exec, execSync } = require('child_process');
const { readJSONFileSync, cutVal, isJSON } = require('function/utils');
const { uploadFile, generatePublicURL, deleteFileDrive, emptyTrash } = require('function/drive');
const { sendBigFile } = require('function/sendBigFile');
const path = require('path');
const fs = require('fs');
const { send } = require('process');

let tempData = {};

async function ytdlp(bot, msg, value, config) {
    if (!value) return bot.sendMessage(msg.chat.id, 'Silakan kirim link video yang valid.');

    const loadingMsg = await bot.sendMessage(msg.chat.id, 'Mengambil daftar format, mohon tunggu...');

    // Tambahkan --no-warnings dan --no-call-home untuk meminimalisir output non-JSON
    exec(`yt-dlp -J --no-warnings --no-call-home --no-check-certificate --cookies-from-browser firefox -F "${value}"`, { maxBuffer: 1024 * 1024 * 200 }, (error, stdout, stderr) => {
        if (error) {
            console.log(stderr);
            console.log('stderr:', stderr.message);
            return bot.sendMessage(msg.chat.id, `Gagal mengambil format`);
        }

        // Cari baris pertama yang valid JSON
        let jsonStr = '';
        const lines = stdout.split('\n');
        for (const line of lines) {
            if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
                jsonStr = line.trim();
                break;
            }
        }
        if (!jsonStr) {
            return bot.sendMessage(msg.chat.id, 'Gagal memproses data JSON dari yt-dlp.');
        }

        let info;
        try {
            info = JSON.parse(jsonStr);
        } catch (e) {
            return bot.sendMessage(msg.chat.id, 'Gagal memproses data JSON dari yt-dlp.');
        }

        if (!info.formats || info.formats.length === 0) {
            return bot.sendMessage(msg.chat.id, 'Tidak ditemukan format yang tersedia.');
        }

        const durationSeconds = info.duration; // durasi dalam detik
        const durationFormatted = durationSeconds
            ? '[' + new Date(durationSeconds * 1000).toISOString().substr(11, 8) + ']'
            : '';

        // Ambil maksimal 8 format agar tombol tidak terlalu banyak
        let id = Math.random().toString(36).substr(2, 3);
        const maxButtons = 40;
        const allowedRes = ['360', '362', '480', '512', '536', '720', '848', '864', '1080', '1280', '1920' ];
        const buttonData = info.formats
            .filter(fmt => {
                console.log(fmt);
                let res = (fmt.resolution || fmt.format_note || '').toLowerCase();
                return allowedRes.some(r => res.includes(r)) && fmt.ext !== 'webm';
            })
            .slice(0, maxButtons)
            .map(fmt => {
                let sizeMB = '';
                if (fmt.filesize) {
                    sizeMB = ` | ${(fmt.filesize / 1048576).toFixed(2)} MB`;
                } else if (fmt.filesize_approx) {
                    sizeMB = ` | ~${(fmt.filesize_approx / 1048576).toFixed(2)} MB`;
                }

                let res = (fmt.resolution || fmt.format_note || '').toLowerCase();

                let subid = Math.random().toString(36).substr(2, 5);
                if(tempData[id] === undefined) tempData[id] = {};
                tempData[id][subid] = {title: info.title, res: res, thumbnail: info.thumbnail, url: value, format_id: fmt.format_id, acodec: fmt.acodec == 'none' ? false : true, ext: fmt.ext, user_id: msg.from.id, id: id}; // Simpan URL sementara
                return {
                    text: `${fmt.ext} | ${fmt.resolution || fmt.format_note || ''}${sizeMB}`,
                    callback_data: JSON.stringify({ function: 'downloadVideo', arg1: id, arg2: subid })
                };
            });
        // Bagi menjadi baris berisi maksimal 2 tombol
        const buttons = [];
        if (buttonData.length === 0) return bot.sendMessage(msg.chat.id, 'Tidak ada format yang sesuai.');
        for (let i = 0; i < buttonData.length; i += 2) {
            buttons.push(buttonData.slice(i, i + 2));
        }

        bot.sendMessage(msg.chat.id, `Pilih format yang diinginkan: ${durationFormatted}`, {
            reply_markup: {
                inline_keyboard: buttons
            }
        })
        .then(() => {
            bot.deleteMessage(msg.chat.id, loadingMsg.message_id)
        })
    });
}

async function downloadVideo(bot, query, data) {
    let id = data.arg1;
    let subid = data.arg2;
    let format_id = tempData[id][subid].format_id;
    let title = tempData[id][subid].title;
    let res = tempData[id][subid].res;
    let url_thumbnail = tempData[id][subid].thumbnail || "https://thumbs.dreamstime.com/b/no-thumbnail-images-placeholder-forums-blogs-websites-148010338.jpg?w=768";
    let url = tempData[id][subid].url;
    let acodec = tempData[id][subid].acodec;
    let ext = tempData[id][subid].ext;
    tempData[id] = null;
    console.log(`${format_id}, ${url}, acodec: ${acodec}`, 'format');

    if (!url) {
        return bot.answerCallbackQuery(url, { text: 'URL tidak ditemukan.' });
    }

    const outputDir = path.resolve(__dirname, '../../downloads');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputTemplate = path.join(outputDir, `${id}.%(ext)s`);
    let cmd = `yt-dlp -f ${format_id}+bestaudio --remux-video ${ext} -o "${outputTemplate}" "${url}" --no-warnings --no-call-home --no-check-certificate --ffmpeg-location /usr/bin/ffmpeg --cookies-from-browser firefox`;
    if(acodec) cmd = `yt-dlp -f ${format_id} --remux-video ${ext} -o "${outputTemplate}" "${url}" --no-warnings --no-call-home --no-check-certificate --ffmpeg-location /usr/bin/ffmpeg --cookies-from-browser firefox`;

    bot.answerCallbackQuery(query.id, { text: 'Sedang mengunduh video...' });

    exec(cmd, { maxBuffer: 1024 * 1024 * 200 }, (error, stdout, stderr) => {
        if (error) {
            console.log('stderr:', stderr);
            // return bot.sendMessage(query.message.chat.id, `Gagal mengunduh video: ${stderr || error.message}`);
        }

        // Cari file hasil download
        fs.readdir(outputDir, async (err, files) => {
            if (err) return bot.sendMessage(query.message.chat.id, 'Gagal membaca file hasil unduhan.');

            // Cari file terbaru yang sesuai id
            const userFiles = files
                .filter(f => f.startsWith(id))
                .map(f => ({ file: f, time: fs.statSync(path.join(outputDir, f)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time);

            if (!userFiles.length) {
                return bot.sendMessage(query.message.chat.id, 'File video tidak ditemukan.');
            }

            const videoPath = path.join(outputDir, userFiles[0].file);
            let durationStr = getDuration(videoPath);
            const stats = fs.statSync(videoPath);
            
            if (stats.size > 50 * 1024 * 1024) {
                await sendBigFile(videoPath);
                let tempMsg = await bot.sendMessage(query.message.chat.id, 'File lebih dari 50 MB, mengupload ke Google Drive...');
                uploadFile(videoPath, path.basename(videoPath))
                .then(async (fileId) => {
                    if (!fileId) {
                        bot.sendMessage(query.message.chat.id, 'Gagal upload ke Google Drive.');
                        fs.unlink(videoPath, () => {});
                        return;
                    }
                    const linkData = await generatePublicURL(fileId);
                    if (linkData && linkData.webViewLink) {
                        bot.sendPhoto(query.message.chat.id, url_thumbnail, {
                            caption: `File *${title}.${ext} ${res}* berhasil diupload ke Google Drive\n\n*Durasi:* ${durationStr}\n*Filesize:* ${Math.floor(stats.size / 1048576)}mb\n\nFile akan dihapus dalam 1 jam kedepan:`,
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
                            bot.deleteMessage(query.message.chat.id, tempMsg.message_id)
                            fs.unlink(videoPath, () => {});

                            setTimeout(() => {
                                deleteFileDrive(fileId).then(() => { 
                                    emptyTrash();
                                    bot.deleteMessage(query.message.chat.id, msg.message_id)
                                })
                            }, 3600000);
                        });
                    } else {
                        bot.sendMessage(query.message.chat.id, 'Terjadi kesalahan saat mengupload file anda');
                        fs.unlink(videoPath, () => {});
                    }
                })
                .catch((err) => {
                    bot.sendMessage(query.message.chat.id, 'Gagal upload ke Google Drive.');
                    fs.unlink(videoPath, () => {});
                });
            }
            else {
                bot.sendChatAction(query.message.chat.id, 'upload_video');
                bot.sendVideo(query.message.chat.id, videoPath, { caption: `File *${title}.${ ext } ${res}* berhasil diunduh`, parse_mode: 'Markdown' })
                .then(() => {
                    fs.unlink(videoPath, () => {});
                })
                .catch(() => {
                    bot.sendMessage(query.message.chat.id, `Hanya bisa mengirim file dengan ukuran maksimal 50 MB. (${ Math.floor(stats.size / 1048576) } MB)`);
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
    ytdlp, downloadVideo
}