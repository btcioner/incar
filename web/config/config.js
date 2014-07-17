
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
    var url = 'http://service.incardata.com.cn'; // 正式环境

    if(process.env.NODE_ENV === 'staging')
        url = 'http://staging.incardata.com.cn'; // 过渡环境
    else if(process.env.NODE_ENV === 'development')
        url = 'http://dev.incardata.com.cn';    // 开发环境

    return url;
}

module.exports = {
    root: rootPath,
    baseUrl: ConfigBaseURL(),
    port: process.env.INCAR_PORT || 80
};

