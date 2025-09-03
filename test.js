require('module-alias/register');
const fs = require("fs");
const { readJSONFileSync, writeJSONFileSync } = require("function/utils");
const axios = require('axios');
const { dailyMotionUpload } = require('function/DailyMotion');
const { sendBigFile } = require('function/sendBigFile');  

async function main() {
    // let config = readJSONFileSync('./config.json');
    // let tess = await dailyMotionUpload({filePath: 'database/file_0.mp4', title: 'Testasd', channelId: 'x3pz54o', isCreatedForKids: false});
    // console.log(tess);

    sendBigFile('downloads/zw0_hardsub.mp4')
}

async function getToken(clientId, clientSecret, scope = '') {
    const url = 'https://partner.api.dailymotion.com/oauth/v1/token';
    const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope
    }).toString();

    const res = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000
    });
    return res.data; // { access_token, token_type, expires_in, scope, ... }
}

async function refreshToken() {
    let config = readJSONFileSync('./config.json');
    const url = 'https://api.dailymotion.com/oauth/token';
    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.DM_APIKEY,
        client_secret: config.DM_APISECRET,
        refresh_token: config.DM_REFRESH_TOKEN,
    }).toString();

    const res = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000
    });

    config.DM_REFRESH_TOKEN = res.data.refresh_token;
    config.DM_ACCESS_TOKEN = res.data.access_token;
    config.DM_UID = res.data.uid;
    writeJSONFileSync('./config.json', config);

    console.log(res.data);

    return res.data; // { access_token, token_type, expires_in, scope, ... }
}

async function getUserVideos() {
    let config = readJSONFileSync('./config.json');

    const url = `https://api.dailymotion.com/user/${encodeURIComponent(config.DM_UID)}/videos`;
    const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${config.DM_ACCESS_TOKEN}` },
        timeout: 15000
    });

    console.log(res.data);
    return res.data;
}

async function getUploadUrl() {
    let config = readJSONFileSync('./config.json');
    const url = 'https://partner.api.dailymotion.com/rest/file/upload';
    const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${config.DM_ACCESS_TOKEN}` },
        timeout: 60000
    });
    if (!res.data || !res.data.upload_url) {
        throw new Error('Invalid upload url response');
    }
    console.log(res.data);
    return res.data.upload_url;
}

// getUploadUrl();
// dailyMotionUpload({filePath: 'database/file_0.mp4', title: 'Testasd', channelId: 'x3pz54o', isCreatedForKids: false});
main();

