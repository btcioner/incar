/**
 * Created by Jesse Qu on 2/25/14.
 */

'use strict';

/**
 * Load configuration
 */

var path = require('path');

var rootPath = path.normalize(__dirname + '/..');

module.exports = {
    root: rootPath,
    port: process.env.PORT || 8899
};
