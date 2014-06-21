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
    applyData(db,openid,sopenid,act_id,function(err, data) {
        if (err) { res.send(200,err); }
        else {
            res.send(data);
        }
    });
}

function applyData(db,openid,sopenid,act_id,callback) {
    var pool = db();
    pool.query('select id,s4_id,title,brief,status,logo_url,tm_announce,tm_start,tm_end  from t_activity where id=?;',[act_id],function(err,rows){
        if(err)callback(err);
        else{
             callback(null,1);
               }
    });
}
