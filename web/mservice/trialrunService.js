/**
 * Created by zhoupeng on 14-5-29.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.trialrun = trialrun;
    service.post.getSeriesName = getSeriesName;
}

function trialrun(req, res) {
    var postData = req.body;
    console.log(postData);
    var db = this.db;
    submitTrialrun(db, postData,function(err, data) {
        if (err) { res.send(err); }
        else {
           res.send(data);
        }
    });
}

function submitTrialrun(db, postData,callback) {
    var pool = db();

    pool.query('insert into  t_trialrun (wx_oid,acc_id,bookingtime,seriesName,name,phone,tc,ts) values(?,?,?,?,?,?,?,now());',
        [postData.wx_oid,postData.acc_id,postData.bookingtime,postData.seriesName,postData.name,postData.phone,''],function(err,rows){
        if(err){callback(err);}
        else{
           callback(null,1);
         }
    });

}
function getSeriesName(req,res){
    var postData = req.body;
    var db = this.db;
    searchSeriesName(db,postData,function(err,data){
        if(err)callback(err);
        else{
            res.send(data);
        }
    });
}
function searchSeriesName(db, postData,callback){
    var pool = db();
    pool.query('select brand from t_4s where openid=?;',
        [postData.sopenId],function(err,rows){
            if(err){callback(err);}
            else{
                if(rows&&rows.length===1){
                    pool.query('select seriesCode,series from t_car_dictionary where brandCode=?',[rows[0].brand],function(err,rows){
                        if(err)callback(err);
                        else{
                            if(rows){
                                var seriesName=new Array();
                                for(var i=0;i<rows.length;i++){
                                    var temp={};
                                    temp.seriesCode=rows[i].seriesCode;
                                    temp.series=rows[i].series;
                                    seriesName.push(temp);
                                }
                                callback(null,seriesName);
                            }else callback(new Error('Can not find series.'));
                        }
                    });
                }
              }
        });
}