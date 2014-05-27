/**
 * Created by zhoupeng on 14-5-26.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.brandData = brandData;
}

function brandData(req, res) {

    var db = this.db;
    getBrand(db,  function(err, data) {
         if (err) { res.send(err); }
          else {
           //console.log('Car brands print:\n');
           //console.log(data);
           res.send(data);
         }
    });
 }

function getBrand(db, callback) {
    var pool = db();
    var report = new Array();
   // console.log('brand search begin');
    pool.query('select brandCode from t_car_dictionary group by brandCode;',[], function(err, rows){
        if (err) { callback(err); }
        else {
            if(rows){
               for(var i=0;i<rows.length;i++){
                   var brandData={};
                   brandData.id=rows[i].brandCode;
                   var bcode=rows[i].brandCode;
                   //pool.query("SET character_set_client=utf8,character_set_connection=utf8");
                   pool.query('select seriesCode,series from t_car_dictionary where brandCode=?;',[rows[i].brandCode],function(err, srows){
                       if(err){ callback(err);}
                       else {
                           if(srows){
                               console.log('brandCode:'+bcode+'   brand length:'+srows.length+'  brand:'+srows[0].brand);
                               brandData.brand =srows[0].brand;
                               var items=new Array();
                               for(var j=0;j<srows.length;j++){
                                   var series={};
                                   series.parentNode=brandData.brand;
                                   series.series=srows[j].series;
                                   series.id=srows[j].seriesCode;
                                   items[j]=series;
                               }
                              brandData.items=items;
                           }
                           else {callback(new Error('No data.'))}
                       }
                   });
                  report[i]= brandData;
               }
               callback(null,report);
           }else  {callback(new Error('error!!'))}
        }
    });
}
