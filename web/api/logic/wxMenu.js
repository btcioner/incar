/**
 * Created by Jesse Qu on 3/21/14.
 */

'use strict';

var WXAPI = require('../weixin').API;
var myCar = require('./myCar');
var my4S = require('./my4S');

var wxMenu = {};

wxMenu.define = function(appid, appsecret){
    return function() {
        var api = new WXAPI('wx5de0018d8c7b0b0d', 'ea3cbd792917a19f7d043b02b7a7a0c6');
        api.createMenu({
            "button":
                [
                    {
                        "name":"我的车",
                        "sub_button":
                            [
                                {
                                    "type":"click",
                                    "name":"我的油耗",
                                    "key":"MYCAR.FUEL"
                                },
                                {
                                    "type":"click",
                                    "name":"碳排放量",
                                    "key":"MYCAR.CARBON"
                                },
                                {
                                    "type":"click",
                                    "name":"驾驶行为",
                                    "key":"MYCAR.BEHAVIOR"
                                },
                                {
                                    "type":"click",
                                    "name":"保养记录",
                                    "key":"MYCAR.MAINTAIN"
                                },
                                {
                                    "type":"click",
                                    "name":"费用开支",
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
                                    "name":"远程检测",
                                    "key":"MY4S.PROBE"
                                },
                                {
                                    "type":"click",
                                    "name":"行车手册",
                                    "key":"MY4S.MANUAL"
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
                                    "name":"精品商城",
                                    "url":"http://linuxsrv.winphone.us/shopping"
                                },
                                {
                                    "type":"view",
                                    "name":"活动优惠",
                                    "url":"http://linuxsrv.winphone.us/promotions"
                                },
                                {
                                    "type":"view",
                                    "name":"资讯信息",
                                    "url":"http://linuxsrv.winphone.us/information"
                                },
                                {
                                    "type":"view",
                                    "name":"三方服务",
                                    "url":"http://linuxsrv.winphone.us/thirdparty"
                                },
                                {
                                    "type":"view",
                                    "name":"设置",
                                    "url":"http://linuxsrv.winphone.us/configure"
                                }
                            ]
                    }
                ]
        }, function(err, result){});
        console.log('Weixin menu was newly defined!!\n');
    };
};

wxMenu.textMsgRepliers = [];

wxMenu.textMsgRepliers['my4S.onBooking'] = my4S.onBookingMessages;
wxMenu.textMsgRepliers['my4S.onManual'] = my4S.onManualMessages;

wxMenu.onClick = [];

wxMenu.onClick['MYCAR.FUEL'] = function(message, session, next) {
    myCar.fuelReport(message.FromUserName, message.ToUserName, function(err, reportContent){
        if (err) {
            // error handling ...
            next(err);
        }
        else {
            next(null, [{
                title: '油耗报告',
                description: reportContent,
                picurl: '',
                url: 'http://linuxsrv.winphone.us/msite/fuel.html?user=' + message.FromUserName
            }]);
        }
    });
};

wxMenu.onClick['MYCAR.CARBON'] = function(message, session, next) {
    myCar.carbonReport(message.FromUserName, message.ToUserName, function(err, reportContent){
        if (err) {
            // error handling ...
            next(err);
        }
        else {
            next(null, [{
                title: '我的碳排放',
                description: reportContent,
                picurl: '',
                url: 'http://linuxsrv.winphone.us/msite/carbon.html?user=' + message.FromUserName
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
                url: 'http://linuxsrv.winphone.us/msite/drivingBehavior.html?user=' + message.FromUserName
            }]);
        }
    });
};

wxMenu.onClick['MY4S.PROBE'] = function(message, session, next) {
};

wxMenu.onClick['MY4S.BOOKING'] = function(message, session, next) {
    my4S.book(message.FromUserName, session, function(err, result){
        if (err) {
            return next(err);
        }
        return next(null, [{
            title: '预约保养',
            description: result,
            picurl: '',
            url: 'http://linuxsrv.winphone.us/msite/booking?user=' + message.FromUserName
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
            url: 'http://linuxsrv.winphone.us/msite/manual?user=' + message.FromUserName
        }]);
    });
};

exports = module.exports = wxMenu;