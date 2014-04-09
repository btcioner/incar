/**
 * Created by Jesse Qu on 3/25/14.
 */
'use strict';

var mysql = require('mysql');

function getObdCode(db, userName, callback) {

    var pool = db();

    pool.query('select id from t_wx_user where openid = ?;',[userName], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                pool.query('select obd_code from t_wx_user_obd where wx_user_id = ?;',[rows[0].id], function(err, rows){
                    if (err) { callback(err); }
                    else {
                        if (rows && rows.length === 1) {
                            callback(null, rows[0].obd_code);
                        } else { callback(new Error('zero or multiple rows returned for one wx user id.')); }
                    }
                });
            } else {
                callback(new Error('zero or multiple rows returned for one wx user openid.'));
            }
        }
    });
}

function getBehaviorForLatestTime(db, userName, callback) {
    var pool = db();

    getObdCode(db, userName, function(err, obdCode) {
        if (err) { callback(err); }
        else {
            pool.query('select speedUp speedupLatestTime, speedDown speeddownLatestTime, sharpTurn turnLatestTime from t_obd_drive where fireTime < flameOutTime and obdCode= ? order by flameoutTime desc limit 1;',[obdCode], function(err, rows){
                if (err) { callback(err); }
                else {
                    if (rows && rows.length === 1) {
                        return callback(null, rows[0]);
                    } else { return callback(new Error('zero or multiple rows returned for behavior data of lasted time.')); }
                }
            });
        }
    });
}

function getBehaviorForLatestWeek(db, userName, callback) {
    var pool = db();

    getObdCode(db, userName, function(err, obdCode) {
        if (err) { callback(err); }
        else {
            pool.query('select SUM(speedUp) speedupLatestWeek, SUM(speedDown) speeddownLatestWeek, SUM(sharpTurn) turnLatestWeek from t_obd_drive where fireTime < flameOutTime and DATE_FORMAT(fireTime,"%Y-%U") = DATE_FORMAT(NOW(),"%Y-%U") and obdCode= ? ;', [obdCode], function(err, rows){
                if (err) { callback(err); }
                else {
                    if (rows && rows.length === 1) {
                        callback(null, rows[0]);
                    } else { callback(new Error('zero or multiple rows returned for behavior data of lasted week.')); }
                }
            });
        }
    });
}

function getBehaviorForLatestMonth(db, userName, callback) {
    var pool = db();

    getObdCode(db, userName, function(err, obdCode) {
        if (err) { callback(err); }
        else {
            pool.query('select SUM(speedUp) speedupLatestMonth, SUM(speedDown) speeddownLatestMonth, SUM(sharpTurn) turnLatestMonth from t_obd_drive where fireTime < flameOutTime and DATE_FORMAT(fireTime,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m") and obdCode= ? ;', [obdCode], function(err, rows){
                if (err) { callback(err); }
                else {
                    if (rows && rows.length === 1) {
                        callback(null, rows[0]);
                    } else { callback(new Error('zero or multiple rows returned for behavior data of lasted month.')); }
                }
            });
        }
    });
}

var drive = {};

drive.getReport = function(userName, callback){
    var self = this;
    var report = {};
    getBehaviorForLatestTime(self.db, userName, function(err, result){
        if (err) { callback(err); }
        else {
            report.speedupLatestTime = result.speedupLatestTime;
            report.speeddownLatestTime = result.speeddownLatestTime;
            report.turnLatestTime = result.turnLatestTime;

            getBehaviorForLatestWeek(self.db, userName, function(err, result){
                if (err) { callback(err); }
                else {
                    report.speedupLatestWeek = result.speedupLatestWeek;
                    report.speeddownLatestWeek = result.speeddownLatestWeek;
                    report.turnLatestWeek = result.turnLatestWeek;

                    getBehaviorForLatestMonth(self.db, userName, function(err, result){
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

