
'use strict';

var express = require('express');
var connect = require('express/node_modules/connect');
var path = require('path');
var config = require('./config');
var weixin = require('../api/weixin');
var api = require('../api/api');

/**
 *  Express patching
 */

function viewEnableMultiFolders(app) {
    // Monkey-patch express to accept multiple paths for looking up views.
    // this path may change depending on your setup.
    var lookup_proxy = app.get('view').prototype.lookup;

    app.get('view').prototype.lookup = function(viewName) {
        var context, match;
        if (this.root instanceof Array) {
            for (var i = 0; i < this.root.length; i++) {
                context = {root: this.root[i]};
                match = lookup_proxy.call(context, viewName);
                if (match) {
                    return match;
                }
            }
            return null;
        }
        return lookup_proxy.call(this, viewName);
    };
}

/**
 *  Express configuration
 */

module.exports = function(app) {
    app.configure('development', function() {

        // Disable caching of scripts for easier testing
        app.use(function noCache(req, res, next) {
            if (req.url.indexOf('/scripts/') === 0 || req.url.indexOf('/mscripts/') === 0 || req.url.indexOf('/js/') === 0) {
                res.header('Cache-Control', 'no-cache, no-store,must-revalidate');
                res.header('Pragma', 'no-cache');
                res.header('Expires', 0);
            }
            next();
        });

        // Express error handler
        app.use(express.errorHandler());
    });

    app.configure(function() {

        app.use(express.favicon(path.join(config.root, 'site', 'favicon.ico')));

        app.use(express.static(path.join(config.root, 'site')));
        app.use(express.static(path.join(config.root, 'msite')));
        app.use(express.static(path.join(config.root, 'wsite')));

        viewEnableMultiFolders(app);
        app.set('views', [ config.root + '/msite/mviews', config.root + '/wsite']);

        app.engine('html', require('ejs').renderFile);
        app.set('view engine', 'html');

        app.use(express.logger('dev'));

        app.use(express.urlencoded());
        app.use(express.json());

        app.use(express.methodOverride());
        app.use(express.cookieParser());
        app.use(connect.session({secret: 'IncarTechnologies', cookie: {maxAge: 180000}}));

        app.use('/api', weixin('wx__data_in_car')
            .text(api.onTextMsg)
            .image(api.onImageMsg)
            .voice(api.onVoiceMsg)
            .video(api.onVideoMsg)
            .location(api.onLocationMsg)
            .link(api.onLinkMsg)
            .event(api.onEventMsg)
            .middlewarify()
        );
        app.set('delayedInitializer', api.defineWXMenu('wx5de0018d8c7b0b0d', 'ea3cbd792917a19f7d043b02b7a7a0c6'));

        app.use('/wservice/manual', express.multipart({keepExtensions: true, uploadDir: './data/manual',limit:10*1024*1024}));
        // Router needs to be the last
        app.use(app.router);

    });
};


