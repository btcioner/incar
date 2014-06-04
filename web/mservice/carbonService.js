/**
 * Created by Jesse Qu on 3/29/14.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.carbonData = carbonData;
}

function carbonData(req, res) {

    var db = this.db;
    var postData = req.body;

    console.log(postData);

    postData.start = new Date(Date.parse(postData.start));
    postData.end = new Date(Date.parse(postData.end));

    console.log(postData);

    var report = {};

    getObdCode(db, postData.user, function(err, obdCode) {
        if (err) {
            res.send(err);
        }
        else {
            getCarbonData(db, obdCode, postData.start, postData.end, function(err, result){
                if (err) { res.send(err); }
                else {
                    report.carbonData = result;

                    getCarbonDataForLatestTime(db, obdCode, function(err, resultTime) {
                        if (err) { res.send(err); }
                        else {
                            report.carbonDataLastTime = resultTime;

                            getCarbonDataForLatestWeek(db, obdCode, function(err, resultWeek) {
                                if (err) { res.send(err); }
                                else {
                                    report.carbonDataLastWeek = resultWeek;

                                    getCarbonDataForInterval(db, obdCode, postData.start, postData.end, function(err, resultInterval) {
                                        if (err) { res.send(err); }
                                        else {
                                            report.carbonDataLastInterval = resultInterval;
                                            console.log(report);
                                            res.send(report);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function getObdCode(db, userName, callback) {
    var pool = db();
    var temp = userName.split('@');
    var serverName = temp[1];
    userName = temp[0];

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

function getCarbonData(db, obdCode, startDatetime, endDatetime, callback) {

    var pool = db();

    var sqlWithParameters = [
        'select SUM(avgOilUsed*mileage/100) fuelTotal, SUM(currentMileage) mileTotal ',
        'from t_obd_drive ',
        'where (fireTime < flameoutTime) and (fireTime > ?) and (fireTime < ?) and (obdCode = ?) '
    ].join('');

    var timeDuration = Math.ceil((endDatetime - startDatetime)/(24*60*60*1000));

    if (timeDuration <= 30) {
        sqlWithParameters = sqlWithParameters + 'group by DATE_FORMAT(fireTime,"%Y-%m-%d");';
    }
    else if (timeDuration > 30 && timeDuration <= 210) {
        sqlWithParameters = sqlWithParameters + 'group by DATE_FORMAT(fireTime,"%Y-%U");';
    }
    else {
        sqlWithParameters = sqlWithParameters + 'group by DATE_FORMAT(fireTime,"%Y-%m");';
    }

    var data = [startDatetime, endDatetime, obdCode];
    var sql = mysql.format(sqlWithParameters, data);

    pool.query(sql, function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows) {
                callback(null, rows.map(function(item, idx){
                    var carbonResult = (item.fuelTotal * 2.24);
                    if (!! carbonResult) {
                        carbonResult = carbonResult.toFixed(2);
                    }
                    return { carbon: carbonResult, index: '' };  // (idx + 1) };
                }));
            } else { callback(new Error('errors in get fuel data points.')); }
        }
    });
}

function getCarbonDataForLatestTime(db, obdCode, callback) {

    var pool = db();

    pool.query('select currentAvgOilUsed fuel, currentMileage mileage from t_obd_drive where fireTime < flameOutTime and obdCode= ? order by flameoutTime desc limit 1;',[obdCode], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                var carbonResult = (rows[0].fuel * rows[0].mileage * 2.24);
                if (!! carbonResult) {
                    carbonResult = carbonResult.toFixed(2);
                }
                return callback(null,  {carbon: carbonResult});
            } else { return callback(new Error('zero or multiple rows returned for carbon data of lasted time.')); }
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
            if (rows && rows.length === 1) {
                var carbonResult = rows[0].fuelTotal * 2.24;
                if (!! carbonResult) {
                    carbonResult = carbonResult.toFixed(2);
                }
                callback(null, { carbon: carbonResult });
            } else { callback(new Error('multiple rows returned for carbon data of lasted week.')); }
        }
    });
}

function getCarbonDataForInterval(db, obdCode, startDatetime, endDatetime, callback) {

    var pool = db();

    var sqlWithParameters = [
        'select SUM(currentAvgOilUsed*currentMileage) fuelTotal, SUM(currentMileage) mileTotal ',
        'from t_obd_drive ',
        'where (fireTime < flameoutTime) and (fireTime > ?) and (fireTime < ?) and (obdCode = ?);'
    ].join('');

    var sql = mysql.format(sqlWithParameters, [startDatetime, endDatetime, obdCode]);

    pool.query(sql, function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                var carbonResult = rows[0].fuelTotal * 2.24;
                if (!! carbonResult) {
                    carbonResult = carbonResult.toFixed(2);
                }
                callback(null, { carbon: carbonResult });
            } else { callback(new Error('multiple rows returned for carbon data of lasted interval.')); }
        }
    });
}
