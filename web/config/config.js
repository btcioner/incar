
'use strict';

/**
 *  Load configuration
 */

var path = require('path');

var rootPath = path.normalize(__dirname + '/..');

module.exports = {
    root: rootPath,
    baseUrl: process.env.NODE_ENV === 'development' ? 'http://linuxsrv.winphone.us' : 'http://demo.incars.com.cn',
    port: process.env.PORT || 80
};

