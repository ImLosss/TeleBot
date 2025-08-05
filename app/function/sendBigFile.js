require('module-alias/register');
const console = require('console');
const { readJSONFileSync, cutVal } = require('function/utils');
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { CustomFile } = require("telegram/client/uploads");
const fs = require("fs");
const ffmpeg = require('fluent-ffmpeg');
const { get } = require('http');

let config = readJSONFileSync('./config.json');
const session = new StringSession(config.STRING_SESSION);
const client = new TelegramClient(session, config.API_ID, config.API_HASH, {});

async function sendBigFile(filePath) {
    try {
        let config = readJSONFileSync('./config.json');

        const info = await getVideoInfo(filePath);

        console.log(info);
        
        if (!client.connected) {
            await client.connect();
        }

        const fileStats = fs.statSync(filePath);

        const result = await client.invoke(
            new Api.messages.SendMedia({
            peer: config.DB_ID, // bisa juga message.peerId
            media: new Api.InputMediaUploadedDocument({
                file: await client.uploadFile({
                file: new CustomFile(
                    "video.mp4",
                    fileStats.size,
                    filePath
                ),
                workers: 1,
                }),
                mimeType: "video/mp4",
                attributes: [
                new Api.DocumentAttributeVideo({
                    duration: info.duration, // opsional, detik
                    w: info.width,        // opsional, lebar
                    h: info.height,        // opsional, tinggi
                    supportsStreaming: true,
                }),
                ],
                // caption bisa juga di sini jika mau
            }),
            message: "",
            randomId: BigInt(Date.now()), // randomId harus unik
            })
        );
        console.log(result.updates);

        return
    } catch (error) {
        console.error('Error sending video:', error);
    }
}

function getVideoInfo(path) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(path, (err, metadata) => {
            if (err) return reject(err);
            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            if (!videoStream) resolve({ duration: 0, width: 0, height: 0 });
            let { duration, width, height } = videoStream;
            // Pastikan duration adalah number
            duration = getDuration(path);
            resolve({ duration, width, height });
        });
    });
}

function getDuration (videoPath) {
    try {
        const ffprobeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
        const output = execSync(ffprobeCmd).toString().trim();
        const seconds = parseFloat(output);
        if (isNaN(seconds)) return 0;

        return seconds;
    } catch (e) {
        console.log(`gagal mengambil durasi: ${ e.message }`, 'error');
        return 0;
    }
};

module.exports = {
    sendBigFile
}