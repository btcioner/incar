
'use strict';

var express = require('express');
var connect = require('connect');
var errorHandler = require('errorhandler');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var multiPart = require('connect-multiparty');
var favicon = require('serve-favicon');
var morganLogger = require('morgan');
var path = require('path');
var config = require('./config');
var weixin = require('../api/weixin');
var api = require('../api/api');

/**
 *  Express patching
 */

function viewEnableMultiFolders(app) {
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

    if (process.env.NODE_ENV === 'development') {
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
        app.use(errorHandler());
    }

    app.use(favicon(path.join(config.root, 'data', 'favicon.ico')));

    app.use(express.static(path.join(config.root, 'site')));
    app.use(express.static(path.join(config.root, 'msite')));
    app.use(express.static(path.join(config.root, 'wsite')));

    viewEnableMultiFolders(app);
    app.set('views', [ config.root + '/msite/mviews', config.root + '/wsite']);

    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');

    app.use(morganLogger('dev'));

    app.use(bodyParser());

    app.use(methodOverride());
    app.use(cookieParser());
    app.use(connect.session({secret: 'IncarTechnologies', cookie: {maxAge: 180000}}));

    app.use('/api/*', weixin(api.getServiceToken)
        .text(api.onTextMsg)
        .image(api.onImageMsg)
        .voice(api.onVoiceMsg)
        .video(api.onVideoMsg)
        .location(api.onLocationMsg)
        .link(api.onLinkMsg)
        .event(api.onEventMsg)
        .middlewarify()
    );
    app.set('delayedInitializer', api.ticks(process.nextTick));

    app.use('/wservice/manual', multiPart({keepExtensions: true, uploadDir: './data/manual', limit:10*1024*1024}));

};


