/**
 * Created by Jesse Qu on 3/29/14.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.behaviorData = behaviorData;
};

function behaviorData(req, res) {

    var db = this.db;
    var postData = req.body;

    postData.start = new Date(Date.parse(postData.start));
    postData.end = new Date(Date.parse(postData.end));

    console.log(postData);

    var report = {};

    getObdCode(db, postData.user, function(err, obdCode) {
        if (err) {
            res.send(400, err);
        }
        else {
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
                                            console.log(report);
                                            res.send(200, report);
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
