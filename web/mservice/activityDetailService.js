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
    pool.query('select id,s4_id,title,brief,status,logo_url,tm_announce,tm_start,tm_end  from t_activity where id=?;',[act_id],function(err,rows){
                if(err)callback(err);
                else{
                    if(rows&&rows.length==1){
                            actData.id=rows[0].id;
                            actData.s4_id=rows[0].s4_id;
                            actData.title=rows[0].title;
                            actData.brief=rows[0].brief;
                            actData.awards=rows[0].awards;
                            actData.status=rows[0].status;
                            actData.tm_announce=rows[0].tm_announce;
                            actData.tm_start=rows[0].tm_start;
                            actData.tm_end=rows[0].tm_end;
                            actData.logo_url=rows[0].logo_url;
                            pool.query('select name from t_4s where id=?',[ actData.s4_id],function(err,data){
                                if(err)callback(err);
                                else if(data){
                                    callback(null,data);
                                }else callback(new Error("The 4s is not find."));
                            });
                     }else callback(new Error("Can not find the activity for the id."));
                }
            });
}
