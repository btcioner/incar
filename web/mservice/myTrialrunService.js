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
    console.log(postData);
    var db = this.db;
    var user=postData.user;
    var s4id=postData.s4id;
    search(db, user,s4id,function(err, data) {
        if (err) { res.send(200,err); }
        else {
            console(data);
            res.send(data);
        }
    });
}

function search(db, user,s4id,callback) {
    var pool = db();
   pool.query('select id,bookingtime,seriesName,bookingStatus,ts   from  t_trialrun where wx_oid like ? order by bookingtime desc;',
        ['%'+user+':'+s4id+'%'],function(err,rows){
            if(err){callback(err);}
            else{
                if(rows){
                    var trialrun=new Array();
                    for(var i=0;i<rows.length;i++){
                        var data={};
                        data.id=rows[i].id;
                        data.bookingtime=rows[i].bookingtime;
                        data.seriesName=rows[i].seriesName;
                        data.bookingStatus=rows[i].bookingStatus;
                        data.ts=rows[i].ts;
                        trialrun.push(data);
                    }
                    callback(null,trialrun);
                }else callback(new Error("Trialrun data error."));
            }
        });
}
