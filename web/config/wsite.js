/**
 * Created by Jesse Qu on 3/21/14.
 */

'use strict';

var path = require('path');
var fs = require('fs');
var config = require('./config');

module.exports = {

    /**
     *  Custom middleware used by the application
     */

    middleware: {

        /**
         *  Set a cookie for angular so it knows we have an http session
         */
        setUserCookie: function(req, res, next) {
            if (req.user) {
                res.cookie('user', JSON.stringify(req.user.userInfo));
            }
            next();
        }
    },

    routeCallback: {

        /**
         *  Send partial, or 404 if it doesn't exist
         */
        partials: function(req, res) {
            var stripped = req.url.split('.')[0];
            var furtherStripped = stripped.split('/');
            if (furtherStripped.length !== 4) {
                res.send(404);
                return;
            }
            var requestedView = path.join('./', furtherStripped[1], furtherStripped[2], furtherStripped[3]);
            res.render(requestedView, function(err, html) {
                if (err) {
                    res.send(404);
                } else {
                    res.send(html);
                }
            });
        },

        /**
         *  Send our single page apps
         */
        pageApp: function(req, res) {
            var rawUrl = req.url.split('?')[0];
            var stripped = rawUrl.split('/');
            var requestedFile = './';
            for (var i = 1; i < stripped.length; i++) {
                requestedFile = path.join(requestedFile, stripped[i]);
            }
            var requestedView = requestedFile.split('.')[0];
            res.render(requestedView, function(err, html) {
                if (err) {
                    var file = path.join(config.root, requestedFile);
                    fs.exists(file, function(existed) {
                        if (existed) {
                            res.sendfile(file);
                        }
                        else {
                            res.send(404);
                        }
                    });
                } else {
                    res.send(html);
                }
            });
        },

        /**
         *  Send our default single page app
         */
        index: function(req, res) {
            res.render('login.html');
        }
    }
};


