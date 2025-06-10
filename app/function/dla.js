require('module-alias/register');
const console = require('console');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { cutVal } = require('function/utils');

async function dla(bot, msg, value) {
    let title = cutVal(value, 1);
    let url = value.split(' ')[0].trim();

    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i;
    if (!ytRegex.test(url)) return bot.sendMessage(msg.chat.id, 'URL yang diberikan bukan URL YouTube yang valid.');

    // Ambil detail musik
    let detail;
    try {
        detail = await new Promise((resolve, reject) => {
            exec(`yt-dlp -vU -J --no-warnings --no-call-home --no-check-certificate --cookies-from-browser firefox "${url}"`, (error, stdout, stderr) => {
                if (error) {
                    console.log('stderr:', stderr);
                    return reject('Gagal mengambil info audio');
                }
                let jsonStr = '';
                const lines = stdout.split('\n');
                for (const line of lines) {
                    if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
                        jsonStr = line.trim();
                        break;
                    }
                }
                if (!jsonStr) return reject('Gagal memproses data JSON dari yt-dlp.');
                let info;
                try {
                    info = JSON.parse(jsonStr);
                } catch (e) {
                    return reject('Gagal memproses data JSON dari yt-dlp.');
                }
                if (!info.formats || info.formats.length === 0) {
                    return reject('Tidak ditemukan format audio yang tersedia.');
                }
                const audioFormat = info.formats.find(fmt => fmt.format_id && fmt.acodec !== 'none' && fmt.vcodec === 'none');
                if (!audioFormat) {
                    return reject('Tidak ada format audio yang sesuai.');
                }
                resolve({
                    title: info.title,
                    thumbnail: info.thumbnail,
                    url: url,
                    format_id: audioFormat.format_id,
                    ext: audioFormat.ext,
                    uploader: info.uploader || '',
                    artist: info.artist || '',
                    duration: info.duration || 0
                });
            });
        });
    } catch (err) {
        return bot.sendMessage(msg.chat.id, typeof err === 'string' ? err : 'Gagal mengambil detail audio');
    }

    // Download audio bestaudio dan langsung convert ke mp3 dengan nama customTitle
    const outputDir = path.resolve(__dirname, '../../downloads');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // Gunakan customTitle jika ada, jika tidak pakai judul asli
    let safeTitle = (title || detail.title || 'audio').replace(/[\\/:*?"<>|]/g, '_');
    const outputTemplate = path.join(outputDir, `${safeTitle}.mp3`);
    const cmd = `yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality 0 -o "${outputTemplate}" "${detail.url}" --no-warnings --no-call-home --no-check-certificate --ffmpeg-location /usr/bin/ffmpeg --cookies-from-browser firefox`;

    let loadingMsg = await bot.sendMessage(msg.chat.id, 'Sedang mengunduh dan mengkonversi audio ke mp3...');
    exec(cmd, { maxBuffer: 1024 * 1024 * 100 }, async (error, stdout, stderr) => {
        if (error) {
            console.log(stderr, 'stderr');
            await bot.sendMessage(msg.chat.id, `Gagal mengunduh audio.`);
            return;
        }
        // Pastikan file mp3 sudah ada
        if (!fs.existsSync(outputTemplate)) {
            await bot.sendMessage(msg.chat.id, 'File audio tidak ditemukan.');
            return;
        }
        // Download thumbnail dari detail.thumbnail dan gunakan untuk metadata
        let coverPath = path.join(outputDir, `${safeTitle}_cover.jpg`);
        try {
            await downloadImage(detail.thumbnail, coverPath);
            await changeTitleAndCover(safeTitle, detail.artist || detail.uploader, outputTemplate, coverPath);
            fs.unlink(coverPath, () => {});
        } catch (e) {
            await bot.sendMessage(msg.chat.id, 'Gagal menulis metadata atau mengunduh thumbnail.');
        }
        const stats = fs.statSync(outputTemplate);
        if (stats.size > 50 * 1024 * 1024) {
            await bot.sendMessage(msg.chat.id, `File terlalu besar (${Math.floor(stats.size / 1048576)} MB), tidak bisa dikirim lewat Telegram.`);
            fs.unlink(outputTemplate, () => {});
        } else {
            bot.sendChatAction(msg.chat.id, 'upload_audio');
            bot.sendAudio(msg.chat.id, outputTemplate, { caption: `File *${safeTitle}.mp3* berhasil diunduh`, parse_mode: 'Markdown' })
            .then(() => {
                fs.unlink(outputTemplate, () => {});
            })
            .catch(() => {
                bot.sendMessage(msg.chat.id, `Hanya bisa mengirim file dengan ukuran maksimal 50 MB. (${ Math.floor(stats.size / 1048576) } MB)`);
                fs.unlink(outputTemplate, () => {});
            });
        }
        bot.deleteMessage(msg.chat.id, loadingMsg.message_id);
    });
}

// Fungsi download gambar thumbnail
async function downloadImage(url, dest) {
    const https = require('https');
    const http = require('http');
    const file = fs.createWriteStream(dest);
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        mod.get(url, (response) => {
            if (response.statusCode !== 200) {
                return reject('Gagal download thumbnail');
            }
            response.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err.message);
        });
    });
}

// Ubah parameter changeTitleAndCover agar menerima path gambar cover
async function changeTitleAndCover(title, artist, filePath, coverPath) {
    try {
        const NodeID3 = require('node-id3');
        const coverArt = fs.readFileSync(coverPath);
        const tags = {
            title: title,
            artist: artist,
            album: getRandomNumber(),
            image: {
                mime: "image/jpeg",
                type: {
                    id: 3,
                    name: "front cover"
                },
                description: "none",
                imageBuffer: coverArt
            }
        }
        NodeID3.write(tags, filePath);
    } catch (error) {
        console.error('Error:', error);
    }
}

function getRandomNumber() {
    const min = 1;       // Nilai minimum
    const max = 1000000;    // Nilai maksimum
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    dla
}