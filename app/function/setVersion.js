const { writeJSONFileSync, readJSONFileSync } = require("./function");
const console = require('../logs/console');

async function setVersion(id, version, bot) {
    let userData = readJSONFileSync(`database/data_user/${ id }`);

    userData[0].version = version;

    writeJSONFileSync(`database/data_user/${ id }`, userData);

    console.log(`@${ userData[0].teleUsername } telah mengatur versi minecraft ke ${ version }`);
    return bot.sendMessage(id, `Versi minecraft telah diatur ke ${ version }`);
}

module.exports = {
    setVersion
}