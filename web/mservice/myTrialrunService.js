/**
 * Created by zhoupeng on 14-6-7.
 */


'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.myTrialrun = myTrialrun;

}

function myTrialrun(req, res) {
    var postData = req.body;
    // console.log(postData);
    var db = this.db;
    var user=postData.user;
    var wx_oid=postData.wx_oid;
    search(db, user,wx_oid,function(err, data) {
        if (err) { res.send(200,err); }
        else {
            // console.log(data);
            res.send(200,data);
        }
    });
}

function search(db, user,wx_oid,callback) {
    var pool = db();
   pool.query('select id,bookingtime,seriesName,bookStatus,ts  from  t_trialrun where wx_oid like ? order by ts desc;',
        ['%'+wx_oid+'%'],function(err,rows){
            if(err){console.log("search:"+err);callback(err);}
            else{
                console.log("trial records:"+rows.length);
                if(rows){
                    var trialrun=new Array();
                    for(var i=0;i<rows.length;i++){
                        var data={};
                        data.id=rows[i].id;
                        data.bookingtime=rows[i].bookingtime;
                        data.seriesName=rows[i].seriesName;
                        data.bookingStatus=rows[i].bookStatus;
                        data.ts=rows[i].ts;
                        trialrun.push(data);
                        console.log(data);
                    }
                    console.log(trialrun);
                    callback(null,trialrun);
                }else callback(new Error("Trialrun data error."));
            }
        });
}
