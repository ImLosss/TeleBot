const { readJSONFileSync, writeJSONFileSync } = require("./function");

async function setIp(id, ip, bot) {
    let userData = readJSONFileSync(`database/data_user/${ id }`);

    userData[0].ip = ip;

    // Menulis data ke file 'error.json'
    writeJSONFileSync(`database/data_user/${ id }`, userData);

    console.log(`@${ userData[0].teleUsername } telah mengatur IP: ${ ip }`);
    return bot.sendMessage(id, `Username anda telah diatur ke ${ username }`);
}

module.exports = {
    setIp
}