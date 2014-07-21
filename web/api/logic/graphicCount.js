/**
 * Created by liz on 07/21/14.
 */

'use strict';

/**
 * 获取最新的一条店内资讯和店内活动
 * @param uoid 微信用户open_id
 * @param soid 微信服务号open_id
 * @param session 微信会话
 * @param cb 回调
 */
var dao=require("../../config/dao");
var graphicCount = {};
graphicCount.countData = function (count_type,pageId,date) {
   console.log("come in!!!!");
};

exports = module.exports = graphicCount;