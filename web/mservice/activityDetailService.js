/**
 * Created by zhoupeng on 14-6-9.
 */
'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.getActivityDetail = getActivityDetail;

}

function getActivityDetail(req, res) {
    var postData = req.body;
    console.log(postData);
    var db = this.db;
    var temp=postData.user;
    var openid=temp.split('@')[0];
    var sopenid=temp.split('@')[1];
    var act_id=postData.id;
    search(db,act_id,function(err, data) {
        if (err) { res.send(200,err); }
        else {
            res.send(data);
        }
    });
}

function search(db,act_id,callback) {
    var actData={};
    var pool = db();
    pool.query('select id,title,brief,status,tm_announce,tm_start,tm_end  from t_activity where id=?;',[act_id],function(err,rows){
                if(err)callback(err);
                else{
                    if(rows&&rows.length==1){
                            actData.id=rows[i].id;
                            actData.s4_id=rows[i].s4_id;
                            actData.title=rows[i].title;
                            actData.brief=rows[i].brief;
                            actData.awards=rows[i].awards;
                            actData.status=rows[i].status;
                            actData.tm_announce=rows[i].tm_announce;
                            actData.tm_start=rows[i].tm_start;
                            actData.tm_end=rows[i].tm_end;
                            actData.logo_url=rows[i].logo_url;
                            pool.query('select name from t_4s where ',[],function(){
                                callback(null,data);
                            });
                     }else callback(new Error("Can not find the activity for the id."));
                }
            });
}
