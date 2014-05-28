/**
 * Created by Jesse Qu on 3/23/14.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.myDriveData = myDriveData;
};

function myDriveData(req, res) {

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
                                            //console.log(report);
                                            //res.send(report);
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
                                                                            //console.log(report);
                                                                            //res.send(report);
                                                                            getBehaviorData(db, obdCode, postData.start, postData.end, function(err, result){
                                                                                if (err) { res.send(400, err); }
                                                                                else {
                                                                                    report.behaviorData = result;

                                                                                    getBehaviorDataForLatestTime(db, obdCode, function(err, resultTime) {
                                                                                        if (err) { res.send(400, err); }
                                                                                        else {
                                                                                            report.behaviorDataLatestTime = resultTime;

                                                                                            getBehaviorDataForLatestWeek(db, obdCode, function(err, resultWeek) {
                                                                                                if (err) { res.send(400, err); }
                                                                                                else {
                                                                                                    report.behaviorDataLatestWeek = resultWeek;

                                                                                                    getBehaviorDataForInterval(db, obdCode, postData.start, postData.end, function(err, resultInterval) {
                                                                                                        if (err) { res.send(400, err); }
                                                                                                        else {
                                                                                                            report.behaviorDataInterval = resultInterval;
                                                                                                            getSpeedForLastTime(db,obdCode,function(err,result){
                                                                                                               if(err){ res.send(400, err);}
                                                                                                                else{
                                                                                                                   report.lastSpeed=result;
                                                                                                                   getSpeedForLastWeek(db,obdCode,function(err,result){
                                                                                                                       if(err){ res.send(400, err);}
                                                                                                                       else{
                                                                                                                           report.weekSpeed=result;
                                                                                                                           getSpeedForInterval(db, obdCode, postData.start, postData.end, function(err, resultInterval){
                                                                                                                               if(err){ res.send(400, err);}
                                                                                                                               else{
                                                                                                                                   report.intervalSpeed=resultInterval;
                                                                                                                                   console.log(report);
                                                                                                                                   res.send(200, report);
                                                                                                                               }
                                                                                                                           })
                                                                                                                         }
                                                                                                                   })
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

    pool.query('select id from t_account where wx_oid = ? ;',[userName+":"+serverName], function(err, rows){
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
function getCarbonData(db, obdCode, startDatetime, endDatetime, callback) {

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
function getBehaviorData(db, obdCode, startDatetime, endDatetime, callback) {

    var pool = db();

    var sqlWithParameters = [
        'select SUM(speedUp) speedup, SUM(speedDown) speeddown, SUM(sharpTurn) turn ',
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
                    return { behavior: { speedup: item.speedup, speeddown: item.speeddown, turn: item.turn}, index: '' };  // (idx + 1) };
                }));
            } else { callback(new Error('errors in get fuel data points.')); }
        }
    });
}

function getBehaviorDataForLatestTime(db, obdCode, callback) {

    var pool = db();

    pool.query('select speedUp speedupLatestTime, speedDown speeddownLatestTime, sharpTurn turnLatestTime from t_obd_drive where fireTime < flameOutTime and obdCode= ? order by flameoutTime desc limit 1;',[obdCode], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                return callback(null, rows[0]);
            } else { return callback(new Error('multiple rows returned for behavior data of lasted time.')); }
        }
    });
}

function getBehaviorDataForLatestWeek(db, obdCode, callback) {
    var pool = db();
    pool.query('select SUM(speedUp) speedupLatestWeek, SUM(speedDown) speeddownLatestWeek, SUM(sharpTurn) turnLatestWeek from t_obd_drive where fireTime < flameOutTime and DATE_FORMAT(fireTime,"%Y-%U") = DATE_FORMAT(NOW(),"%Y-%U") and obdCode= ? ;', [obdCode], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                callback(null, rows[0]);
            } else { callback(new Error('zero or multiple rows returned for behavior data of lasted week.')); }
        }
    });
}

function getBehaviorDataForLatestMonth(db, obdCode, callback) {
    var pool = db();
    pool.query('select SUM(speedUp) speedupLatestMonth, SUM(speedDown) speeddownLatestMonth, SUM(sharpTurn) turnLatestMonth from t_obd_drive where fireTime < flameOutTime and DATE_FORMAT(fireTime,"%Y-%m") = DATE_FORMAT(NOW(),"%Y-%m") and obdCode= ? ;', [obdCode], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                callback(null, rows[0]);
            } else { callback(new Error('zero or multiple rows returned for behavior data of lasted month.')); }
        }
    });
}

function getBehaviorDataForInterval(db, obdCode, startDatetime, endDatetime, callback) {
    var pool = db();
    pool.query('select SUM(speedUp) speedupInterval, SUM(speedDown) speeddownInterval, SUM(sharpTurn) turnInterval from t_obd_drive where fireTime < flameOutTime  and (fireTime > ?) and (fireTime < ?) and obdCode= ? ;', [startDatetime, endDatetime, obdCode], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                callback(null, rows[0]);
            } else { callback(new Error('multiple rows returned for behavior data of lasted interval.')); }
        }
    });
}
function getSpeedForLastTime(db, obdCode, callback){
    var pool = db();
    pool.query('select speedGroup from t_obd_drive where fireTime < flameOutTime and obdCode= ? order by flameoutTime desc limit 1;',[obdCode], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                var speedJsonArray=eval("("+rows[0].speedGroup+")");
                var speedJson={};
                speedJson.slow=speedJsonArray[0].distance;
                speedJson.middle=speedJsonArray[1].distance;
                speedJson.high=speedJsonArray[2].distance;
                return callback(null, speedJson);
            } else { return callback(new Error('multiple rows returned for speed data of lasted time.')); }
        }
    });
}
function getSpeedForLastWeek(db, obdCode, callback){
    var pool = db();
    pool.query('select speedGroup from t_obd_drive where fireTime < flameOutTime and DATE_FORMAT(fireTime,"%Y-%U") = DATE_FORMAT(NOW(),"%Y-%U") and obdCode= ?  order by flameoutTime desc ;',[obdCode], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows) {
                var slow=0;
                var middle=0;
                var high=0;
                var speedJson={};
                for(var i=0;i<rows.length;i++){
                    var speedJsonArray=eval("("+rows[0].speedGroup+")");
                    slow+=speedJsonArray[0].distance;
                    middle+=speedJsonArray[1].distance;
                    high+=speedJsonArray[2].distance;
                }
                speedJson.slow=slow;
                speedJson.middle=middle;
               speedJson.high=high;
                return callback(null,speedJson );
            } else { return callback(new Error('multiple rows returned for speed data of lasted time.')); }
        }
    });
}
function getSpeedForInterval(db, obdCode, startDatetime, endDatetime,callback){
    var pool = db();
    pool.query('select speedGroup from t_obd_drive where fireTime < flameOutTime and (fireTime > ?) and (fireTime < ?) and obdCode= ?  order by flameoutTime desc ;',[startDatetime, endDatetime,obdCode], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows) {
                var slow=0;
                var middle=0;
                var high=0;
                var speedJson={};
                for(var i=0;i<rows.length;i++){
                    var speedJsonArray=eval("("+rows[0].speedGroup+")");
                    slow+=speedJsonArray[0].distance;
                    middle+=speedJsonArray[1].distance;
                    high+=speedJsonArray[2].distance;
                }
                speedJson.slow=slow;
                speedJson.middle=middle;
                speedJson.high=high;
                return callback(null,speedJson );
            } else { return callback(new Error('multiple rows returned for speed data of lasted time.')); }
        }
    });
}