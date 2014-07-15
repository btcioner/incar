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

var menuObject = {
    "button": [
        {
            "name": "我的车",
            "sub_button": [
                {
                    "type": "click",
                    "name": "行车记录",
                    "key": "MYCAR.DRIVERECORD"
                },
                {
                    "type": "click",
                    "name": "行车分析",
                    "key": "MYCAR.MYDRIVE"
                },
                {
                    "type": "click",
                    "name": "行车手册",
                    "key": "MY4S.MANUAL"
                },
                {
                    "type": "click",
                    "name": "车况检测",
                    "key": "MYCAR.MAINTAIN"
                },
                {
                    "type": "click",
                    "name": "行车报告",
                    "key": "MYCAR.COST"
                }
            ]
        },
        {
            "name": "我的4S",
            "sub_button": [
                {
                    "type": "click",
                    "name": "预约保养",
                    "key": "MY4S.BOOKING"
                },
                {
                    "type": "click",
                    "name": "试乘试驾",
                    "key": "MY4S.PROBE"
                },
                {
                    "type": "click",
                    "name": "资讯活动",
                    "key": "MY4S.INFO"
                },
                {
                    "type": "click",
                    "name": "联系我们",
                    "key": "MY4S.CONTACT"
                }
            ]
        },
        {
            "name": "发现",
            "sub_button": [
                {
                    "type": "view",
                    "name": "我的活动",
                    "url": "msite/myActivity.html"
                },
                {
                    "type": "view",
                    "name": "我的预约",
                    "url": "msite/myBooking.html"
                },
                {
                    "type": "view",
                    "name": "设置",
                    "url": "msite/infoConfig.html"
                }
            ]
        }
    ]
};
wxMenu.defineTasks = function (tickTasks, callback) {
    //console.log("menu begins");
    menuBuilder(tickTasks, menuObject, callback);
};
wxMenu.textMsgRepliers = [];

wxMenu.textMsgRepliers['my4S.onBooking'] = my4S.onBookingMessages;
wxMenu.textMsgRepliers['my4S.onManual'] = my4S.onManualMessages;

wxMenu.onClick = [];

wxMenu.onClick['MYCAR.MYDRIVE'] = function (message, req, next) {
    myCar.myDriveReport(message.FromUserName, message.ToUserName, function (err, reportContent) {
        if (err) {
            console.error(err);
            next(null, [
                {
                    title: '行车分析',
                    description: '请向4S店购买并注册OBD获取此功能',
                    picurl: url.resolve("http://" + req.headers.host, "data/Logo2.jpg"),
                    url: ''
                },
                {
                    title: '行车分析2',
                    description: '请向4S店购买并注册OBD获取此功能2',
                    picurl: url.resolve("http://" + req.headers.host, "data/Logo2.jpg"),
                    url: ''
                },
                {
                    title: '行车分析3',
                    description: '请向4S店购买并注册OBD获取此功能3',
                    picurl: url.resolve("http://" + req.headers.host, "data/Logo2.jpg"),
                    url: ''
                },
                {
                    title: '行车分析4',
                    description: '请向4S店购买并注册OBD获取此功能4',
                    picurl: url.resolve("http://" + req.headers.host, "data/Logo2.jpg"),
                    url: ''
                }
            ]);
        }
        else {
            next(null, [
                {
                    title: '行车分析',
                    description: reportContent,
                    picurl: '',
                    url: url.resolve("http://" + req.headers.host, "msite/myDrive.html?user=") + message.FromUserName + '@' + message.ToUserName
                }
            ]);
        }
    });
};
wxMenu.onClick['MYCAR.DRIVERECORD'] = function (message, req, next) {
    myCar.myDriveRecord(message.FromUserName, message.ToUserName, function (err, reportContent) {
        if (err) {
            console.error(err);
            next(null, [
                {
                    title: '行车记录',
                    description: '请向4S店购买并注册OBD获取此功能',
                    picurl: url.resolve("http://" + req.headers.host, "data/logo.jpg"),
                    url: ''
                }
            ]);
        }
        else {
            next(null, [
                {
                    title: '行车记录',
                    description: reportContent,
                    picurl: url.resolve("http://" + req.headers.host, "data/upload/5360-1y8wzqo.jpg"),
                    url: url.resolve("http://" + req.headers.host, "msite/driveRecord.html?user=") + message.FromUserName + '@' + message.ToUserName
                }
            ]);
        }
    });
};
wxMenu.onClick['MYCAR.MAINTAIN'] = function (message, req, next) {
    next(null, [
        {
            title: "车况检测",
            description: "亲,正在开发中,马上就会有",
            picurl: url.resolve("http://" + req.headers.host, "data/logo.jpg"),
            url: ''
        }
    ]);
};

wxMenu.onClick['MYCAR.COST'] = function (message, req, next) {
    next(null, [
        {
            title: "车况检测",
            description: "亲,正在开发中,马上就会有",
            picurl: url.resolve("http://" + req.headers.host, "data/logo.jpg"),
            url: ''
        }
    ]);
};


wxMenu.onClick['MY4S.PROBE'] = function (message, req, next) {
    my4S.trialrun(message.FromUserName, message.ToUserName, req.wxsession, function (err, result) {
        if (err) {
            return next(err);
        }
        return next(null, [
            {
                title: '试乘试驾',
                description: result,
                picurl: '',
                url: url.resolve("http://" + req.headers.host, "msite/trialrun.html?user=") + message.FromUserName + '@' + message.ToUserName
            }
        ]);
    });
};
wxMenu.onClick['MY4S.INFO'] = function (message, req, next) {
    my4S.my4sInfo(message.FromUserName, message.ToUserName, req.wxsession, function (err, result) {
        if (err) {
            return next(err);
        }
        return next(null, [
            {
                title: '资讯活动',
                description: result,
                picurl: '',
                url: url.resolve("http://" + req.headers.host, "msite/my4sInfo.html?user=") + message.FromUserName + '@' + message.ToUserName
            }
        ]);
    });
};
wxMenu.onClick['MY4S.BOOKING'] = function (message, req, next) {

    my4S.book(message.FromUserName, message.ToUserName, req.wxsession, function (err, result) {
        if (err) {
            return next(err);
        }
        return next(null, [
            {
                title: '预约保养',
                description: result,
                picurl: '',
                url: url.resolve("http://" + req.headers.host, "msite/booking.html?user=") + message.FromUserName + '@' + message.ToUserName
            }
        ]);
    });
};

wxMenu.onClick['MY4S.MANUAL'] = function (message, req, next) {
    my4S.manual(message.FromUserName, req.wxsession, function (err, result) {
        if (err) {
            return next(err);
        }
        return next(null, [
            {
                title: '行车手册',
                description: result,
                picurl: '',
                url: url.resolve("http://" + req.headers.host, "msite/page_xcsc.html?user=") + message.FromUserName + '@' + message.ToUserName
            }
        ]);
    });
};
wxMenu.onClick['MY4S.CONTACT'] = function (message, req, next) {
    my4S.contact(message.FromUserName, message.ToUserName, req.wxsession, function (err, result, pic) {
        if (err) {
            return next(err);
        }
        return next(null, [
            {
                title: '联系我们',
                description: result,
                picurl: url.resolve("http://" + req.headers.host, pic),
                url: ''
            }
        ]);
    });
};
exports = module.exports = wxMenu;