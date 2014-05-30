/**
 * Created by Jesse Qu on 3/21/14.
 */

'use strict';

var ejs = require('ejs');
var booking = require('./booking');
var manual = require('./manual');

var my4S = {};

my4S.onBookingMessages = function(message, session, callback) {
    var idx = parseInt(message.Content);
    if (! session.slotData) {
        session.textMsgReplierIndex = null;
        return callback({type: 'text', content: '会话错误！'});
    }
    if (! idx) {
        if (idx !== 0) return callback({type: 'text', content: '输入错误！'});
    }
    if (idx < 1 || idx > session.slotData.slots.length) {
        return callback({type: 'text', content: '输入数字超出范围！'});
    }

    console.log(session.slotData);

    return booking.applySlot(message.FromUserName, session.slotData.slots[(idx -1)], function(err, result){
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

my4S.onManualMessages = function(message, session, callback) {
    manual.retrieve(message.Content, function(err, msg){
        if (err) { return callback({type: 'text', content: '您输入的关键字未搜索到任何手册条目。我们会继续努力持续扩大手册的内容的。'}); }
        return callback(msg);
    });
};

my4S.book = function(userName, session, callback){
    console.log("begin book");
    // 模板将来要从数据库来读取
    var tpl = [
        '当前有如下特价工位：\n\n',
        '<% var idx = 1; %>',
        '<% slots.forEach(function(slot){ %>',
//        '<%=idx%>:  <%=slot.location %>:  <%=slot.benefit %>\n',
        '<%=idx%>:  <%= slot.time.Format("yyyy-MM-dd hh:mm:ss") %>\n\n',
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

    var compiled = ejs.compile(tpl);

    booking.getPromotionSlots(userName, function(err, result) {
        if (err) {
            session.textMsgReplierIndex = null;
            if (session.slotData) delete session.slotData;
            callback(err);
        }
        else {
            var data = {};
            data.slots = result;

            session.slotData = data;
            session.textMsgReplierIndex = 'my4S.onBooking';
            callback(null, compiled(data));
        }
    });
};
my4S.trialrun=function(userName,sopenid, session, callback){
    var tpl = [
        '本店提供<%=brandName%>各系列车试乘试驾：\n\n',

        '请点击进入详情进行预约\n\n',
        '',
        '\n'
    ].join('');
    var compiled = ejs.compile(tpl);
    booking.getBrand(sopenid,function(err,result){
           if(err){
               session.textMsgReplierIndex = null;
               //if (session.slotData) delete session.slotData;
               callback(err);
           }else{
               var data={};
               data.brandName=result;
               session.textMsgReplierIndex = 'my4S.onTrialrun';
               callback(null,compiled(data));
           }
    });

    //session.textMsgReplierIndex = 'my4S.onTrialrun';
    //callback(null,compiled({}));
}
my4S.manual = function(userName, session, callback){
    // 模板将来要从数据库来读取
    var tpl = [
        '请回复关键字，来查询行车手册\n\n',
        '\n'
    ].join('');

    var compiled = ejs.compile(tpl);

    session.textMsgReplierIndex = 'my4S.onManual';
    callback(null, compiled({}));
};

exports = module.exports = my4S;