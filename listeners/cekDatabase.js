require('module-alias/register');

const fs = require('fs');
const console = require('console');

module.exports = (function() {
    return function(bot) {
        // Event untuk menangani callback dari tombol
        bot.on('message', (msg) => {
            const dir_data_user = `./database/data_user/${ msg.chat.id }`
            if(!fs.existsSync(dir_data_user)) {
                let data_user = [{
                    teleUsername: msg.chat.username,
                    chatPublic: true,
                    chatPrivate: true,
                    status: "offline"
                },{}]
                fs.writeFileSync(dir_data_user, JSON.stringify(data_user, null, 2));

                console.log(`membuat data_user untuk @${ msg.chat.username }`, 'new_user');
            }
        });
    };
})();