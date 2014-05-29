/**
 * Created by Jesse Qu on 5/8/14.
 */

'use strict';

var mysql = require('mysql');
var config = require('../../config/config');
var db = require('../../config/db');
var WXAPI = require('../weixin').API;

exports = module.exports = function(tickTasks, menuObject, callback) {
    var pool = db();

    var sql = 'select wx_app_name appName, wx_app_id appId, wx_app_secret appSecret from t_4s;';

    pool.query(sql, function(err, rows){
        if (err) { return callback(err, null); }
        if (rows) {
            rows.forEach(function(element, index, array){
                tickTasks.enqueueTask(function() {
                    var api = new WXAPI(element.appId, element.appSecret);
                    api.createMenu(menuObject, function(err, result){
                        if (err) {
                            console.log('Error occurred when weixin menu was newly defined - ---' + err + '\n');
                        }
                        else {
                            console.log('Weixin menu was newly defined!!\n');
                        }
                    });
                });
            });
            return callback(null, tickTasks);
        }
        else { return callback(new Error('No error, but we got a null as result.'), null); }
    });

};