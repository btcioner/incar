/**
 * Created by Jesse Qu on 3/21/14.
 */

'use strict';

var url = require('url');
var config = require('../../config/config');
var menuBuilder = require('./menu');
var WXAPI = require('../weixin').API;
var myCar = require('./myCar');
var my4S = require('./my4S');
var userSrv = require('./user');
var graphicCount = require('./graphicCount');

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
                    "key": "MYCAR.MANUAL"
                },
                {
                    "type": "click",
                    "name": "车况检测",
                    "key": "MYCAR.MAINTAIN"
                },
                {
                    "type": "click",
                    "name": "用车报告",
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
                    "type": "click",
                    "name": "我的活动",
                    "key": "ETC.MYACT"
                },
                {
                    "type": "click",
                    "name": "我的预约",
                    "key": "ETC.MYBKG"
                },
                {
                    "type": "click",
                    "name": "我的信息",
                    "key": "ETC.CFG"
                }
            ]
        }
    ]
};
wxMenu.defineTasks = function (tickTasks, callback) {
    if(process.env.INCAR_REG_WXMENU || process.env.NODE_ENV !== 'development')
        menuBuilder(tickTasks, menuObject, callback);
    else
        console.info("development环境默认不启用微信菜单注册,除非定义了INCAR_REG_WXMENU=true");
};
wxMenu.textMsgRepliers = [];

wxMenu.textMsgRepliers['my4S.onBooking'] = my4S.onBookingMessages;
wxMenu.textMsgRepliers['my4S.onManual'] = my4S.onManualMessages;
wxMenu.onClick = [];

