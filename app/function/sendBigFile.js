require('module-alias/register');
const console = require('console');
const { readJSONFileSync, cutVal } = require('function/utils');
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { CustomFile } = require("telegram/client/uploads");
const fs = require("fs");
const ffmpeg = require('fluent-ffmpeg');

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
            let { duration, width, height } = metadata.streams.find(s => s.codec_type === 'video');
            duration = typeof duration === "number"
                ? duration
                : (typeof duration === "string" && !isNaN(Number(duration)) ? Number(duration) : 0);
            resolve({ duration, width, height });
        });
    });
}

module.exports = {
    sendBigFile
}