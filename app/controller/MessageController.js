require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync, cutVal } = require('function/utils');
const {  } = require('function/updateBstation');


const sendMessage = withErrorHandling(async (bot, msg, value) => {
    let config = readJSONFileSync(`./config.json`)
    let cmd = value.split(' ');

    if(cmd[0] == 'update') {
        let arg = cutVal(value, 1);
    }
})

module.exports = {
    sendMessage
}