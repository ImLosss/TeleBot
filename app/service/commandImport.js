require('module-alias/register');
const sendChannel = require('function/sendChannel');
const updateBs = require('function/updateBstation');
const ytdlp = require('function/ytdlp');
const utils = require('function/utils');
const dlvs = require('function/dlvs');
const dla = require('function/dla');
const downloadIqiyi = require('function/iqiyi');
const bw = require('function/bw');

module.exports = {
    ...sendChannel,
    ...updateBs,
    ...utils,
    ...bw,
    ...ytdlp,
    ...dlvs,
    ...dla,
    ...downloadIqiyi
};