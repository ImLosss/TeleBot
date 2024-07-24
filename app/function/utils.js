const path = require('path');
const fs = require('fs');

function getLocation() {
    const error = new Error();
    const stack = error.stack.split('\n');

    const projectRoot = getProjectRoot(__dirname);

    // Mulai dari elemen ke-2 untuk melewati baris pertama yang merupakan lokasi Error dibuat
    for (let i = 3; i < stack.length; i++) {
        const callerLine = stack[i];
        const filePathMatch = callerLine.match(/\((.*):\d+:\d+\)/) || callerLine.match(/at (.*):\d+:\d+/);
        
        if (filePathMatch) {
            const fullPath = filePathMatch[0];
            if (fullPath && fullPath.includes(projectRoot) && !fullPath.includes('node:internal/modules') && !fullPath.includes('service/utils.js') && !fullPath.includes('service/utils.js')) {
                
                let fileName = path.basename(fullPath); 
                fileName = fileName.replace(/[()]/g, '');

                return fileName;
            }
        }
    }
    return null;
}

function removeFromArray(arr, value) {
    if (value == 'reset') {
        arr.splice(0, arr.length); // Hapus semua elemen dari array
        return 'Berhasil reset data';
    } else {
        const index = arr.indexOf(value);
        if (index !== -1) {
            arr.splice(index, 1);
            return `Berhasil menghapus *${value}*`;
        } else {
            return 'Data tidak ditemukan';
        }
    }
}

function injectTitle (bot) {
    bot._client.on('title', (packet) => {
        if (packet.action === 0 || packet.action === 1) {
            bot.emit('title', packet.text)
        }
    })
  
    bot._client.on('set_title_text', (packet) => {
        bot.emit('title', packet.text)
    })
    bot._client.on('set_title_subtitle', (packet) => {
        setTimeout(() => {
            bot.emit('subtitle', packet.text)
        }, 100);
    })
}

function getProjectRoot(dir) {

    while (dir !== path.parse(dir).root) {
        if (fs.existsSync(path.join(dir, 'package.json'))) {
            return path.basename(dir);
        }
        dir = path.dirname(dir);
    }

    return 'not found';
}

function deleteFile(dir) {
    fs.unlink(dir, err => {
        if (err) {
            return;
        }
    });
}



module.exports = {
    getLocation, injectTitle, deleteFile, removeFromArray
};