require('module-alias/register');
const console = require('console');
const { readJSONFileSync, writeJSONFileSync, cutVal, withErrorHandling } = require("function/utils");
const cmd = require('service/commandImport');
const { NewMessage } = require("telegram/events");
const { CustomFile } = require("telegram/client/uploads");
const { Api } = require("telegram");
const fs = require("fs");

const prefixFunctions = {
    'send': withErrorHandling((bot, msg, value, config, fromId) => cmd.sendChannel(bot, msg, value, config)),
    'updatebs': withErrorHandling((bot, msg, value, config, fromId) => cmd.updatebs(bot, msg, value, config)),
    'changechannel': withErrorHandling((bot, msg, value, config, fromId) => cmd.changeChannel(bot, value, config, fromId)),
    'dl': withErrorHandling((bot, msg, value, config, fromId) => cmd.ytdlp(bot, msg, value, config)),
    'dlvs': withErrorHandling((bot, msg, value, config, fromId) => cmd.dlvs(bot, msg, value, config)),
    'dla': withErrorHandling((bot, msg, value, config, fromId) => cmd.dla(bot, msg, value)),
    'iq': withErrorHandling((bot, msg, value, config, fromId) => cmd.downloadIqiyi(bot, msg, value, config)),
}

const prefixFunctionsGroup = {
    'dl': withErrorHandling((bot, msg, value, config, fromId) => cmd.ytdlp(bot, msg, value, config)),
    'dlvs': withErrorHandling((bot, msg, value, config, fromId) => cmd.dlvs(bot, msg, value, config)),
}

module.exports = (function() {
    return function(client) {
        client.addEventHandler(async (event) => {
            const message = event.message
            let config = readJSONFileSync(`./config2.json`);
            if(!config.RECEIVE_MESSAGE) return console.log("Skip Message.");
            const prefix = ['/'];

            console.log(message.message);

            if(!message.message) return;

            const value = cutVal(message.message, 1);

            if(message.message != "") {
                for (const pre of prefix) {
                    if (message.message.startsWith(`${pre}`)) {
                        const funcName = message.message.replace(pre, '').trim().split(' ');
                        const fromId = message.fromId.userId;

                        console.log(fromId);

                        // if(!config.OWNER.includes(fromId)) return
                        const filePath = "./op4_INDO.mp4";
                        const fileStats = fs.statSync(filePath);

                        const result = await client.invoke(
                            new Api.messages.SendMedia({
                            peer: "5443421174", // bisa juga message.peerId
                            media: new Api.InputMediaUploadedDocument({
                                file: await client.uploadFile({
                                file: new CustomFile(
                                    "op4_INDO.mp4",
                                    fileStats.size,
                                    filePath
                                ),
                                workers: 1,
                                }),
                                mimeType: "video/mp4",
                                attributes: [
                                    new Api.DocumentAttributeVideo({
                                        duration: 0, // opsional, detik
                                        w: 1920,        // opsional, lebar
                                        h: 804,        // opsional, tinggi
                                        supportsStreaming: true,
                                    }),
                                ],
                                // caption bisa juga di sini jika mau
                            }),
                            message: "Ini video dari invoke!",
                            randomId: BigInt(Date.now()), // randomId harus unik
                            })
                        );
                        console.log(result);

                        if (prefixFunctions[funcName[0]]) {
                            return console.log('jalan');
                        }
                        
                    }
                }
            }
        }, new NewMessage({ incoming: true }));
    };
})();