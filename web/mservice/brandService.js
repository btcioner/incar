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
           console.log('Car brands print:\n');
           console.log(data);
           res.send(data);
         }
    });
 }

function getBrand(db, callback) {
    var pool = db();
    var report = new Array();
    console.log('brand search begin');
    pool.query('select brandCode from t_car_dictionary ;',[], function(err, rows){
        if (err) { callback(err); }
        else {
            console.log('brand length'+rows.length);
           if(rows){
               for(var i=0;i<rows.length;i++){
                   var brandData={};
                   brandData.id=rows[i].brandCode;
                   pool.query('select * from t_car_dictianary where brandCode=?;',[rows[i].brandCode],function(err, srows){
                       if(err){ callback(err);}
                       else {
                           if(srows){
                               brandData.brand =srows[0].brand;
                               var items=new Array();
                               for(var j=0;j<srows.length;j++){
                                   var seriese={};
                                   seriese.parentNode=brandData.brand;
                                   seriese.seriese=srows[j].seriese;
                                   seriese.id=srows[j].serieseCode;
                                   items[j]=seriese;
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
