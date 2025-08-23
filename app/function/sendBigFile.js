require('module-alias/register');
const console = require('console');
const { readJSONFileSync, cutVal } = require('function/utils');
const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { CustomFile } = require("telegram/client/uploads");
const fs = require("fs");
const ffmpeg = require('fluent-ffmpeg');
const { execSync } = require('child_process');
const path = require("path");

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

        const thumbPath = filePath + ".thumb.jpg";
        await extractThumbnail(filePath, thumbPath);

        const thumbFile = await client.uploadFile({
            file: new CustomFile(
                path.basename(thumbPath),
                fs.statSync(thumbPath).size,
                thumbPath
            ),
            workers: 1,
        });

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
                thumb: thumbFile,
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
        // console.log(result.updates);

        fs.unlink(thumbPath, () => {});

        return result.updates[0].id; 
    } catch (error) {
        console.error('Error sending video:', error);
    }
}

async function downloadVideoByMessageId(chat, messageId, destDir = 'database') {
    if (!client.connected) await client.connect();

    // Resolve peer dan ambil message
    const entity = await client.getEntity(chat);
    const messages = await client.getMessages(entity, { ids: [messageId] });
    const msg = Array.isArray(messages) ? messages[0] : messages;
    if (!msg || !msg.media || !msg.media.document) {
        throw new Error('Message tidak berisi video/document');
    }

    const doc = msg.media.document;
    const filenameAttr = doc.attributes?.find(a => a instanceof Api.DocumentAttributeFilename);
    const videoAttr = doc.attributes?.find(a => a instanceof Api.DocumentAttributeVideo);
    const fileName = filenameAttr?.fileName || `video_${messageId}.mp4`;

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const outPath = path.join(destDir, fileName);

    // Siapkan lokasi file untuk download
    const location = new Api.InputDocumentFileLocation({
        id: doc.id,
        accessHash: doc.accessHash,
        fileReference: doc.fileReference,
        thumbSize: '' // full file
    });

    // Download ke buffer lalu simpan ke disk
    const buffer = await client.downloadFile(location, {
        dcId: doc.dcId,
        fileSize: Number(doc.size || 0),
        workers: 1,
        progressCallback: (downloaded, total) => {
            if (total) console.log(`Downloading: ${((downloaded / total) * 100).toFixed(1)}%`);
        }
    });

    fs.writeFileSync(outPath, buffer);
    return { path: outPath, duration: videoAttr?.duration, width: videoAttr?.w, height: videoAttr?.h };
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

function extractThumbnail(videoPath, outputPath, seek = 300) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                timestamps: [seek],
                filename: path.basename(outputPath),
                folder: path.dirname(outputPath)
            })
            .on('end', () => resolve(outputPath))
            .on('error', reject);
    });
}

module.exports = {
    sendBigFile, downloadVideoByMessageId
}