require('module-alias/register');

const moment = require('moment-timezone');
const fs = require('fs');
const console = require('console');
const lockfile = require('proper-lockfile');

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

const withErrorHandling = (fn) => {
    return async (...args) => {
        try {
            await fn(...args);
        } catch (err) {
            console.error(err);
        }
    };
};

module.exports = {
    getValue, getTime, readJSONFileSync, writeJSONFileSync, sleep, withErrorHandling
}