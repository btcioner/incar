/**
 * Created by Jesse Qu on 3/21/14.
 */

'use strict';

var WXAPI = require('../weixin').API;
var myCar = require('./myCar');
var my4S = require('./my4S');
var menuBuilder = require('./menu');
var wxMenu = {};

wxMenu.define = function(appid, appsecret){
    return function() {
        var api = new WXAPI(appid, appsecret);
        api.createMenu({
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
                                    "url":"http://linuxsrv.winphone.us/shopping"
                                },
                                {
                                    "type":"view",
                                    "name":"我的预约",
                                    "url":"http://linuxsrv.winphone.us/promotions"
                                },
                                {
                                    "type":"view",
                                    "name":"设置",
                                    "url":"http://linuxsrv.winphone.us/msite/getCode.html"
                                }
                            ]
                    }
                ]
        }, function(err, result){
            if (err) {
                console.log('Error occurred when weixin menu was newly defined - ' + err + '\n');
            }
            else {
                console.log('Weixin menu was newly defined!!\n');
            }
        });
    };
};
wxMenu.defineTasks = function(tickTasks, callback) {
    menuBuilder(tickTasks, this.menuObject, callback);
};
wxMenu.textMsgRepliers = [];

wxMenu.textMsgRepliers['my4S.onBooking'] = my4S.onBookingMessages;
wxMenu.textMsgRepliers['my4S.onManual'] = my4S.onManualMessages;

wxMenu.onClick = [];

wxMenu.onClick['MYCAR.MYDRIVE'] = function(message, session, next) {
    myCar.myDriveReport(message.FromUserName, message.ToUserName, function(err, reportContent){
        if (err) {
            // error handling ...
            next(err);
        }
        else {
            next(null, [{
                title: '行车分析',
                description: reportContent,
                picurl: '',
                url: 'http://linuxsrv.winphone.us/msite/myDrive.html?user=' + message.FromUserName + '@' + message.ToUserName
            }]);
        }
    });
};



wxMenu.onClick['MYCAR.BEHAVIOR'] = function(message, session, next) {
    myCar.driveBehaviorReport(message.FromUserName, message.ToUserName, function(err, reportContent){
        if (err) {
            // error handling ...
            next(err);
        }
        else {
            next(null, [{
                title: '驾驶行为报告',
                description: reportContent,
                picurl: '',
                url: 'http://linuxsrv.winphone.us/msite/drivingBehavior.html?user=' + message.FromUserName + '@' + message.ToUserName
            }]);
        }
    });
};

wxMenu.onClick['MY4S.PROBE'] = function(message, session, next) {
};

wxMenu.onClick['MY4S.BOOKING'] = function(message, session, next) {
    console.log("begin booking");
    my4S.book(message.FromUserName, session, function(err, result){
        if (err) {
            return next(err);
        }
        return next(null, [{
            title: '预约保养',
            description: result,
            picurl: '',
            url: 'http://linuxsrv.winphone.us/msite/booking.html?user=' + message.FromUserName + '@' + message.ToUserName
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
            url: ''  /**  http://linuxsrv.winphone.us/msite/manual?user=' + message.FromUserName + '@' + message.ToUserName **/
        }]);
    });
};

exports = module.exports = wxMenu;