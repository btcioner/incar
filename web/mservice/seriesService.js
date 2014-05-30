/**
 * Created by zhoupeng on 14-5-30.
 */
'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.getSeries= getSeriesName;
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