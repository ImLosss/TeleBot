const path = require('path');

function getLocation() {
    const error = new Error();
    const stack = error.stack.split('\n');

    // Mulai dari elemen ke-2 untuk melewati baris pertama yang merupakan lokasi Error dibuat
    for (let i = 3; i < stack.length; i++) {
        const callerLine = stack[i];
        const filePathMatch = callerLine.match(/\((.*):\d+:\d+\)/) || callerLine.match(/at (.*):\d+:\d+/);
        
        if (filePathMatch) {
            const fullPath = filePathMatch[0];
            if (fullPath && !fullPath.includes('node:internal/modules') && !fullPath.includes('service/utils.js')) {
                let fileName = path.basename(fullPath); 
                fileName = fileName.replace(/[()]/g, '');

                return fileName;
            }
        }
    }
    return null;
}

module.exports = {
    getLocation
};