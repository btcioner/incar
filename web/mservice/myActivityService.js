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
                    var act_detail={
                        n:0,
                        end:function(){
                            if(act_detail.n==rows.length){
                                callback(null,myActData);
                            }
                        }
                    }
                   for(var i=0;i<rows.length;i++){
                        //console.log("value:"+rows[i].act_id+"_"+s4id);
                       var st=rows[i].status;
                         pool.query('select id,title,status,tm_announce  from  t_activity where id = ? and s4_id=? order by tm_announce desc;',
                           [rows[i].act_id,s4id],function(err,result){
                               if(err){callback(err);}
                               else{
                                   if(result&&result.length==1){
                                       var act_data={};
                                       act_data.id=result[0].id;
                                       act_data.title=result[0].title;
                                       act_data.status=result[0].status;
                                       act_data.tm_announce=result[0].tm_announce;
                                       act_data.myStatus=st;
                                       myActData[i]=act_data;
                                       act_detail.n++;
                                       act_detail.end();
                                    }else callback(new Error("t_activity data error."));
                               }
                           });
                    }
                }else callback(new Error("t_activity_member data error."));
            }
        });
}
