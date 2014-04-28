
'use strict';

var errorHandler = require('errorHandler');
var bodyParser=require("body-parser");
var methodOverride=require("method-override");
module.exports = function(app) {
    if (process.env.NODE_ENV === 'development') {
        app.use(function noCache(req, res, next) {
            res.header('Cache-Control', 'no-cache, no-store,must-revalidate');
            res.header('Pragma', 'no-cache');
            res.header('Expires', 0);
            next();
        });
        app.use(errorHandler(),null);
    }
    app.use(bodyParser());
    app.use(methodOverride());
};


