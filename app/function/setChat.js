require('module-alias/register');
const { writeJSONFileSync, readJSONFileSync } = require("./function");
const console = require('console');


async function setChat(id, status, bot) {
    let userData = readJSONFileSync(`database/data_user/${ id }`);

    if (status == 'of' || status == 'off') userData[0].chatPublic = false;
    else if (status == 'on') userData[0].chatPublic = true;
    else return bot.sendMessage(id, `Format anda salah kirim kembali dengan format /chat <on/off>`);

    // Menulis data ke file 'error.json'
    writeJSONFileSync(`database/data_user/${ id }`, userData);

    console.log(`@${ userData[0].teleUsername } telah mengatur chat: ${ status }`);
    return bot.sendMessage(id, `chat anda telah diatur ke ${ status }`);
}

module.exports = {
    setChat
}