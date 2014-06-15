/**
 * Created by zhoupeng on 14-6-7.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.myActivity = myActivity;

}

function myActivity(req, res) {
    var postData = req.body;
    var db = this.db;
    var user=postData.user;
    var acc_id=postData.acc_id;
    var s4id=postData.s4_id;
   // console.log("postData:"+postData.user+","+postData.acc_id+","+postData.s4_id);
    search(db,acc_id,s4id,function(err, result) {
        if (err) { res.send(200,err); }
        else {
            console.log(result);
            res.send(result);
        }
    });
}

function search(db,acc_id,s4id,callback) {
    var myActData=new Array();
    var pool = db();
    pool.query('select act_id,status  from  t_activity_member where cust_id = ?;',
        [acc_id],function(err,rows){
            if(err){callback(err);}
            else{
                if(rows){
                    console.log("my activity account:"+rows.length);
                   for(var i=0;i<rows.length;i++){
                        //console.log("value:"+rows[i].act_id+"_"+s4id);
                         pool.query('select id,title,status,tm_announce  from  t_activity where id = ? and s4_id=? order by tm_announce desc;',
                           [rows[i].act_id,s4id],function(err,result){
                               if(err){callback(err);}
                               else{
                                   if(rows&&rows.length==1){
                                       var act_data={};
                                       act_data.id=result[0].id;
                                       act_data.title=result[0].title;
                                       act_data.status=result[0].status;
                                       act_data.tm_announce=result[0].tm_announce;
                                       act_data.myStatus=rows[i].status;
                                       myActData.push(act_data);
                                   }else callback(new Error("t_activity data error."));
                               }
                           });
                    }
                    console.log("before callback:"+myActData);
                    callback(null,myActData);
                }else callback(new Error("t_activity_member data error."));
            }
        });
}
function ActivityInfo(db,act_id,s4id,status,callback){
    var pool = db();
    pool.query('select id,title,status,tm_announce  from  t_activity where id = ? and s4_id=? order by tm_announce desc;',
        [act_id,s4id],function(err,rows){
            if(err){callback(err);}
            else{console.log("rows:"+rows[0].title);
                if(rows&&rows.length==1){
                    console.log("aa"+rows[0].id);
                    console.log("aa"+rows[0].title);
                    console.log("aa"+rows[0].status);
                    console.log("aa"+rows[0].tm_announce);
                    console.log("aa"+rows[0].status);
                    var act_data={};
                    act_data.id=rows[0].id;
                    act_data.title=rows[0].title;
                    act_data.status=rows[0].status;
                    act_data.tm_announce=rows[0].tm_announce;
                    act_data.myStatus=status;
                    console.log("actData:"+act_data);
                   callback(null,act_data);
                }else callback(new Error("t_activity data error."));
            }
        });
}