wxMenu.onClick['MYCAR.MYDRIVE'] = function (message, req, next) {
    countMenuClick("0","2",message.FromUserName+":"+message.ToUserName);//记录菜单点击
    var task = { finished: 0};
    task.begin = function () {
        // task A
        my4S.mostNews(message.FromUserName, message.ToUserName, req.wxsession, function (news) {
            task.finished++;
            task.A = { news: news };
            task.end();
        });

        // task B
        myCar.myDriveReport(message.FromUserName, message.ToUserName, function (err, reportContent) {
            if (err) {
                console.error(err);
                task.B = {
                    title: '购买并注册车云终端以查看平均油耗、碳排放、速段统计等信息',
                    description: '购买并注册车云终端以查看平均油耗、碳排放、速段统计等信息',
                    picurl: url.resolve("http://" + req.headers.host, "data/drive_analyse.jpg"),
                    url: ''
                };
            }
            else {
                task.B = {
                    title: '点击查看平均油耗、碳排放、驾驶行为、速段统计等',
                    description: reportContent,
                    picurl: url.resolve("http://" + req.headers.host, "data/drive_analyse.jpg"),
                    url: url.resolve("http://" + req.headers.host, "msite/myDrive.html?user=") + message.FromUserName + '@' + message.ToUserName
                };
            }
            task.finished++;
            task.end();
        });
    };
    task.end = function () {
        if (task.finished < 2) return;
        var wxMsg = [task.B];
        for (var i = 0; i < task.A.news.length; i++) {
            var news = task.A.news[i];
            var logo_url = "";
            if(news.logo_url)
            {
                logo_url = news.logo_url;
            }
            wxMsg.push({
                title: news.title,
                picurl: url.resolve("http://" + req.headers.host, logo_url),
                url: url.resolve("http://" + req.headers.host, "msite/activityDetail.html?user=") + message.FromUserName + '@' + message.ToUserName + '&id=' + news.id
            });
        }

        next(null, wxMsg);
    };
    task.begin();
};
wxMenu.onClick['MYCAR.DRIVERECORD'] = function (message, req, next) {
    countMenuClick("0","1",message.FromUserName+":"+message.ToUserName);//记录菜单点击
    var task = { finished: 0};
    task.begin = function () {
        // task A
        my4S.mostNews(message.FromUserName, message.ToUserName, req.wxsession, function (news) {
            task.finished++;
            task.A = { news: news };
            task.end();
        });

        userSrv.isRegisterOBD(message.FromUserName+":"+message.ToUserName, function(ex, data){
            if(ex){
                console.log(ex);
                task.finished++;
                task.end();
                return;
            }

            if(data){
                myCar.myDriveRecord(message.FromUserName, message.ToUserName, function (err, reportContent) {
                    if(err){
                        console.log(err);
                    }
                    else{
                        task.B =
                        {
                            title: '点击查看所有行车记录',
                            description: reportContent,
                            picurl: url.resolve("http://" + req.headers.host, "data/drive_records.jpg"),
                            url: url.resolve("http://" + req.headers.host, "msite/driveRecord.html?user=") + message.FromUserName + '@' + message.ToUserName
                        };
                    }
                    task.finished++;
                    task.end();
                });
            }
            else{
                // 没有注册OBD
                task.B =
                {
                    title: '购买并注册车云终端以查看行车记录信息',
                    description: '购买并注册车云终端以查看行车记录信息',
                    picurl: url.resolve("http://" + req.headers.host, "data/drive_records.jpg"),
                    url: ''
                };
                task.finished++;
                task.end();
            }
        });
    };
    task.end = function () {
        if (task.finished < 2) return;
        var wxMsg = [task.B];
        for (var i = 0; i < task.A.news.length; i++) {
            var news = task.A.news[i];
            var logo_url = "";
            if(news.logo_url)
            {
                logo_url = news.logo_url;
            }
            wxMsg.push({
                title: news.title,
                picurl: url.resolve("http://" + req.headers.host, logo_url),
                url: url.resolve("http://" + req.headers.host, "msite/activityDetail.html?user=") + message.FromUserName + '@' + message.ToUserName + '&id=' + news.id
            });
        }

        next(null, wxMsg);
    };
    task.begin();
};
wxMenu.onClick['MYCAR.MAINTAIN'] = function (message, req, next) {
    countMenuClick("0","4",message.FromUserName+":"+message.ToUserName);//记录菜单点击
    var task = { finished: 0};
    task.begin = function () {
        // task A
        my4S.mostNews(message.FromUserName, message.ToUserName, req.wxsession, function (news) {
            task.finished++;
            task.A = { news: news };
            task.end();
        });

        // task B
        task.B = {
            title: "车况检测:亲,正在开发中,马上就会有",
            description: "车况检测:亲,正在开发中,马上就会有",
            picurl: url.resolve("http://" + req.headers.host, "data/car_checking.jpg"),
            url: ''
        };
        task.finished++;
        task.end();
    };
    task.end = function () {
        if (task.finished < 2) return;
        var wxMsg = [task.B];
        for (var i = 0; i < task.A.news.length; i++) {
            var news = task.A.news[i];
            var logo_url = "";
            if(news.logo_url)
            {
                logo_url = news.logo_url;
            }
            wxMsg.push({
                title: news.title,
                picurl: url.resolve("http://" + req.headers.host, logo_url),
                url: url.resolve("http://" + req.headers.host, "msite/activityDetail.html?user=") + message.FromUserName + '@' + message.ToUserName + '&id=' + news.id
            });
        }

        next(null, wxMsg);
    };
    task.begin();
};
wxMenu.onClick['MYCAR.MANUAL'] = function (message, req, next) {
    countMenuClick("0","3",message.FromUserName+":"+message.ToUserName);//记录菜单点击
    var task = { finished: 0};
    task.begin = function () {
        // task A
        my4S.mostNews(message.FromUserName, message.ToUserName, req.wxsession, function (news) {
            task.finished++;
            task.A = { news: news };
            task.end();
        });

        // task B
        my4S.manual(message.FromUserName, req.wxsession, function (err, result) {
            task.B = {
                title: '请回复关键字,来查询行车手册',
                description: result,
                picurl: url.resolve("http://" + req.headers.host, "data/drive_manual.jpg"),
                url: url.resolve("http://" + req.headers.host, "msite/page_xcsc.html?user=") + message.FromUserName + '@' + message.ToUserName
            };
            task.finished++;
            task.end();
        });
    };
    task.end = function () {
        if (task.finished < 2) return;
        var wxMsg = [task.B];
        for (var i = 0; i < task.A.news.length; i++) {
            var news = task.A.news[i];
            var logo_url = "";
            if(news.logo_url)
            {
                logo_url = news.logo_url;
            }
            wxMsg.push({
                title: news.title,
                picurl: url.resolve("http://" + req.headers.host, logo_url),
                url: url.resolve("http://" + req.headers.host, "msite/activityDetail.html?user=") + message.FromUserName + '@' + message.ToUserName + '&id=' + news.id
            });
        }

        next(null, wxMsg);
    };
    task.begin();
};
wxMenu.onClick['MYCAR.COST'] = function (message, req, next) {
    countMenuClick("0","5",message.FromUserName+":"+message.ToUserName);//记录菜单点击
    var task = { finished: 0};
    task.begin = function () {
        // task A
        my4S.mostNews(message.FromUserName, message.ToUserName, req.wxsession, function (news) {
            task.finished++;
            task.A = { news: news };
            task.end();
        });

        // task B
        userSrv.isRegisterOBD(message.FromUserName+":"+message.ToUserName, function(ex, data) {
            if(ex){ console.log(ex); }
            else if(data){
                task.B = {
                    title: "点击查看用车报告",
                    description: "",
                    picurl: url.resolve("http://" + req.headers.host, "data/car_report.jpg"),
                    url: url.resolve("http://" + req.headers.host, "msite/travelReport.html?user=" + message.FromUserName + "@" + message.ToUserName)
                };
            }
            else{
                // 没有注册OBD
                task.B =
                {
                    title: '购买并注册车云终端以查看用车分析报告',
                    description: '购买并注册车云终端以查看用车分析报告',
                    picurl: url.resolve("http://" + req.headers.host, "data/car_report.jpg"),
                    url: ''
                };
            }
        });

        task.finished++;
        task.end();
    };
    task.end = function () {
        if (task.finished < 2) return;
        var wxMsg = [task.B];
        for (var i = 0; i < task.A.news.length; i++) {
            var news = task.A.news[i];
            var logo_url = "";
            if(news.logo_url)
            {
                logo_url = news.logo_url;
            }
            wxMsg.push({
                title: news.title,
                picurl: url.resolve("http://" + req.headers.host, logo_url),
                url: url.resolve("http://" + req.headers.host, "msite/activityDetail.html?user=") + message.FromUserName + '@' + message.ToUserName + '&id=' + news.id
            });
        }

        next(null, wxMsg);
    };
    task.begin();
};


