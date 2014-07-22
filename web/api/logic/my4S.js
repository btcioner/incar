/**
 * Created by Jesse Qu on 3/21/14.
 */

'use strict';

var ejs = require('ejs');
var booking = require('./booking');
var manual = require('./manual');

var my4S = {};

my4S.onBookingMessages = function (message, req, callback) {
    var session = req.wxsession;
    var idx = parseInt(message.Content);
    if (!session.slotData) {
        session.textMsgReplierIndex = null;
        return callback({type: 'text', content: '会话错误！'});
    }
    if (!idx) {
        if (idx !== 0) return callback({type: 'text', content: '输入错误！'});
    }
    if (idx < 1 || idx > session.slotData.slots.length) {
        return callback({type: 'text', content: '输入数字超出范围！'});
    }

    console.log(session.slotData);

    return booking.applySblot(message.FromUserName, message.ToUserName, session.slotData.slots[(idx - 1)], function (err, result) {
        if (err) {
            session.textMsgReplierIndex = null;
            delete session.slotData;
            return callback({type: 'text', content: '您的预约申请处理失败！请重新查询。'});
        }
        else {
            session.textMsgReplierIndex = null;
            delete session.slotData;
            return callback({type: 'text', content: '您的预约申请已被接受，请耐心等待店家的服务端确认。'});
        }
    });
};

my4S.onManualMessages = function (message, req, callback) {
    var session = req.wxsession;
    manual.retrieve(message.Content, req, function (err, msg) {
        if (err) {
            return callback({type: 'text', content: '您输入的关键字未搜索到任何手册条目。我们会继续努力持续扩大手册的内容的。'});
        }
        return callback(msg);
    });
};

my4S.book = function (userName, sopenid, session, callback) {
    console.log("begin book");
    // 模板将来要从数据库来读取
    var tpl = [
        '当前有如下特价工位：\n\n',
        '<% var idx = 1; %>',
        '<% slots.forEach(function(slot){ %>',
//        '<%=idx%>:  <%=slot.location %>:  <%=slot.benefit %>\n',
        '<%=idx%>: <%=slot.location%>—<%=slot.benefit%>\n  时间：<%= slot.time %>\n\n',
        '<% idx++; %>',
        '<% }); %>',
        '\n',
        '回复特价工位号进行预约\n\n',
        '或点击本消息进行其他时段预约\n\n',
        '\n'
    ].join('');

    Date.prototype.Format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S": this.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    booking.getPromotionSlots(userName, sopenid, function (err, result) {
        if (err) {
            session.textMsgReplierIndex = null;
            if (session.slotData) delete session.slotData;
            callback(err);
        }
        else {
            if(result.length === 0){
                // 修正TPL模版在无特价工位时
                tpl = ['点击本消息进行预约保养'].join('');
            }

            var compiled = ejs.compile(tpl);

            var data = {};
            data.slots = result;

            session.slotData = data;
            session.textMsgReplierIndex = 'my4S.onBooking';

            callback(null, compiled(data));
        }
    });
};
my4S.trialrun = function (userName, sopenid, session, callback) {
    var tpl = [
        '本店提供【<%=brandName%>】各系列车试乘试驾：\n\n',

        '请点击进入,进行预约\n\n'
    ].join('');
    var compiled = ejs.compile(tpl);
    booking.getBrand(sopenid, function (err, result) {
        if (err) {
            session.textMsgReplierIndex = null;
            //if (session.slotData) delete session.slotData;
            callback(err);
        } else {
            var data = {};
            data.brandName = result;
            session.textMsgReplierIndex = 'my4S.onTrialrun';
            callback(null, compiled(data));
        }
    });

    //session.textMsgReplierIndex = 'my4S.onTrialrun';
    //callback(null,compiled({}));
};
my4S.my4sInfo = function (userName, sopenid, session, callback) {
    var tpl = [
        '活动多多，优惠多多：\n\n',

        '请点击进入查看详情\n\n'
    ].join('');
    var compiled = ejs.compile(tpl);
    session.textMsgReplierIndex = 'my4S.on4sInfo';
    callback(null, compiled({}));
};
my4S.manual = function (userName, session, callback) {
    // 模板将来要从数据库来读取
    var tpl = [
        '请回复关键字，来查询行车手册\n\n',
        '\n'
    ].join('');

    var compiled = ejs.compile(tpl);

    session.textMsgReplierIndex = 'my4S.onManual';
    callback(null, compiled({}));
};

my4S.contact = function (userName, sopenid, session, callback) {
    var tpl = [
        '<%=name%>：\n\n',
        '地址：<%=address%>\n\n',
        '热线电话：<%=hotline%>\n\n'
    ].join('');
    var compiled = ejs.compile(tpl);
    booking.get4sDetail(sopenid, function (err, result) {
        if (err) {
            session.textMsgReplierIndex = null;
            //if (session.slotData) delete session.slotData;
            callback(err);
        } else {
            var data = {};
            data.name = result.name;
            data.address = result.address;
            data.hotline = result.hotline;
            data.description = result.description;
            data.logo_url = result.logo_url || "data/contact_us.jpg";
            session.textMsgReplierIndex = 'my4S.onContact';
            callback(null, compiled(data), data.logo_url);
        }
    });
};

/**
 * 获取最新的一条店内资讯和店内活动
 * @param uoid 微信用户open_id
 * @param soid 微信服务号open_id
 * @param session 微信会话
 * @param cb 回调
 */
my4S.mostNews = function (uoid, soid, session, cb) {
    var db = require('../../config/db.js');
    var pool = db();
    var task = { finished:0 };
    task.begin = function(){
        // 查询最新资讯template = 'ActAd'
        var sqlAd = "SELECT A.id, A.title, A.logo_url\n" +
            "FROM t_activity A\n" +
            "\tJOIN t_4s S ON A.s4_id = S.id AND S.openid = ?\n" +
            "\tJOIN t_activity_template T ON A.template_id = T.id AND A.s4_id = T.s4_id AND T.template = 'ActAd'\n" +
            "ORDER BY A.tm_announce DESC\n" +
            "LIMIT 1";
        pool.query(sqlAd, [soid], function(ex ,result){
            task.finished ++;
            task.A = { ex:ex, result:result };
            task.end();
        });

        // 查询最新活动template <> 'ActAd'
        var sqlOther = "SELECT A.id, A.title, A.logo_url\n" +
            "FROM t_activity A\n" +
            "\tJOIN t_4s S ON A.s4_id = S.id AND S.openid = ?\n" +
            "\tJOIN t_activity_template T ON A.template_id = T.id AND A.s4_id = T.s4_id AND T.template <> 'ActAd'\n" +
            "ORDER BY A.tm_announce DESC\n" +
            "LIMIT 1";
        pool.query(sqlOther, [soid], function(ex ,result){
            task.finished ++;
            task.B = { ex:ex, result:result };
            task.end();
        });
    };
    task.end = function(){
        if(task.finished < 2) return;
        var news = [];
        if(!task.B.ex && task.B.result && task.B.result.length > 0){
            news.push(task.B.result[0]);
        }
        if(!task.A.ex && task.A.result && task.A.result.length > 0){
            news.push(task.A.result[0]);
        }
        cb(news);
    };
    task.begin();
};

exports = module.exports = my4S;