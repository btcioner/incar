/**
 * Created by zhoupeng on 14-5-23.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.infoConfig = infoConfig;
}
var report = {};
function infoConfig(req, res) {

    var db = this.db;
    var postData = req.body;

    console.log(postData);



    getAccountInfo(db, postData.user, function(err, data) {
        if (err) {
            res.send(err);
        }
        else {
            getCarInfo(db, function(err, data){
                if (err) {
                    res.send(err);
                }
                else{
                    console.log(report);
                    res.send(200, report);
                }
            })
        }
    });
}

function getAccountInfo(db, userName, callback) {
    var pool = db();
    //var temp = userName.split('@');
    //var serverName = temp[1];
    //userName = temp[0];

    pool.query('select id,s4_id,name,nick,phone from t_account where wx_oid like ?;',["%"+userName+"%"], function(err, rows){
        if (err) { callback(err); }
        else {
            console.log("----------");
            console.log(rows.length === 1);
            if (rows && rows.length === 1) {
                  report.id=rows[0].id;
                  report.s4_id=rows[0].s4_id;
                  report.name=rows[0].name;
                  report.phone=rows[0].phone;
                  report.nick=rows[0].nick;
                 console.log("nick:"+report.nick);
                  callback(null,1);
              } else { callback(new Error('zero of multiple rows returned for one wx user from account-channel map.')); }
                    }
                });
}
function getCarInfo(db, callback){
    var pool = db();
    pool.query('select car_id from t_car_user where acc_id = ?', [report.id], function(err, rows) {
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                pool.query('select license,obd_code,brand,series,modelYear,disp,mileage,age,engine_type from t_car where id = ?', [rows[0].car_id], function(err, rows) {
                    if (err) { callback(err); }
                    else {
                        if (rows && rows.length === 1) {
                            report.license=rows[0].license;
                            report.obd_code=rows[0].obd_code;
                            report.brand=rows[0].brand;
                            report.brandName=getBrandName(db,rows[0].brand);
                            report.series=rows[0].series;
                            report.seriesName=getSeriesName(db,rows[0].series);
                            report.modelYear=rows[0].modelYear;
                            report.disp=rows[0].disp;
                            report.mileage=rows[0].mileage;
                            report.age=rows[0].age;
                            report.engine_type=rows[0].engine_type;
                            callback(null, 1);
                        } else { callback(new Error('zero of multiple rows returned for obd_code from car_info table.')); }
                    }
                });
            } else { callback(new Error('zero of multiple rows returned for one acct user from account-car map.')); }
        }
    });
}
function getBrandName(db,brandCode){
    var pool = db();
    pool.query('select brand from t_car_dictionary where brandCode=?;',[brandCode],function(err,rows){
        if(err) callback(err);
        else{
            if(rows) {
                callback(null,rows[0].brand);
            }
            else{callback(new err('No data.'));}
        }
    });
}
function getSeriesName(db,seriesCode){
    var pool = db();
    pool.query('select series from t_car_dictionary where seriesCode=?;',[seriesCode],function(err,rows){
        if(err) callback(err);
        else{
            if(rows) {
                callback(null,rows[0].brand);
            }
            else{callback(new err('No data.'));}
        }
    });
}