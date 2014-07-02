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
    // 不要使用硬编码的域名,我们会有多个域名,分别部署 正式product/过渡staging/开发dev版本
    // baseUrl: 'http://xxxx.chinacloudapp.cn',
    port: process.env.INCAR_PORT || 1234
};