wxMenu.onClick['MY4S.PROBE'] = function (message, req, next) {
    countMenuClick("0","7",message.FromUserName+":"+message.ToUserName);//记录菜单点击
    my4S.trialrun(message.FromUserName, message.ToUserName, req.wxsession, function (err, result) {
        if (err) {
            return next(err);
        }
        return next(null, [
            {
                title: '试乘试驾',
                description: result,
                picurl: url.resolve("http://" + req.headers.host, 'data/my_try.png'),
                url: url.resolve("http://" + req.headers.host, "msite/trialrun.html?user=") + message.FromUserName + '@' + message.ToUserName
            }
        ]);
    });
};
wxMenu.onClick['MY4S.INFO'] = function (message, req, next) {
    countMenuClick("0","8",message.FromUserName+":"+message.ToUserName);//记录菜单点击
    my4S.my4sInfo(message.FromUserName, message.ToUserName, req.wxsession, function (err, result) {
        if (err) {
            return next(err);
        }
        return next(null, [
            {
                title: '资讯活动',
                description: result,
                picurl: url.resolve("http://" + req.headers.host, 'data/act_info.jpg'),
                url: url.resolve("http://" + req.headers.host, "msite/my4sInfo.html?user=") + message.FromUserName + '@' + message.ToUserName
            }
        ]);
    });
};
wxMenu.onClick['MY4S.BOOKING'] = function (message, req, next) {
    countMenuClick("0","6",message.FromUserName+":"+message.ToUserName);//记录菜单点击
    my4S.book(message.FromUserName, message.ToUserName, req.wxsession, function (err, result) {
        if (err) {
            return next(err);
        }
        return next(null, [
            {
                title: '预约保养',
                description: result,
                picurl: url.resolve("http://" + req.headers.host, 'data/care_booking.jpg'),
                url: url.resolve("http://" + req.headers.host, "msite/booking.html?user=") + message.FromUserName + '@' + message.ToUserName
            }
        ]);
    });
};

