/**
 * Created by zhoupeng on 14-5-26.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.brandData = brandData;
}

function brandData(req, res) {
    var postData = req.body;
    console.log(postData);
    var db = this.db;
    getBrand(db, postData.user ,function(err, data) {
         if (err) { res.send(err); }
          else {
           //console.log('Car brands print:\n');
           console.log(data);
           res.send(data);
         }
    });
 }

function getBrand(db, username,callback) {
    var pool = db();
    var report ={};
   // console.log('brand search begin');
    pool.query('select s4_id from t_account where wx_oid like ?;',["%"+username+"%"],function(err,rows){
        if(err){callback(err);}
        else{
            if(rows&&rows.length===1){
                pool.query('select brand from t_4s where id=?;',[rows[0].s4_id],function(err,rows){
                    if(err){callback(err);}
                    else{
                        if(rows&&rows.length===1){
                            pool.query('select brandCode,brand from t_car_dictionary where brandCode=?;',[rows[0].brand], function(err, rows){
                                if(err){callback(err);}
                                else{
                                    report.brand=rows[0].brand;
                                    report.brandCode=rows[0].brandCode;
                                    pool.query('select seriesCode,series from t_car_dictionary where brandCode=?;',[rows[0].brandCode],function(err,rows){
                                        if(err){callback(err);}
                                        else{
                                            if(rows){
                                                var seriesData=new Array();
                                                for(var i=0;i<rows.length;i++){
                                                    seriesData[i]={};
                                                    seriesData[i].series=rows[i].series;
                                                    seriesData[i].seriesCode=rows[i].seriesCode;
                                                }
                                                report.seriesData=seriesData;
                                                callback(null,report);
                                            }else{callback(new Error('no series data.'));}
                                        }
                                    });
                                }
                            });
                        }
                        else {callback(new Error('4s has no brand.'));}
                    }
                });
            }else {callback(new Error('user has no 4s.'));}
        }
    });
}
