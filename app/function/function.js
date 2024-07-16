const moment = require('moment-timezone');
const fs = require('fs')

async function getValue(msg) {
    let text = msg.text;
    text = text.slice(msg.entities[0].length+1, text.length);

    return text;
}

async function saveError(errorMsg) {
    // Tentukan zona waktu Makassar
    const time = getTime();

    let errorData = fs.readFileSync(`app/logs/error.json`, 'utf-8');
    errorData = JSON.parse(errorData);

    const data = {
        type: 'Error',
        date: time,
        errorMessage: errorMsg instanceof Error ? `${errorMsg.message}\n${errorMsg.stack}` : errorMsg
    }

    errorData.push(data);

    if(errorData.length > 50) errorData.splice(0, 1);

    // Mengubah data JSON menjadi string
    const jsonData = JSON.stringify(errorData, null, 2);

    // Menulis data ke file 'error.json'
    fs.writeFile('app/logs/error.json', jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
        }
    });
}

async function saveLog(log, type) {
    // Tentukan zona waktu Makassar
    const time = getTime();

    let errorData = fs.readFileSync(`app/logs/error.json`, 'utf-8');
    errorData = JSON.parse(errorData);

    const data = {
        type: type,
        date: time,
        message: errorMsg instanceof Error ? `${errorMsg.message}\n${errorMsg.stack}` : errorMsg
    }

    errorData.push(data);

    if(errorData.length > 50) errorData.splice(0, 1);

    // Mengubah data JSON menjadi string
    const jsonData = JSON.stringify(errorData, null, 2);

    // Menulis data ke file 'error.json'
    fs.writeFile('app/logs/error.json', jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
        }
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
    getValue, saveError, getTime
}