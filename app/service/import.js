require('module-alias/register');

module.exports = (function() {
    return function(client) {
        require('listeners/commandHandler')(client);
        // require('listeners/buttonHandler')(bot);
    };
})();