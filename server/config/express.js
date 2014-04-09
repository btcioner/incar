/**
 * Created by Jesse Qu on 2/25/14.
 */

'use strict';

var express = require('express'),
    path = require('path'),
    config = require('./config');

/**
 * Express configuration
 */

module.exports = function(app) {
    app.configure('development', function(){

        // Disable caching of scripts for easier testing
        app.use(function noCache(req, res, next) {
            if (req.url.indexOf('/scripts/') === 0) {
                res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.header('Pragma', 'no-cache');
                res.header('Expires', 0);
            }
            next();
        });

        // Express error handler
        app.use(express.errorHandler());
    });

    app.configure(function(){

        app.use(express.favicon(path.join(config.root, 'site', 'favicon.ico')));
        app.use(express.static(path.join(config.root, 'site')));
        app.set('views', config.root + '/site/views');

        app.engine('html', require('ejs').renderFile);
        app.set('view engine', 'html');

        app.use(express.logger('dev'));

        app.use(express.urlencoded());
        app.use(express.json());

        app.use(express.methodOverride());
        app.use(express.cookieParser());

        // Router needs to be last
        app.use(app.router);
    });
};