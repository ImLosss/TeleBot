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

module.exports = {
    getValue, getTime, sleep
}