wxMenu.onClick['MY4S.CONTACT'] = function (message, req, next) {
    countMenuClick("0","9",message.FromUserName+":"+message.ToUserName);//记录菜单点击
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

wxMenu.onClick['ETC.CFG'] = function(message, req, next){
    countMenuClick("0","12",message.FromUserName+":"+message.ToUserName);//记录菜单点击
    var topMsg = {
        title: "点击配置我的车辆",
        description:"点击配置我的车辆",
        picurl: url.resolve("http://" + req.headers.host, "data/my_config.jpg"),
        url: url.resolve("http://" + req.headers.host, "msite/infoConfig.html?user=") + message.FromUserName + '@' + message.ToUserName
    };
    return onClickETC(topMsg, message, req, next);
};

wxMenu.onClick['ETC.MYACT'] = function(message, req, next){
    countMenuClick("0","10",message.FromUserName+":"+message.ToUserName);//记录菜单点击
    var topMsg = {
        title: "点击查看我的活动",
        description:"点击查看我的活动",
        picurl: url.resolve("http://" + req.headers.host, "data/my_activities.jpg"),
        url: url.resolve("http://" + req.headers.host, "msite/myActivity.html?user=") + message.FromUserName + '@' + message.ToUserName
    };
    return onClickETC(topMsg, message, req, next);
};

wxMenu.onClick['ETC.MYBKG'] = function(message, req, next){
    countMenuClick("0","11",message.FromUserName+":"+message.ToUserName);//记录菜单点击
    var topMsg = {
        title: "点击查看我的预约",
        description:"点击查看我的预约",
        picurl: url.resolve("http://" + req.headers.host, "data/my_bookings.jpg"),
        url: url.resolve("http://" + req.headers.host, "msite/myBooking.html?user=") + message.FromUserName + '@' + message.ToUserName
    };
    return onClickETC(topMsg, message, req, next);
};

function onClickETC(topMsg, message, req, next){
    var wxMsg = [topMsg];
    my4S.mostNews(message.FromUserName, message.ToUserName, req.wxsession, function (news) {
        for (var i = 0; i < news.length; i++) {
            var logo_url = "";
            if(news[i].logo_url)
            {
                logo_url = news[i].logo_url;
            }
            wxMsg.push({
                title: news[i].title,
                picurl: url.resolve("http://" + req.headers.host, logo_url),
                url: url.resolve("http://" + req.headers.host, "msite/activityDetail.html?user=") + message.FromUserName + '@' + message.ToUserName + '&id=' + news[i].id
            });
        }

        return next(null, wxMsg);
    });
}


//菜单点击记录--by jl 07/21/14
function countMenuClick(countType,pageId,wx_oid)
{
    graphicCount.countData(countType,pageId,wx_oid,function(err,news){
        if(err)
        {
            console.error(err);
        }
        else{
            console.log(news.status);
        }
    });
}
exports = module.exports = wxMenu;