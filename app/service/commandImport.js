require('module-alias/register');
const sendChannel = require('function/sendChannel');
const updateBs = require('function/updateBstation');

module.exports = {
    ...sendChannel,
    ...updateBs
};