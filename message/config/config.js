/**
 * Created by LM on 14-4-17.
 */

'use strict';

/**
 *  Load configuration
 */

var path = require('path');

var rootPath = path.normalize(__dirname + '/..');

module.exports = {
    root: rootPath,
    baseUrl: 'http://linuxsrv.winphone.us',
    port: process.env.PORT || 1234
};
