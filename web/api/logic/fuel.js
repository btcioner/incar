/**
 * Created by Jesse Qu on 3/23/14.
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

function getFuelDataForLatestTime(db, obdCode, callback) {

    console.log(obdCode);

    var pool = db();

    pool.query('select currentAvgOilUsed fuel, currentMileage mileage from t_obd_drive where fireTime < flameOutTime and obdCode= ? order by flameoutTime desc limit 1;',[obdCode], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                return callback(null,  {fuel: rows[0].fuel, mileage:rows[0].mileage, totalFuel: ((rows[0].fuel*rows[0].mileage)/100)});
            } else { return callback(new Error('zero or multiple rows returned for fuel data of lasted time.')); }
        }
    });
}

function getFuelDataForLatestWeek(db, obdCode, callback) {

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
            if (rows && rows.length === 1) {
                callback(null, { fuel: (rows[0].fuelTotal/rows[0].mileTotal), mileage:rows[0].mileTotal, totalFuel: ((rows[0].fuelTotal)/100) });
            } else { callback(new Error('multiple rows returned for fuel data of lasted week.')); }
        }
    });
}

function getFuelDataForLatestMonth(db, obdCode, callback) {

    var pool = db();

    var sqlWithParameters = [
        'select SUM(currentAvgOilUsed*currentMileage) fuelTotal, SUM(currentMileage) mileTotal ',
        'from t_obd_drive ',
        'where (fireTime < flameoutTime) and (obdCode = ?) and ',
        'DATE_FORMAT(fireTime,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m");'
    ].join('');

    var sql = mysql.format(sqlWithParameters, [obdCode]);

    pool.query(sql, function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                callback(null, { fuel: (rows[0].fuelTotal/rows[0].mileTotal), mileage:rows[0].mileTotal, totalFuel: ((rows[0].fuelTotal)/100) });
            } else { callback(new Error('multiple rows returned for fuel data of lasted month.')); }
        }
    });
}

var fuel = {};

fuel.getReport = function(userName, serverName, callback){
    var db = this.db;

    var report = {};

    getObdCode(db, userName, serverName, function(err, obdCode) {
        if (err) {
            callback(err);
        }
        else {
            getFuelDataForLatestTime(db, obdCode, function(err, resultTime) {
                if (err) { callback(err); }
                else {
                    report.fuelDataLastTime = resultTime;

                    getFuelDataForLatestWeek(db, obdCode, function(err, resultWeek) {
                        if (err) { callback(err); }
                        else {
                            report.fuelDataLastWeek = resultWeek;

                            getFuelDataForLatestMonth(db, obdCode, function(err, resultMonth) {
                                if (err) { callback(err); }
                                else {
                                    report.fuelDataLastMonth = resultMonth;
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

fuel.db = require('../../config/db');

exports = module.exports = fuel;
