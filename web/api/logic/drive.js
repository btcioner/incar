/**
 * Created by Jesse Qu on 3/25/14.
 */
'use strict';

var mysql = require('mysql');

function getObdCode(db, userName, serverName, callback) {
    var pool = db();

    pool.query('select id from t_wx_user where openid = ? and sopenid = ?;',[userName, serverName], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                pool.query('select accountId from t_account_channel where channelCode = "wx" and channelKey = ?', [userName + ':' + serverName], function(err, rows) {
                    if (err) { callback(err); }
                    else {
                        if (rows && rows.length === 1) {
                            pool.query('select car_id from t_car_user where acc_id = ?', [rows[0].accountId], function(err, rows) {
                                if (err) { callback(err); }
                                else {
                                    if (rows && rows.length === 1) {
                                        pool.query('select obd_code from t_car_info where id = ?', [rows[0].car_id], function(err, rows) {
                                            if (err) { callback(err); }
                                            else {
                                                if (rows && rows.length === 1) {
                                                    callback(null, rows[0].obd_code);
                                                } else { callback(new Error('zero of multiple rows returned for obd_code from car_info table.')); }
                                            }
                                        });
                                    } else { callback(new Error('zero of multiple rows returned for one acct user from account-car map.')); }
                                }
                            });
                        } else { callback(new Error('zero of multiple rows returned for one wx user from account-channel map.')); }
                    }
                });
            } else {
                callback(new Error('zero or multiple rows returned for matched wx user from specified openid and sopenid.'));
            }
        }
    });
}

function getBehaviorForLatestTime(db, userName, serverName, callback) {
    var pool = db();

    getObdCode(db, userName, serverName, function(err, obdCode) {
        if (err) { callback(err); }
        else {
            pool.query('select speedUp speedupLatestTime, speedDown speeddownLatestTime, sharpTurn turnLatestTime from t_obd_drive where fireTime < flameOutTime and obdCode= ? order by flameoutTime desc limit 1;',[obdCode], function(err, rows){
                if (err) { return callback(err); }
                else {
                    if (rows) {
                        if (rows.length === 0) {
                            return callback(null, {speedupLatestTime: null, speeddownLatestTime: null, turnLatestTime: null});
                        } else if (rows.length === 1) {
                            return callback(null, rows[0]);
                        } else { return callback(new Error('multiple rows returned for behavior data of lasted time.')); }
                    } else { return callback(new Error('undefined returned for behavior data query of lasted time.')); }
                }
            });
        }
    });
}

function getBehaviorForLatestWeek(db, userName, serverName, callback) {
    var pool = db();

    getObdCode(db, userName, serverName, function(err, obdCode) {
        if (err) { callback(err); }
        else {
            pool.query('select SUM(speedUp) speedupLatestWeek, SUM(speedDown) speeddownLatestWeek, SUM(sharpTurn) turnLatestWeek from t_obd_drive where fireTime < flameOutTime and DATE_FORMAT(fireTime,"%Y-%U") = DATE_FORMAT(NOW(),"%Y-%U") and obdCode= ? ;', [obdCode], function(err, rows){
                if (err) { return callback(err); }
                else {
                    if (rows) {
                        if (rows.length === 0) {
                            return callback(null, {speedupLatestWeek: null, speeddownLatestWeek: null, turnLatestWeek: null});
                        } else if (rows.length === 1) {
                            return callback(null, rows[0]);
                        } else { return callback(new Error('multiple rows returned for behavior data of lasted week.')); }
                    } else { return callback(new Error('undefined returned for behavior data query of lasted week.')); }
                }
            });
        }
    });
}

function getBehaviorForLatestMonth(db, userName, serverName, callback) {
    var pool = db();

    getObdCode(db, userName, serverName, function(err, obdCode) {
        if (err) { callback(err); }
        else {
            pool.query('select SUM(speedUp) speedupLatestMonth, SUM(speedDown) speeddownLatestMonth, SUM(sharpTurn) turnLatestMonth from t_obd_drive where fireTime < flameOutTime and DATE_FORMAT(fireTime,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m") and obdCode= ? ;', [obdCode], function(err, rows){
                if (err) { return callback(err); }
                else {
                    if (rows) {
                        if (rows.length === 0) {
                            return callback(null, {speedupLatestMonth: null, speeddownLatestMonth: null, turnLatestMonth: null});
                        } else if (rows.length === 1) {
                            return callback(null, rows[0]);
                        } else { return callback(new Error('multiple rows returned for behavior data of lasted month.')); }
                    } else { return callback(new Error('undefined returned for behavior data query of lasted month.')); }
                }
            });
        }
    });
}

var drive = {};

drive.getReport = function(userName, serverName, callback){
    var self = this;
    var report = {};
    getBehaviorForLatestTime(self.db, userName, serverName, function(err, result){
        if (err) { callback(err); }
        else {
            report.speedupLatestTime = result.speedupLatestTime;
            report.speeddownLatestTime = result.speeddownLatestTime;
            report.turnLatestTime = result.turnLatestTime;

            getBehaviorForLatestWeek(self.db, userName, serverName, function(err, result){
                if (err) { callback(err); }
                else {
                    report.speedupLatestWeek = result.speedupLatestWeek;
                    report.speeddownLatestWeek = result.speeddownLatestWeek;
                    report.turnLatestWeek = result.turnLatestWeek;

                    getBehaviorForLatestMonth(self.db, userName, serverName, function(err, result){
                        if (err) { callback(err); }
                        else {
                            report.speedupLatestMonth = result.speedupLatestMonth;
                            report.speeddownLatestMonth = result.speeddownLatestMonth;
                            report.turnLatestMonth = result.turnLatestMonth;

                            callback(null, report);
                        }
                    });
                }
            });
        }
    });
};

drive.db = require('../../config/db');

exports = module.exports = drive;

