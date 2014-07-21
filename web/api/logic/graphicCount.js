/**
 * Created by liz on 07/21/14.
 */

'use strict';

/**

 */
var dao=require("../../config/dao");
var graphicCount = {};
graphicCount.countData = function (countType,pageId,callback) {
    var sql = "insert into t_graphic_count(page_id,created_time,count_type) values(?,?,?)"
    dao.insertBySql(sql,[pageId,new Date(),countType],function(info){
           if(info.err)
           {
               console.error("连接数据库错误!");
               callback(info.err,{status:"error!!!"});
           }
           else
           {
               callback(null,{status:"ok"});
           }
    });
};

exports = module.exports = graphicCount;