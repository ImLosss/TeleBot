// listeners/commandListeners.js

module.exports = (function() {
    return function(bot) {
        // Event untuk menangani callback dari tombol
        bot.on('message', (msg) => {
            const dir_data_user = `./database/data_user/${ msg.chat.id }`
            if(!fs.existsSync(dir_data_user)) {
                let data_user = [{
                    chatPublic: true,
                    chatPrivate: true,
                    status: "offline"
                }]
                fs.writeFileSync(dir_data_user, JSON.stringify(data_user));
            } 
        });
    };
})();