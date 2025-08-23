require('module-alias/register');

const moment = require('moment-timezone');
const fs = require('fs');
const console = require('console');
const lockfile = require('proper-lockfile');

async function downloadRepliedVideo(bot, msg, destDir = 'database') {
    const reply = msg.reply_to_message;
    const video = reply?.video;
    if (!video) return false;

    const fileId = video.file_id;
    const savedPath = await bot.downloadFile(fileId, destDir); // simpan otomatis sesuai nama Telegram

    return {
        path: savedPath,
        fileId,
        mimeType: video.mime_type,
        fileSize: video.file_size,
        duration: video.duration
    };
}

function getValue(msg) {
    let text = msg.text;
    text = text.slice(msg.entities[0].length+1, text.length);

    return text;
}

function sleep(ms) {
    return new Promise(resolve => {
        const intervalId = setInterval(() => {
            clearInterval(intervalId);
            resolve();
        }, ms);
    });
}

function getTime() {
    // Tentukan zona waktu Makassar
    const time = moment().tz('Asia/Makassar');

    // Ambil tanggal, jam, dan menit
    const tanggal = time.format('YYYY-MM-DD');
    const jam = time.format('HH');
    const menit = time.format('mm');

    return `${ tanggal } / ${ jam }:${ menit }`;
}

module.exports = {
    getValue, getTime, sleep, downloadRepliedVideo
}