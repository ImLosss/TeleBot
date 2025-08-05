const fs = require("fs");
const ffmpeg = require('fluent-ffmpeg');

async function main() {
    const detail = fs.statSync('./op4_INDO.mp4');

    console.log(detail);
}

main()