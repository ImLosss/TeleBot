const { google } = require('googleapis');
const mime = require('mime-types');
const fs = require('fs');
const { readJSONFileSync, cutVal, isJSON } = require('function/utils');
let config = readJSONFileSync(`./config.json`);
const console = require('console');

// console.log(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URI, config.REFRESH_TOKEN);

const oauth2Client = new google.auth.OAuth2(
    config.CLIENT_ID,
    config.CLIENT_SECRET,
    config.REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token: config.REFRESH_TOKEN});

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

async function uploadFile(path, fileName) {
    let mime_type = await cekMime(path);
    try{
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                mimeType: mime_type
            },
            media: {
                mimeType: mime_type,
                body: fs.createReadStream(path)
            }
        })
        const fileId = response.data.id;
        console.log(response.data);
        return fileId;
    } catch (err) {
        console.log(err.message);
    }
}

async function deleteFileDrive(fileID) {
    try {
        const response = await drive.files.delete({
            fileId: fileID
        });
    } catch (err) {
        console.log(err.message);
    }
}

async function generatePublicURL(fileID) {
    try {
        await drive.permissions.create({
            fileId: fileID,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        })

        const result = await drive.files.get({
            fileId: fileID,
            fields: 'webViewLink, webContentLink, id'
        })
        return result.data;
    } catch (err) {
        console.log(err.message);
    }
}

async function cekMime(path){
    let mimeType = mime.lookup(path);
    // Perbaiki jika hasilnya salah
    if (path.endsWith('.mp4')) mimeType = 'video/mp4';
    if (path.endsWith('.mkv')) mimeType = 'video/x-matroska';
    if (path.endsWith('.mp3')) mimeType = 'audio/mpeg';
    // Tambahkan format lain jika perlu
    return mimeType || 'application/octet-stream';
}

async function emptyTrash() {
    try {
        await drive.files.emptyTrash()
        .then(() => {
            console.log('Trash has been emptied', 'drive');
        })
    } catch(err) {
        console.log(err)
        console.log('Failed to empty trash', 'drive');
    }
}

module.exports = {
    uploadFile, generatePublicURL, deleteFileDrive, emptyTrash
}

