require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync, cutVal } = require('function/utils');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { downloadVideoByMessageId } = require('function/sendBigFile');  

async function dailyMotionHandler(bot, msg, value, config) {
    const message_id = value.split(' ')[0];
    value = cutVal(value, 1);
    let info = await downloadVideoByMessageId(config.DB_ID, Number(message_id));
    let result = await dailyMotionUpload({filePath: info.path, title: value, channelId: 'x3pz54o', isCreatedForKids: false});

    if(result.status == false) return bot.sendMessage(msg.chat.id, `Gagal upload ke Dailymotion: ${result.message || 'unknown error'}`);
    bot.sendMessage(msg.chat.id, `Sukses upload ke Dailymotion: https://www.dailymotion.com/video/${result.id}`);
}

async function dailyMotionUpload(opts) {
    const {
        filePath,
        title,
        channelId,
        isCreatedForKids = false,
    } = opts || {};

    if (!filePath || !channelId) throw new Error('filePath dan channelId wajib diisi');

    const config = readJSONFileSync('./config.json');
    const clientId = config.DM_APIKEY;
    const clientSecret = config.DM_APISECRET;
    const scope = 'manage_videos';

    // 1) token
    let accessToken = await getToken(clientId, clientSecret, scope);

    // 2) upload url
    const uploadUrl = await getUploadUrl(accessToken);
    if (uploadUrl.status == false) return uploadUrl?.message;

    // 3) upload file
    const uploadedUrl = await uploadVideoFile(uploadUrl, filePath, accessToken);
    if (uploadedUrl.status == false) return uploadedUrl?.message;

    // 4) create video
    const videoId = await createVideo(accessToken, channelId, uploadedUrl);
    if (videoId.status == false) return videoId?.message;

    // 5) publish
    const result = await publishVideo(accessToken, videoId, {
        published: true,
        private: false,
        title,
        channel: 'tv',
        isCreatedForKids,
    });

    return result;
}

async function getToken(clientId, clientSecret, scope = '') {
    let config = readJSONFileSync('./config.json');
    return config.DM_ACCESS_TOKEN;
    const url = 'https://api.dailymotion.com/oauth/token';
    const body = new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: 'dongworld',
        password: 'Premi040103=',
        scope
    }).toString();

    const res = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000
    });

    // let config = readJSONFileSync('./config.json');
    // config.DM_ACCESS_TOKEN = res.data.access_token;
    // writeJSONFileSync('./config.json', config);
    return res.data.access_token; // { access_token, token_type, expires_in, scope, ... }
}

async function getUploadUrl(access_token) {
    const url = 'https://api.dailymotion.com/file/upload';
    const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${access_token}` },
        timeout: 60000
    });
    if (!res.data || !res.data.upload_url) {
        return {status: false, message: 'Invalid upload url response' };
    }

    return res.data.upload_url;
}

async function uploadVideoFile(uploadUrl, filePath, accessToken) {
    if (!fs.existsSync(filePath)) return {status: false, message: `File not found: ${filePath}`};

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), path.basename(filePath));

    const res = await axios.post(uploadUrl, form, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            ...form.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 0 // upload besar, biarkan tanpa timeout
    });

    if (!res.data || !res.data.url) {
        throw new Error('Invalid upload video file response');
    }

    return res.data.url; 
}

async function createVideo(accessToken, channelId, fileUrl) {

    const endpoint = `https://api.dailymotion.com/user/${encodeURIComponent(channelId)}/videos`;
    const body = new URLSearchParams({ url: fileUrl }).toString();

    try {
        const res = await axios.post(endpoint, body, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 30000
        });
        if (!res.data?.id) throw new Error('Create video response tidak mengandung id');
        return res.data.id;
    } catch (err) {
        const data = err.response?.data;
        return {status: false, message: data || err.message};
    }
}

async function publishVideo(accessToken, videoId, {
        published,
        private,
        title,
        channel,
        isCreatedForKids
    }) {

    const endpoint = `https://api.dailymotion.com/video/${encodeURIComponent(videoId)}`;
    const form = new URLSearchParams({
        published: published,
        private: private,
        title: String(title),
        channel: String(channel),
        is_created_for_kids: isCreatedForKids
    }).toString();

    try {
        const res = await axios.post(endpoint, form, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 30000
        });
        return res.data;
    } catch (err) {
        const data = err.response?.data;
        return {status: false, message: data || err.message};
    }
}

module.exports = {
    dailyMotionUpload, dailyMotionHandler
};