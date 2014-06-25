
'use strict';

/**
 *  Load configuration
 */

var path = require('path');

var rootPath = path.normalize(__dirname + '/..');

/**
 * @returns {string}
 */
function ConfigBaseURL(){
    var url = 'http://www.incars.com.cn'; // 正式环境

    if(process.env.NODE_ENV === 'development')
        url = 'http://linuxsuse.chinacloudapp.cn'; // 当前开发环境AZURE-LINUX-SUSE, 以后切换到dev.incars.com.cn上
    else if(process.env.NODE_ENV === 'staging')
        url = 'http://114.215.172.92'; // 等备案OKAY后就切换为demo.incars.com.cn

    return url;
}

module.exports = {
    root: rootPath,
    baseUrl: ConfigBaseURL(),
    port: process.env.PORT || 80
};

