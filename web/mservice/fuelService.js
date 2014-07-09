/**
 * Created by Jesse Qu on 3/23/14.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.fuelData = fuelData;
};

function fuelData(req, res) {

    var db = this.db;
    var postData = req.body;

    console.log(postData);
    //console.log(req);

    postData.start = new Date(Date.parse(postData.start));
    postData.end = new Date(Date.parse(postData.end));

    console.log(postData);

    var report = {};

    getObdCode(db, postData.user, function(err, obdCode) {
        if (err) {
            res.send(err);
        }
        else {
            getFuelData(db, obdCode, postData.start, postData.end, function(err, result){
                if (err) { res.send(err); }
                else {
                    report.fuelData = result;

                    getFuelDataForLatestTime(db, obdCode, function(err, resultTime) {
                        if (err) { res.send(err); }
                        else {
                            report.fuelDataLastTime = resultTime;

                            getFuelDataForLatestWeek(db, obdCode, function(err, resultWeek) {
                                if (err) { res.send(err); }
                                else {
                                    report.fuelDataLastWeek = resultWeek;

                                    getFuelDataForInterval(db, obdCode, postData.start, postData.end, function(err, resultInterval) {
                                        if (err) { res.send(err); }
                                        else {
                                            report.fuelDataLastInterval = resultInterval;
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

function getFuelData(db, obdCode, startDatetime, endDatetime, callback) {

    var pool = db();

    var sqlWithParameters = [
        'select SUM(currentAvgOilUsed*currentMileage) fuelTotal, SUM(currentMileage) mileTotal ',
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
                    var fuelResult = (item.fuelTotal / item.mileTotal);
                    if (!! fuelResult) {
                        fuelResult = fuelResult.toFixed(2);
                    }
                    return { fuel: fuelResult, index: '' };  // (idx + 1) };
                }));
            } else { callback(new Error('errors in get fuel data points.')); }
        }
    });
}

function getFuelDataForLatestTime(db, obdCode, callback) {

    var pool = db();

    pool.query('select currentAvgOilUsed fuel, currentMileage mileage from t_obd_drive where fireTime < flameOutTime and obdCode= ? order by flameoutTime desc limit 1;',[obdCode], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                var fuelResult = rows[0].fuel;
                if (!! fuelResult) { fuelResult = fuelResult.toFixed(2);}
                var mileageResult = rows[0].mileage;
                if (!! mileageResult) { mileageResult = mileageResult.toFixed(2);}
                var totalFuelResult = (rows[0].fuel*rows[0].mileage);
                if (!! totalFuelResult) { totalFuelResult = totalFuelResult.toFixed(2);}
                return callback(null,  {fuel: fuelResult, mileage:mileageResult, totalFuel: totalFuelResult});
            } else { return callback(new Error('zero or multiple rows returned for data of lasted time.')); }
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
                var fuelResult = (rows[0].fuelTotal/rows[0].mileTotal);
                if (!! fuelResult) { fuelResult = fuelResult.toFixed(2);}
                var mileageResult = rows[0].mileTotal;
                if (!! mileageResult) { mileageResult = mileageResult.toFixed(2);}
                var totalFuelResult = (rows[0].fuelTotal);
                if (!! totalFuelResult) { totalFuelResult = totalFuelResult.toFixed(2);}
                callback(null, { fuel: fuelResult, mileage:mileageResult, totalFuel: totalFuelResult });
            } else { callback(new Error('multiple rows returned for data of lasted week.')); }
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
                callback(null, { fuel: (rows[0].fuelTotal/rows[0].mileTotal), mileage:rows[0].mileTotal, totalFuel: rows[0].fuelTotal });
            } else { callback(new Error('multiple rows returned for data of lasted 7 days.')); }
        }
    });
}

function getFuelDataForInterval(db, obdCode, startDatetime, endDatetime, callback) {

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
                var fuelResult = (rows[0].fuelTotal/rows[0].mileTotal);
                if (!! fuelResult) { fuelResult = fuelResult.toFixed(2);}
                var mileageResult = rows[0].mileTotal;
                if (!! mileageResult) { mileageResult = mileageResult.toFixed(2);}
                var totalFuelResult = rows[0].fuelTotal;
                if (!! totalFuelResult) { totalFuelResult = totalFuelResult.toFixed(2);}

                callback(null, { fuel: fuelResult, mileage:mileageResult, totalFuel:totalFuelResult });
            } else { callback(new Error('multiple rows returned for data of lasted interval.')); }
        }
    });
}
