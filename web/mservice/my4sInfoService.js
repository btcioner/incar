/**
 * Created by zhoupeng on 14-6-7.
 */
'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.my4sInfo = my4sInfo;

}

function my4sInfo(req, res) {
    var postData = req.body;
    console.log(postData);
    var db = this.db;
    var temp=postData.user;
    var openid=temp.split('@')[0];
    var sopenid=temp.split('@')[1];
    search(db,sopenid,function(err, data) {
        if (err) { res.send(200,err); }
        else {
            res.send(data);
        }
    });
}

function search(db,sopenid,callback) {
    var pool = db();
    get4s_id(db,sopenid,function(err,result){
        if(err) callback(err);
        else{
            pool.query('select id,title,brief,status,tm_start,tm_end  from t_activity where s4_id=? and (status=2 or status=3 or status=4 or status=5 order by tm_announce desc);',[result],function(err,rows){
                if(err)callback(err);
                else{
                    if(rows){
                        var data=new Array();
                        for(var i=0;i<rows.length;i++){
                            var actData={};
                            actData.id=rows[i].id;
                            actData.title=rows[i].title;
                            actData.brief=rows[i].brief;
                            actData.status=rows[i].status;
                            actData.tm_announce=rows[i].tm_announce;
                            actData.tm_start=rows[i].tm_start;
                            actData.tm_end=rows[i].tm_end;
                            actData.logo_url=rows[i].logo_url;
                            data.push(actData);
                        }
                        callback(null,data);
                    }
                }
            });
        }
    });
}
function get4s_id(db,sopenid,callback){
    var pool = db();
    pool.query('select id from  t_4s where openid = ?;',
        [sopenid],function(err,rows){
            if(err){callback(err);}
            else{
                if(rows&&rows.length==1){
                   callback(null,rows[0].id);
                }else callback(new Error("t_4s has no data for the sopenid."));
            }
        });
}