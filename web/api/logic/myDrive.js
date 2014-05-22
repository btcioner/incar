/**
 * Created by zhoupeng on 5/12/14.
 */

'use strict';

var mysql = require('mysql');

function getObdCode(db, userName, serverName, callback) {
    var pool = db();

    pool.query('select id from t_account where oid = ?;',[userName+":"+serverName], function(err, rows){
        if (err) { callback(err); }
        else {
             if (rows && rows.length === 1) {
                            pool.query('select car_id from t_car_user where acc_id = ?', [rows[0].id], function(err, rows) {
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
}

function getFuelDataForLatestTime(db, obdCode, callback) {

    console.log(obdCode);

    var pool = db();

    pool.query('select currentAvgOilUsed fuel, currentMileage mileage from t_obd_drive where fireTime < flameOutTime and obdCode= ? order by flameoutTime desc limit 1;',[obdCode], function(err, rows){
        if (err) { return  callback(err); }
        else {
            if (rows) {
                if (rows.length === 0) {
                    return callback(null,  {fuel: null, mileage: null, totalFuel: null});
                } else if (rows.length === 1) {
                    return callback(null,  {fuel: rows[0].fuel, mileage:rows[0].mileage, totalFuel: ((rows[0].fuel*rows[0].mileage)/100)});
                } else { return callback(new Error('multiple rows returned for fuel data of lasted time.')); }
            }
            else {
                return callback(new Error('null or undefined from a query!'));
            }
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
        if (err) { return callback(err); }
        else {
            if (rows) {
                if (rows.length === 0) {
                    return callback(null,  {fuel: null, mileage: null, totalFuel: null});
                } else if (rows.length === 1) {
                    return callback(null, { fuel: (rows[0].fuelTotal/rows[0].mileTotal), mileage:rows[0].mileTotal, totalFuel: ((rows[0].fuelTotal)/100) });
                } else { return callback(new Error('multiple rows returned for fuel data of lasted week.')); }
            }
            else {
                return callback(new Error('null or undefined from a query!'));
            }
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
        if (err) { return callback(err); }
        else {
            if (rows) {
                if (rows.length === 0) {
                    return callback(null,  {fuel: null, mileage: null, totalFuel: null});
                } else if (rows.length === 1) {
                    return callback(null, { fuel: (rows[0].fuelTotal/rows[0].mileTotal), mileage:rows[0].mileTotal, totalFuel: ((rows[0].fuelTotal)/100) });
                } else { return callback(new Error('multiple rows returned for fuel data of lasted month.')); }
            }
            else {
                return callback(new Error('null or undefined from a query!'));
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


var myDrive={};
myDrive.getReport=function(userName, serverName, callback){
    var db = this.db;
    var report = {};
    var self = this;

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
                                   // callback(null, report);
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
                                                            //callback(null, report);
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
            });
        }
    });


};
myDrive.db = require('../../config/db');
exports = module.exports = myDrive;
