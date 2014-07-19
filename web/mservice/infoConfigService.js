/**
 * Created by zhoupeng on 14-5-23.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function (service) {
    service.post.infoConfig = infoConfig;
};
var report = {};
function infoConfig(req, res) {

    var db = this.db;
    var postData = req.body;

    console.log(postData);


    getAccountInfo(db, postData.user, function (err, data) {
        if (err) {
            console.log("account err:" + err);
            res.send(400, err);
        }
        else {
            getCarInfo(db, function (err, data) {
                if (err) {
                    console.log("car err:" + err);
                    res.send(400, err);
                }
                else {
                    console.log(report);
                    res.send(200, report);
                }
            })
        }
    });
}

function getAccountInfo(db, userName, callback) {
    var pool = db();
    var temp = userName.split('@');
    var user_wx_oid = temp[0];
    var s4_wx_oid = temp[1];
    var usrName = userName.replace('@', ':');

    pool.query('select id,s4_id,wx_oid,name,nick,phone from t_account where wx_oid = ?', [usrName], function (err, rows) {
        if (err) {
            callback(err);
        }
        else {
            if (rows && rows.length === 1) {
                report.id = rows[0].id;
                report.s4_id = rows[0].s4_id;
                report.name = rows[0].name;
                report.phone = rows[0].phone;
                report.nick = rows[0].nick;
                report.wx_oid = rows[0].wx_oid;
                if(report.nick == "微信匿名用户")report.nick ="";
                callback(null, 1);
            } else {
                // 2014世界杯德国7-1大胜巴西纪念日
                if(rows.length === 0){
                    // 当前用户是一个仅仅关注的用户,需要由系统自动产生一个帐号
                    pool.query("SELECT id, brand FROM t_4s WHERE openid = ?", [s4_wx_oid], function(ex, result){
                        if(ex) { callback(ex); }
                        else if(result.length === 0){ callback(new Error('没有找到匹配微信服务号的4S店')); }
                        else{
                            var wx_user = {
                                s4_id: result[0].id,
                                name: 'wx_' + user_wx_oid,
                                pwd: '00000000',
                                wx_oid: usrName,
                                tel_pwd: '00000000',
                                nick: '微信匿名用户'
                            };
                            var s4_brand = result[0].brand;
                            report.brand = result[0].brand;
                            pool.query("INSERT INTO t_account SET ?", [wx_user], function (ex, result) {
                                if(ex) return callback(ex);
                                else{
                                    report.id = result.insertId;
                                    report.s4_id = wx_user.s4_id;
                                    report.name = wx_user.name;
                                    report.phone = null;
                                    report.nick = wx_user.name;
                                    report.wx_oid = wx_user.wx_oid;
                                    report.brand = s4_brand;
                                    callback(null, 1);
                                }
                            });
                        }
                    });
                }
                else
                    callback(new Error('multiple rows returned for one wx user from t_account map.'));
            }
        }
    });
}
function getCarInfo(db, callback) {
    var pool = db();
    pool.query('select car_id from t_car_user where acc_id = ?', [report.id], function (err, rows) {
        if (err) {
            callback(err);
        }
        else {
            if (rows && rows.length === 1) {
                pool.query('select license,obd_code,brand,series,modelYear,disp,mileage,age,engineType from t_car where id = ?', [rows[0].car_id], function (err, rows) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        if (rows && rows.length === 1) {
                            report.license = rows[0].license;
                            report.obd_code = rows[0].obd_code;
                            report.brand = rows[0].brand;
                            report.series = rows[0].series;
                            report.modelYear = rows[0].modelYear;
                            report.disp = rows[0].disp;
                            report.mileage = rows[0].mileage;
                            report.obd_mileage = 0;
                            report.age = rows[0].age;
                            report.engine_type = rows[0].engineType;

                            var task = { finished: 0 };
                            task.begin = function () {
                                getBrandName(db, rows[0].brand, function (err, data) {
                                    task.finished++;
                                    task.A = {err: err, data: data};
                                    task.end();
                                });
                                getSeriesName(db, rows[0].brand, rows[0].series, function (err, data) {
                                    task.finished++;
                                    task.B = {err: err, data: data};
                                    task.end();
                                });

                                // 当前里程
                                pool.query('SELECT max(mileage) AS mileage FROM t_obd_drive WHERE obdCode = ?', [report.obd_code], function(err, data){
                                    task.finished++;
                                    task.C = { err:err, data:data };
                                    task.end();
                                });
                            };
                            task.end = function () {
                                if (task.finished < 3) return;
                                // 这里3个方法一定已经都返回了

                                if(!task.C.err && task.C.data.length > 0){
                                    report.obd_mileage = task.C.data[0].mileage;
                                }

                                if (task.A.err) callback(task.A.err);
                                else if (task.B.err) callback(task.B.err);
                                else {
                                    if (task.A.data) report.brandName = task.A.data;
                                    else {
                                        callback(new Error('brandName is null'));
                                        return;
                                    }
                                    if (task.B.data) report.seriesName = task.B.data;
                                    else {
                                        callback(new Error('seriesName is null'));
                                        return;
                                    }
                                    // 成功了!
                                    callback(null, 1);
                                }
                            };
                            task.begin();

                        }
                        else {
                            callback(new Error('zero of multiple rows returned for obd_code from car_info table.'));
                        }
                    }
                });
            }
            else if(rows.length === 0){
                report.mileage = 0;
                report.license = "";
                report.obd_code = "";
                report.brand = "";
                report.series = "";
                report.modelYear = "";
                report.disp = "";
                report.age = "";
                report.engine_type = "";
                callback(null, 1);
            }else {
                callback(new Error('zero of multiple rows returned for one acct user from account-car map.'));
            }
        }
    });
}
function getBrandName(db, brandCode, callback) {
    var pool = db();
    pool.query('select brand from t_car_dictionary where brandCode=?;', [brandCode], function (err, rows) {
        if (err) {
            callback(err)
        }
        else {
            if (rows.length > 0)
                callback(null, rows[0].brand);
            else
                callback("empty set");
        }
    });
}
function getSeriesName(db, brandCode, seriesCode, callback) {
    var pool = db();
    pool.query('select series from t_car_dictionary where brandCode=? and seriesCode=?;', [brandCode, seriesCode], function (err, rows) {
        if (err) callback(err);
        else {
            if (rows.length > 0)
                callback(null, rows[0].series);
            else
                callback("empty set");
        }
    });
}