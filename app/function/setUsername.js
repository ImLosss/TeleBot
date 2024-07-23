require('module-alias/register');
const { writeJSONFileSync, readJSONFileSync } = require("./function");
const console = require('console');


async function setUsername(id, username, bot) {
    let userData = readJSONFileSync(`database/data_user/${ id }`);

    userData[0].username = username;

    // Menulis data ke file 'error.json'
    writeJSONFileSync(`database/data_user/${ id }`, userData);

    console.log(`@${ userData[0].teleUsername } telah mengatur username: ${ username }`);
    return bot.sendMessage(id, `Username anda telah diatur ke ${ username }`);
}

module.exports = {
    setUsername
}