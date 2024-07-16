const moment = require('moment-timezone');
const fs = require('fs');
const console = require('./console');
const lockfile = require('proper-lockfile');

async function getValue(msg) {
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

async function setVersion(id, version, bot) {
    let userData = readJSONFileSync(`database/data_user/${ id }`);

    userData[0].version = version;

    writeJSONFileSync(`database/data_user/${ id }`, userData);

    console.log(`User @${ userData[0].teleUsername } telah mengatur versi minecraft ke ${ version }`, 'function');
    return bot.sendMessage(id, `Versi minecraft telah diatur ke ${ version }`);
}

async function setUsername(id, username, bot) {
    let userData = readJSONFileSync(`database/data_user/${ id }`);

    userData[0].username = username;

    // Menulis data ke file 'error.json'
    writeJSONFileSync(`database/data_user/${ id }`, userData);

    return bot.sendMessage(id, `Username anda telah diatur ke ${ username }`);
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

function readJSONFileSync(filePath) {
    let release;
    try {
        // Lock the file for reading
        release = lockfile.lockSync(filePath);
        
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        return JSON.parse(fileContent);
    } catch (error) {
        console.error('error');
    } finally {
        if (release) {
            release();
        }
    }
}

function writeJSONFileSync(filePath, data) {
    let release;
    try {
        // Lock the file for writing
        release = lockfile.lockSync(filePath);
        
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonData, 'utf-8');
    } catch (error) {
        console.error('Error writing file:', error);
    } finally {
        if (release) {
            release();
        }
    }
}

module.exports = {
    getValue, getTime, setVersion, setUsername, readJSONFileSync, writeJSONFileSync, sleep
}