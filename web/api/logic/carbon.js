/**
 * Created by Jesse Qu on 3/29/14.
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
                                        pool.query('select obd_code from t_car where id = ?', [rows[0].car_id], function(err, rows) {
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

function getCarbonDataForLatestTime(db, obdCode, callback) {

    var pool = db();

    pool.query('select currentAvgOilUsed fuel, currentMileage mileage from t_obd_drive where fireTime < flameOutTime and obdCode= ? order by flameoutTime desc limit 1;',[obdCode], function(err, rows){
        if (err) { return callback(err); }
        else {
            if (rows) {
                if (rows.length === 0) {
                    return callback(null,  {carbon: null, percentage: null});
                } else if (rows.length === 1) {
                    return callback(null,  {carbon: ((rows[0].fuel * rows[0].mileage * 2.24)/100), percentage: 94.6});
                } else { return callback(new Error('multiple rows returned for carbon data of lasted time.')); }
            }
            else {
                return callback(new Error('undefined returned for carbon data query.'));
            }
        }
    });
}

function getCarbonDataForLatestWeek(db, obdCode, callback) {

    var pool = db();

    var sqlWithParameters = [
        'select SUM(currentAvgOilUsed*currentMileage) fuelTotal, SUM(currentMileage) mileTotal ',
        'from t_obd_drive ',
        'where (fireTime < flameoutTime) and (obdCode = ?) and ',
        'DATE_FORMAT(fireTime,"%Y-%U") = DATE_FORMAT(NOW(),"%Y-%U");'
    ].join('');

    var sql = mysql.format(sqlWithParameters, [obdCode]);

    pool.query(sql, function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows) {
                if (rows.length === 0) {
                    return callback(null,  {carbon: null, percentage: null});
                } else if (rows.length === 1) {
                    return callback(null, { carbon: ((rows[0].fuelTotal * 2.24)/100), percentage: 94.6});
                } else { return callback(new Error('multiple rows returned for carbon data of lasted week.')); }
            }
            else {
                return callback(new Error('undefined returned for carbon data query.'));
            }
        }
    });
}

function getCarbonDataForLatestMonth(db, obdCode, callback) {

    var pool = db();

    var sqlWithParameters = [
        'select SUM(currentAvgOilUsed*currentMileage) fuelTotal, SUM(currentMileage) mileTotal ',
        'from t_obd_drive ',
        'where (fireTime < flameoutTime) and (obdCode = ?) and ',
        'DATE_FORMAT(fireTime,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m");'
    ].join('');

    var sql = mysql.format(sqlWithParameters, [obdCode]);

    pool.query(sql, function(err, rows){
        if (err) { return callback(err); }
        else {
            if (rows) {
                if (rows.length === 0) {
                    return callback(null,  {carbon: null, percentage: null});
                } else if (rows.length === 1) {
                    return callback(null, { carbon: ((rows[0].fuelTotal * 2.24)/100), percentage: 96.8});
                } else { return callback(new Error('multiple rows returned for carbon data of lasted month.')); }
            }
            else {
                return callback(new Error('undefined returned for carbon data query.'));
            }
        }
    });
}

var carbon = {};

carbon.getReport = function(userName, serverName, callback){
    var db = this.db;

    var report = {};

    getObdCode(db, userName, serverName, function(err, obdCode) {
        if (err) {
            callback(err);
        }
        else {
            getCarbonDataForLatestTime(db, obdCode, function(err, resultTime) {
                if (err) { callback(err); }
                else {
                    report.carbonDataLastTime = resultTime;

                    getCarbonDataForLatestWeek(db, obdCode, function(err, resultWeek) {
                        if (err) { callback(err); }
                        else {
                            report.carbonDataLastWeek = resultWeek;

                            getCarbonDataForLatestMonth(db, obdCode, function(err, resultMonth) {
                                if (err) { callback(err); }
                                else {
                                    report.carbonDataLastMonth = resultMonth;
                                    callback(null, report);
                                }
                            });
                        }
                    });
                }
            });
        }
    });

};

carbon.db = require('../../config/db');

exports = module.exports = carbon;

