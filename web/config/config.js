
'use strict';

/**
 *  Load configuration
 */

var path = require('path');

var rootPath = path.normalize(__dirname + '/..');

module.exports = {
    root: rootPath,
    baseUrl: process.env.NODE_ENV === 'development' ? 'http://linuxsuse.chinacloudapp.cn' : 'http://demo.incars.com.cn',
    port: process.env.PORT || 80
};

