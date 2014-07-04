/**
 * Created by Jesse Qu on 3/21/14.
 */

'use strict';

var WXAPI = require('../weixin').API;
var myCar = require('./myCar');
var my4S = require('./my4S');
var menuBuilder = require('./menu');
var config = require('../../config/config');
var url = require('url');
var wxMenu = {};

var menuObject={
    "button":
        [
            {
                "name":"我的车",
                "sub_button":
                    [
                        {
                            "type":"click",
                            "name":"行车分析",
                            "key":"MYCAR.MYDRIVE"
                        },
                        {
                            "type":"click",
                            "name":"行车手册",
                            "key":"MY4S.MANUAL"
                        },
                        {
                            "type":"click",
                            "name":"远程检测",
                            "key":"MYCAR.MAINTAIN"
                        },
                        {
                            "type":"click",
                            "name":"行车报告",
                            "key":"MYCAR.COST"
                        }
                    ]
            },
            {
                "name":"我的4S",
                "sub_button":
                    [
                        {
                            "type":"click",
                            "name":"预约保养",
                            "key":"MY4S.BOOKING"
                        },
                        {
                            "type":"click",
                            "name":"试乘试驾",
                            "key":"MY4S.PROBE"
                        },
                        {
                            "type":"click",
                            "name":"资讯活动",
                            "key":"MY4S.INFO"
                        },
                        {
                            "type":"click",
                            "name":"联系我们",
                            "key":"MY4S.CONTACT"
                        }
                    ]
            },
            {
                "name":"发现",
                "sub_button":
                    [
                        {
                            "type":"view",
                            "name":"我的活动",
                            "url": "msite/getCodeForActivity.html"
                        },
                        {
                            "type":"view",
                            "name":"我的预约",
                            "url": "msite/getCodeForBook.html"
                        },
                        {
                            "type":"view",
                            "name":"设置",
                            "url": "msite/getCodeForConf.html"
                        }
                    ]
            }]
};
wxMenu.defineTasks = function(tickTasks, callback) {
    //console.log("menu begins");
    menuBuilder(tickTasks, menuObject, callback);
};
wxMenu.textMsgRepliers = [];

wxMenu.textMsgRepliers['my4S.onBooking'] = my4S.onBookingMessages;
wxMenu.textMsgRepliers['my4S.onManual'] = my4S.onManualMessages;

wxMenu.onClick = [];

wxMenu.onClick['MYCAR.MYDRIVE'] = function(message, session, next) {
    myCar.myDriveReport(message.FromUserName, message.ToUserName, function(err, reportContent){
        if (err) {
            next(err);
        }
        else {
            next(null, [{
                title: '行车分析',
                description: reportContent,
                picurl: '',
                url: url.resolve(config.baseUrl, "msite/myDrive.html?user=") + message.FromUserName + '@' + message.ToUserName
            }]);
        }
    });
};


wxMenu.onClick['MY4S.PROBE'] = function(message, session, next) {
    my4S.trialrun(message.FromUserName, message.ToUserName,session, function(err, result){
        if (err) {
            return next(err);
        }
        return next(null, [{
            title: '试乘试驾',
            description: result,
            picurl: '',
            url: url.resolve(config.baseUrl, "msite/trialrun.html?user=") + message.FromUserName + '@' + message.ToUserName
        }]);
    });
};
wxMenu.onClick['MY4S.INFO'] = function(message, session, next) {
    my4S.my4sInfo(message.FromUserName, message.ToUserName,session, function(err, result){
        if (err) {
            return next(err);
        }
        return next(null, [{
            title: '资讯活动',
            description: result,
            picurl: '',
            url: url.resolve(config.baseUrl, "msite/my4sInfo.html?user=") + message.FromUserName + '@' + message.ToUserName
        }]);
    });
};
wxMenu.onClick['MY4S.BOOKING'] = function(message, session, next) {

    my4S.book(message.FromUserName,message.ToUserName, session, function(err, result){
        if (err) {
            return next(err);
        }
        return next(null, [{
            title: '预约保养',
            description: result,
            picurl: '',
            url: url.resolve(config.baseUrl, "msite/booking.html?user=") + message.FromUserName + '@' + message.ToUserName
        }]);
    });
};

wxMenu.onClick['MY4S.MANUAL'] = function(message, session, next) {
    my4S.manual(message.FromUserName, session, function(err, result){
        if (err) {
            return next(err);
        }
        return next(null, [{
            title: '行车手册',
            description: result,
            picurl: '',
            url: url.resolve(config.baseUrl, "msite/page_xcsc.html?user=")+message.FromUserName+'@'+message.ToUserName
        }]);
    });
};
wxMenu.onClick['MY4S.CONTACT'] = function(message, session, next) {
    my4S.contact(message.FromUserName, message.ToUserName,session, function(err, result, pic){
        if (err) {
            return next(err);
        }
        return next(null, [{
            title: '联系我们',
            description: result,
            picurl: url.resolve(config.baseUrl, pic),
            url: ''  /**  url.resolve(config.baseUrl, "msite/???.html?user=") + message.FromUserName + '@' + message.ToUserName **/
        }]);
    });
};
exports = module.exports = wxMenu;