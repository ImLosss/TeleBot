require('module-alias/register');

module.exports = (function() {
    return function(bot) {
        require('listeners/createBot')(bot);
        require('listeners/callback')(bot);
        require('listeners/cekDatabase')(bot);
        require('listeners/ip')(bot);
        require('listeners/username')(bot);
        require('listeners/chat')(bot);
        require('listeners/realUsername')(bot);
    };
})();