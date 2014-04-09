/**
 * Created by Jesse Qu on 2/25/14.
 */

'use strict';

var path = require('path');

module.exports = {

    /**
     * Custom middleware used by the application
     */

    middleware: {

        /**
         * Set a cookie for angular so it knows we have an http session
         */
        setUserCookie: function(req, res, next) {
            if(req.user) {
                res.cookie('user', JSON.stringify(req.user.userInfo));
            }
            next();
        }
    },

    routeCallback: {

        /**
         * Send partial, or 404 if it doesn't exist
         */
        partials: function(req, res) {
            var stripped = req.url.split('.')[0];
            var requestedView = path.join('./', stripped);
            res.render(requestedView, function(err, html) {
                if(err) {
                    res.send(404);
                } else {
                    res.send(html);
                }
            });
        },

        /**
         * Send our single page app
         */
        index: function(req, res) {
            res.render('index');
        }
    }
};
