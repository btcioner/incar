/**
 * Created by Jesse Qu on 3/22/14.
 */

'use strict';

var mysql = require('mysql');
var path = require('path');

var config = require('../config/config');

var userService = require('./userService');
var carService = require('./carService');
var fuelService = require('./fuelService');
var carbonService = require('./carbonService');
var slotBookingService = require('./slotBookingService');
var behaviorService = require('./behaviorService');
var myDriveService = require('./myDriveService');
var infoConfigService= require('./infoConfigService');
var brandService= require('./brandService');
var getOpenidService= require('./getOpenidService');
var trialrunService= require('./trialrunService');
var seriesService= require('./seriesService');
var mservice = { get:{}, post:{}, delete:{}, put:{} };

userService(mservice);
carService(mservice);
fuelService(mservice);
carbonService(mservice);
slotBookingService(mservice);
behaviorService(mservice);
myDriveService(mservice);
infoConfigService(mservice);
brandService(mservice);
getOpenidService(mservice);
trialrunService(mservice);
seriesService(mservice);
(function(service) {

    function entrance(req, res) {
        // var action = req.route.params[0].split('/')[0];
        var action = req.params[0].split('/')[0];
        if (!action) {
            res.send(404);
            return;
        }
        var api;
        switch (req.method) {
            case 'GET':
                api = service.get[action];
                break;
            case 'POST':
                api = service.post[action];
                break;
            case 'DELETE':
                api = service.delete[action];
                break;
            case 'PUT':
                api = service.put[action];
                break;
        }
        if (api) {
            api.bind(service)(req, res);
        } else {
            res.send(404);
        }
    }
    service.entrance = entrance;
    service.db = require('../config/db');

})(mservice);

exports = module.exports = mservice;

