const { readJSONFileSync, writeJSONFileSync } = require("./function");
const console = require('../logs/console');

async function setIp(id, ip, bot) {
    let userData = readJSONFileSync(`database/data_user/${ id }`);

    userData[0].ip = ip;

    writeJSONFileSync(`database/data_user/${ id }`, userData);

    console.log(`@${ userData[0].teleUsername } telah mengatur IP: ${ ip }`);
    return bot.sendMessage(id, `Ip anda telah diatur ke ${ ip }`);
}

module.exports = {
    setIp
}