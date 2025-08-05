require('module-alias/register');
const console = require('console');
const { readJSONFileSync, cutVal } = require('function/utils');
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { CustomFile } = require("telegram/client/uploads");
const fs = require("fs");
const ffmpeg = require('fluent-ffmpeg');

async function sendBigFile(filePath) {
    try {
        let config = readJSONFileSync('./config.json');

        const session = new StringSession(config.STRING_SESSION);
        const client = new TelegramClient(session, config.API_ID, config.API_HASH, {});

        const info = await getVideoInfo(filePath);
        
        await client.connect();

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
                    duration: 0, // opsional, detik
                    w: 0,        // opsional, lebar
                    h: 0,        // opsional, tinggi
                    supportsStreaming: true,
                }),
                ],
                // caption bisa juga di sini jika mau
            }),
            message: "Ini video dari invoke!",
            randomId: BigInt(Date.now()), // randomId harus unik
            })
        );
        console.log(result.updates[0]);

        await client.disconnect();

    } catch (error) {
        console.error('Error sending video:', error);
    }
}

function getVideoInfo(path) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(path, (err, metadata) => {
            if (err) return reject(err);
            const { duration, width, height } = metadata.streams.find(s => s.codec_type === 'video');
            resolve({ duration, width, height });
        });
    });
}

module.exports = {
    sendBigFile
}