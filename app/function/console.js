const fs = require('fs');
const moment = require('moment-timezone');

async function error(errorMsg) {
    try {
        // Tentukan zona waktu Makassar
        const time = getTime();

        console.log(`[${ time } / error] ${ errorMsg.message }`);

        let errorData = fs.readFileSync(`app/logs/error.json`, 'utf-8');
        errorData = JSON.parse(errorData);

        const stackLines = errorMsg.stack.split('\n');

        const data = {
            type: 'Error',
            date: time,
            errorLocation: stackLines[1] ? stackLines[1] : null,
            errorMessage: errorMsg.message? errorMsg.message : null,
            error: errorMsg instanceof Error ? `${errorMsg.message}\n${errorMsg.stack}` : errorMsg
        }

        errorData.push(data);

        if(errorData.length > 50) errorData.splice(0, 1);

        // Mengubah data JSON menjadi string
        const jsonData = JSON.stringify(errorData, null, 2);

        // Menulis data ke file 'error.json'
        fs.writeFile('app/logs/error.json', jsonData, 'utf8', (err) => {
            if (err) {
                console.error(err);
            }
        });
    } catch (error) {
        
    }
}

async function log(log, file = 'none', type = 'info') {
    try {
        // Tentukan zona waktu Makassar
        const time = getTime();
        if(typeof(log) == 'object') log = JSON.stringify(log);
        console.log(`[${ time } / ${ type } / ${ file }] ${ log }`);

        let logData = fs.readFileSync(`app/logs/log.json`, 'utf-8');
        logData = JSON.parse(logData);

        const data = {
            type: type,
            date: time,
            location: file,
            message: log
        }

        logData.push(data);

        if(logData.length > 100) logData.splice(0, 1);

        // Mengubah data JSON menjadi string
        const jsonData = JSON.stringify(logData, null, 2);

        // Menulis data ke file 'error.json'
        fs.writeFile('app/logs/log.json', jsonData, 'utf8', (err) => {
            if (err) {
                console.error(err);
            }
        });
    } catch (error) {
        
    }
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
        release = lockfile.lockSync(filePath, { retries: 10, retryWait: 500 });
        
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        console.log(fileContent);
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading or parsing file:', error);
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
        release = lockfile.lockSync(filePath, { retries: 10, retryWait: 500 });
        
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
    log, error
}