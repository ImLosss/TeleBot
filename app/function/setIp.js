require('module-alias/register');
const { writeJSONFileSync, readJSONFileSync } = require("./function");
const console = require('console');

async function setIp(id, ip, bot) {
    let userData = readJSONFileSync(`database/data_user/${ id }`);

    userData[0].ip = ip;

    if(userData[1][ip] == undefined) userData[1][ip] = {};

    writeJSONFileSync(`database/data_user/${ id }`, userData);

    console.log(`@${ userData[0].teleUsername } telah mengatur IP: ${ ip }`);
    return bot.sendMessage(id, `Ip anda telah diatur ke <b>${ ip }</b>`, { parse_mode: 'HTML' });
}

module.exports = {
    setIp
}