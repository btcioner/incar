
'use strict'

var express = require('express');

/**
 *  Main application file
 */

// Default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// Application configuration
var config = require('./config/config');
// Construct application object
var app = express();
// Express middle settings
require('./config/middle')(app);
// Routing
require('./config/routes')(app);

// Start server
app.listen(config.port, function() {
    console.log('Message server is listening on port %d in %s mode.', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;

