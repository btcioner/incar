/**
 * Created by zhoupeng on 14-6-21.
 */
'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.applyActivity = applyActivity;

}

function applyActivity(req, res) {
    var postData = req.body;
    console.log(postData);
    var db = this.db;
    var temp=postData.user;
    var openid=temp.split('@')[0];
    var sopenid=temp.split('@')[1];
    var act_id=postData.id;
    var tags=postData.tags;
    applyData(db,openid,sopenid,act_id,tags,function(err, data) {
        if (err) { res.send(200,err); }
        else {
            res.send(data);
        }
    });
}

function applyData(db,openid,sopenid,act_id,tags,callback) {
    var pool = db();
    pool.query('select id,s4_id from t_account where wx_oid=?;',[openid+":"+sopenid],function(err,rows){
        if(err)callback(err);
        else{
            if(rows&&rows.length==1){
                var acc_id=rows[0].id;
                var s4_id=rows[0].s4_id;
                pool.query('select * from t_activity_member where act_id=? and cust_id=?;',[act_id,acc_id],function(err,rows){
                    if(err) callback(err);
                    else if(rows&&rows.length>=1){
                        callback(new Error("You have applied the activity."));
                    }else{
                        pool.query('select car_id from t_car_user where acc_id=? and s4_id=?;',[acc_id,s4_id],function(err,rows){
                              if(err) callback(err);
                              else{
                                  if(rows&&rows.length>=1) {
                                      pool.query('insert into t_activity_member (act_id,cust_id,status,ref_car_id,ref_tags) values(?,?,1,?,?);',
                                          [act_id,acc_id,rows[0].car_id,tags],function(err,ressult){
                                            if(err) callback(err);
                                            else {
                                                console.log("insert into t_activity_member SUCCESS.");
                                                callback(null,{'re':1});
                                            }
                                      });
                                  }else callback(new Error("Can not find car from t_car_user."));
                              }
                        });
                    }
                });
            }else callback(new Error("Can not find user from t_account."));
          }
    });
}
