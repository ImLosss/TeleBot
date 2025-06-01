require('module-alias/register');
const console = require('console');
const { exec } = require('child_process');
const { readJSONFileSync, cutVal, isJSON } = require('function/utils');
const { uploadFile, generatePublicURL, deleteFile, emptyTrash } = require('function/drive');
const path = require('path');
const fs = require('fs');

let tempData = {};

async function dlvs(bot, msg, value, config) {
    if (!value) return bot.sendMessage(msg.chat.id, 'Silakan kirim link video yang valid.');

    const loadingMsg = await bot.sendMessage(msg.chat.id, 'Mengambil daftar format, mohon tunggu...');

    // Tambahkan --no-warnings dan --no-call-home untuk meminimalisir output non-JSON
    exec(`yt-dlp -J --no-warnings --no-call-home --no-check-certificate --cookies-from-browser firefox -F "${value}"`, (error, stdout, stderr) => {
        if (error) {
            console.log('stderr:', stderr);
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

        // Ambil maksimal 8 format agar tombol tidak terlalu banyak
        let id = Math.random().toString(36).substr(2, 3);
        const maxButtons = 40;
        const allowedRes = ['360', '480', '512', '720', '848', '1080', '1280', '1920' ];
        const buttonData = info.formats
            .filter(fmt => {
                // console.log(fmt);
                const res = (fmt.format_note || fmt.resolution || '').toLowerCase();
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

                let subid = Math.random().toString(36).substr(2, 5);
                if (tempData[id] == undefined) tempData[id] = {};
                tempData[id][subid] = {title: info.title, thumbnail: info.thumbnail, url: value, format_id: fmt.format_id, acodec: fmt.acodec == 'none' ? false : true, ext: fmt.ext, sender_id: msg.from.id, chat_id: msg.chat.id}; 
                return {
                    text: `${fmt.ext} | ${fmt.format_note || fmt.resolution || ''}${sizeMB}`,
                    callback_data: JSON.stringify({ function: 'dlvs_choose_sub', arg1: id, arg2: subid })
                };
            });
        // Bagi menjadi baris berisi maksimal 2 tombol
        const buttons = [];
        if (buttonData.length === 0) return bot.sendMessage(msg.chat.id, 'Tidak ada format yang sesuai.');
        for (let i = 0; i < buttonData.length; i += 2) {
            buttons.push(buttonData.slice(i, i + 2));
        }

        bot.sendMessage(msg.chat.id, 'Pilih format yang diinginkan:', {
            reply_markup: {
                inline_keyboard: buttons
            }
        })
        .then(() => {
            bot.deleteMessage(msg.chat.id, loadingMsg.message_id);
            tempData[msg.from.id] = {}
        })
    });
}

async function dlvs_choose_sub(bot, query, data) {
    let id = data.arg1;
    let subid = data.arg2;
    let url = tempData[id][subid].url;
    let chat_id = tempData[id][subid].chat_id;

    if (!url) return bot.sendMessage(msg.chat.id, 'Url tidak ditemukan.');

    exec(`yt-dlp -J --no-warnings --no-call-home --no-check-certificate --cookies-from-browser firefox --list-subs --skip-download "${url}"`, async (error, stdout, stderr) => {
        if (error) {
            console.log('stderr:', stderr);
            // return bot.sendMessage(chat_id, `Gagal mengambil subtitle atau subtitle tidak tersedia.`);
        }

        const list_subs = await get_subs(stdout);

        // Ambil maksimal 8 format agar tombol tidak terlalu banyak
        const maxButtons = 40;
        let buttonData = [];
        list_subs.forEach(sub => {
            (sub.format || []).forEach(ext => {
                let subid2 = Math.random().toString(36).substr(2, 5);
                tempData[id][subid2] = { ext_lang: ext, lang: sub.lang, subid: subid };
                buttonData.push({
                    text: `${sub.lang} (${ext})`,
                    callback_data: JSON.stringify({ function: 'dlvs_downloadVideo', arg1: id, arg2: subid2 })
                });
            });
        }).slice(0, maxButtons);

        // Bagi menjadi baris berisi maksimal 2 tombol
        const buttons = [];
        for (let i = 0; i < buttonData.length; i += 2) {
            buttons.push(buttonData.slice(i, i + 2));
        }

        bot.sendMessage(chat_id, 'Pilih Subtitle yang diinginkan:', {
            reply_markup: {
                inline_keyboard: buttons
            }
        });
    });
}

async function dlvs_downloadVideo(bot, query, data) {
    let id = data.arg1;
    let subid2 = data.arg2;
    let subid = tempData[id][subid2]?.subid;
    let format_id = tempData[id][subid].format_id;
    let title = tempData[id][subid].title;
    let url_thumbnail = tempData[id][subid].thumbnail;
    let url = tempData[id][subid].url;
    let acodec = tempData[id][subid].acodec;
    let ext_lang = tempData[id][subid2].ext_lang;
    let ext = 'mkv';
    let lang = tempData[id][subid2].lang;
    tempData[id] = null;
    console.log(acodec);
    console.log(`${format_id}, ${url}`);
    console.log(`${ext_lang}, ${lang}`);

    if (!url) {
        return bot.answerCallbackQuery(url, { text: 'URL tidak ditemukan.' });
    }

    const outputDir = path.resolve(__dirname, '../../downloads');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputTemplate = path.join(outputDir, `${id}.%(ext)s`);
    let cmd = `yt-dlp -f ${format_id}+worstaudio --remux-video ${ext} --write-sub --sub-langs ${lang} --sub-format ${ext_lang} --embed-subs -o "${outputTemplate}" "${url}" --no-warnings --no-call-home --no-check-certificate --ffmpeg-location /usr/bin/ffmpeg --cookies-from-browser firefox`;
    if(acodec) cmd = `yt-dlp -f ${format_id} --remux-video ${ext} --write-sub --sub-langs ${lang} --sub-format ${ext_lang} --embed-subs -o "${outputTemplate}" "${url}" --no-warnings --no-call-home --no-check-certificate --ffmpeg-location /usr/bin/ffmpeg --cookies-from-browser firefox`;

    bot.answerCallbackQuery(query.id, { text: 'Sedang mengunduh video...' });

    exec(cmd, { maxBuffer: 1024 * 1024 * 100 }, (error, stdout, stderr) => {
        if (error) {
            console.log(stderr, 'stderr');
            // return bot.sendMessage(query.message.chat.id, `Gagal mengunduh video: ${stderr || error.message}`);
        }

        console.log(stdout, 'stdout');
        // Cari file hasil download
        fs.readdir(outputDir, async (err, files) => {
            if (err) return bot.sendMessage(query.message.chat.id, 'Gagal membaca file hasil unduhan.');

            const videoExts = ['.mp4', '.mkv']; // tambahkan sesuai kebutuhan
            const userFiles = files
                .filter(f => f.startsWith(id) && videoExts.includes(path.extname(f).toLowerCase()))
                .map(f => ({ file: f, time: fs.statSync(path.join(outputDir, f)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time);

            if (!userFiles.length) {
                return bot.sendMessage(query.message.chat.id, 'File video tidak ditemukan.');
            }

            const videoPath = path.join(outputDir, userFiles[0].file);
            const stats = fs.statSync(videoPath);
            if (stats.size > 50 * 1024 * 1024) {
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
                                caption: `File *${title}.${ext} SOFTSUB ${lang}* berhasil diupload ke Google Drive\nFile akan dihapus dalam 1 jam kedepan\n\nBuka video menggunakan vlc atau pemutar media lainnya jika sub tidak muncul`,
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
                                    deleteFile(fileId).then(() => { 
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
                bot.sendVideo(query.message.chat.id, videoPath, { caption: `File *${title}.${ ext } SOFTSUB ${lang}* berhasil diunduh\n\nBuka video menggunakan vlc atau pemutar media lainnya jika sub tidak muncul`, parse_mode: 'Markdown' })
                .then(() => {
                    fs.readdir(outputDir, (err, files) => {
                        if (err) return;
                        files
                            .filter(f => f.startsWith(id))
                            .forEach(f => fs.unlink(path.join(outputDir, f), () => {}));
                    });
                })
                .catch(() => {
                    bot.sendMessage(query.message.chat.id, `Hanya bisa mengirim file dengan ukuran maksimal 50 MB. (${ Math.floor(stats.size / 1048576) } MB)`);
                    fs.unlink(videoPath, () => {});
                });
            }
        });
    });
}

async function get_subs(stdout) {
    const lines = stdout.split('\n');
    const startIdx = lines.findIndex(line => line.includes('Language Name') || line.includes('Language Format'));
    let subtitleLines = [];
    if (startIdx !== -1) {
        for (let i = startIdx + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('{')) break;
            subtitleLines.push(line);
        }
    }

    const allowedExts = ['srt', 'ass', 'ssa', 'vtt', 'sup', 'sub', 'idx'];

    const subtitleJson = subtitleLines.map(line => {
        const clean = line.replace(/^\d+:\s*/, '').trim();

        // Format: kode nama format1, format2, ...
        let match = clean.match(/^([a-z-]+)\s+([A-Za-z ]+?)\s+([a-z0-9, ]+)$/i);
        if (match) {
            const formats = match[3].split(',').map(f => f.trim()).filter(f => allowedExts.includes(f));
            return {
                lang: match[1],
                name: match[2].trim(),
                format: formats
            };
        }

        // Format: kode format1, format2, ...
        match = clean.match(/^([a-z-]+)\s+([a-z0-9, ]+)$/i);
        if (match) {
            const formats = match[2].split(',').map(f => f.trim()).filter(f => allowedExts.includes(f));
            return {
                language: match[1],
                name: '',
                format: formats
            };
        }

        // Fallback
        return { Language: '', Name: '', Format: [] };
    }).filter(obj => obj.format.length > 0); // hanya yang punya format yang diizinkan

    return subtitleJson;
}

module.exports = {
    dlvs, dlvs_choose_sub, dlvs_downloadVideo
}