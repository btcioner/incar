/**
 * Created by Jesse Qu on 3/23/14.
 */

'use strict';

var path = require('path');
var config = require('./config/config');

var sitecommon = {};

sitecommon.staticFolder = function(folder) {
    return function(req, res) {
        var folders = folder.split('/');
        var params = req.params[0].split('/');

        var requestedFile = config.root;
        for (var f = 0; f < folders.length; f++) {
            requestedFile = path.join(requestedFile, folders[f]);
        }
        for (var p = 0; p < params.length; p++) {
            requestedFile = path.join(requestedFile, params[p]);
        }
        res.sendfile(requestedFile);
    }
};

sitecommon.staticFile = function(file) {
    return function(req, res) {
        var filePaths = file.split('/');
        var requestedFile = config.root;
        for (var f = 0; f < filePaths.length; f++) {
            requestedFile = path.join(requestedFile, filePaths[f]);
        }
        res.sendfile(requestedFile);
    }
};

sitecommon.fileNotFound = function() {
    return function(req, res) {
        res.send(404);
    }
};

exports = module.exports = sitecommon;
