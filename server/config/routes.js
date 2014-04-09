/**
 * Created by Jesse Qu on 2/25/14.
 */

'use strict';

var site = require('./site');

/**
 * Application routes
 */
module.exports = function(app) {

    // Routes to use Angular routing in site/scripts/server.js
    app.get('/partials/*', site.routeCallback.partials);
    app.get('/*', site.middleware.setUserCookie, site.routeCallback.index);
};