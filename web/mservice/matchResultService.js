/**
 * Created by liz on 14-7-16.
 */
'use strict';

var mysql = require('mysql');
var dao=require("../config/dao");
exports = module.exports = function(service) {
    service.post.matchResult = matchResult;
}

function matchResult(req, res) {

    var postData = req.body;
    console.log(postData);
    var temp=postData.user.split('@');
    var openid=temp[0];
    var sopenid=temp[1];
//    var wx_oid=openid+":"+sopenid;
    var id = parseInt(postData.id);
    var sql="select id from t_4s where openid =?";
    dao.findBySql(sql,[sopenid],function(info){
        if (info.err) { res.json({status:"连接数据库出错！"});return }
        else{
          var s4id = info.data[0].id;
           sql = "select ta.title,ta.tm_announce,t4.name,ta.tm_start,ta.tm_end,tg.min_milage,ta.logo_url,ta.awards from t_activity ta "+
                 "left join t_4s t4 on ta.s4_id = t4.id "+
                 "left join t_activity_save_gas tg on tg.id = ta.id "+
                 "where ta.id =? and ta.s4_id =?"
              dao.findBySql(sql,[id,s4id],function(info){
                if (info.err) { res.json({status:"连接数据库出错！"});return }
                else{
                   res.json({status:"ok",matchResultList:info.data});
                }
              });
        }
    });
}

