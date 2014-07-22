/**
 * Created by liz on 14-7-14.
 */
'use strict';

var mysql = require('mysql');
var dao=require("../config/dao");
exports = module.exports = function(service) {
    service.post.countData = countData;

}

function countData(req, res) {
    var pageId = req.body.pageId;
    var countType = req.body.countType;
    var temp = req.body.wx_oid.split("@");
    var wx_oid = temp[0]+":"+temp[1];
    var sql = "insert into t_graphic_count(page_id,created_time,count_type,wx_oid) values(?,?,?,?)"
    dao.insertBySql(sql,[pageId,changeDate_1(new Date()),countType,wx_oid],function(info){
        if(info.err)
        {
            console.error("连接数据库错误!");
            res.json({status:info.err});
        }
        else
        {
            res.json({status:"ok"});
        }
    });
}

function changeDate_1(date)
{
    if(date == "0000-00-00 00:00:00" || date == null) return null;
    var year = new Date(Date.parse(date)).getFullYear();
    var month = (new Date(Date.parse(date)).getMonth()) + 1;
    var day = new Date(Date.parse(date)).getDate();
    var hour = new Date(Date.parse(date)).getHours();
    var minute = new Date(Date.parse(date)).getMinutes();
    if(month < 10) month= "0" + month;
    if(day < 10) day= "0" + day;
    if(hour < 10) hour = "0" + hour;
    if(minute < 10) minute= "0" + minute;

    return (year+"-"+month+"-"+day+" "+hour+":"+minute);
}

