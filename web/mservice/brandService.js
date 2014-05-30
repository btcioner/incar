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
    var sopenid=postData.user.split('@')[1];
    console.log(sopenid+"00000000000");
    getBrand(db, sopenid ,function(err, data) {
         if (err) { res.send(err); }
          else {
           //console.log('Car brands print:\n');
           console.log(data);
           res.send(data);
         }
    });
 }

function getBrand(db, sopenid,callback) {
    var pool = db();
    var report ={};
   // console.log('brand search begin');
   pool.query('select brand from t_4s where openid=?;',[sopenid],function(err,rows){
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
                                                console.log(report);
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

}
