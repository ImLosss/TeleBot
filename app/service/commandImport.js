require('module-alias/register');
const sendChannel = require('function/sendChannel');
const updateBs = require('function/updateBstation');
const ytdlp = require('function/ytdlp');
const utils = require('function/utils');
const dlvs = require('function/dlvs');

module.exports = {
    ...sendChannel,
    ...updateBs,
    ...utils,
    ...ytdlp,
    ...dlvs
};