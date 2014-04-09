/**
 * Created by Jesse Qu on 3/20/14.
 */

'use strict';

var ejs = require('ejs');
var db = require('../data/mysqlDatabase');
var dataAccess = require('../data/mysqlDataAccess');
var WXAPI = require('../weixin').API;

var subscription = {};

function updateUserWithWXAPI(selector, userDA) {
    return function() {
        var api = new WXAPI('wx5de0018d8c7b0b0d', 'ea3cbd792917a19f7d043b02b7a7a0c6');
        api.getUser(selector.openid, function(err, result){
            console.log('err:');
            console.log(err);
            console.log('result:');
            console.log(result);
            if (err) { return; }
            userDA.update(selector, {
                'nickname': result.nickname,
                'sex': result.sex,
                'city': result.city,
                'country': result.country,
                'province': result.province,
                'language': result.language,
                'headimgurl': result.headimgurl
            }, function(err, result){});
        });
    };
}

subscription.subscribe = function(message, next) {

    var pool = db.RetrievePool();
    var serviceAccountDA = dataAccess(pool, 't_wx_service_account');
    var userDA = dataAccess(pool, 't_wx_user');

    var tpl = [
        '欢迎您的关注！\n',
        '如果您是本4S店的车主用户，请您点击本消息注册您的信息。\n',
        '\n'
    ].join('');

    var compiled = ejs.compile(tpl);

    serviceAccountDA.load({'openid': message.ToUserName}, function(err, rows){
        if (err) { return next(err); }
        if (rows && rows.length === 1 && rows[0].status === 1) {
            if (err) { return next(err); }

            userDA.load({'sopenid': message.ToUserName, 'openid': message.FromUserName}, function(err, rows){
                if (err) { return next(err); }
                if (rows && rows.length === 1){
                    userDA.update({'sopenid': message.ToUserName, 'openid': message.FromUserName}, {
                        'subscribe': 1,
                        'subscribe_time': new Date()
                    }, function(err, rows){
                        if (err) { return next(err); }
                        process.nextTick(updateUserWithWXAPI({'sopenid': message.ToUserName, 'openid': message.FromUserName}, userDA));
                        return next(null, [{
                            title: '',
                            description: compiled({}),
                            picurl: '',
                            url: 'http://linuxsrv.winphone.us/msite/enroll.html?user=' + message.FromUserName
                        }]);
                    });
                }
                else {
                    userDA.create({
                        'sopenid': message.ToUserName,
                        'openid': message.FromUserName,
                        'subscribe': 1,
                        'subscribe_time': new Date()
                    }, function(err, rows){
                        if (err) { return next(err); }
                        process.nextTick(updateUserWithWXAPI({'sopenid': message.ToUserName, 'openid': message.FromUserName}, userDA));
                        return next(null, [{
                            title: '',
                            description: compiled({}),
                            picurl: '',
                            url: 'http://linuxsrv.winphone.us/msite/enroll.html?user=' + message.FromUserName
                        }]);
                    });
                }
            });
        }
    });
};

subscription.unsubscribe = function(message, next) {

    var pool = db.RetrievePool();
    var serviceAccountDA = dataAccess(pool, 't_wx_service_account');
    var userDA = dataAccess(pool, 't_wx_user');

    serviceAccountDA.load({'openid': message.ToUserName}, function(err, rows){
        if (err) { return next(err); }
        if (rows && rows.length === 1 && rows[0].status === 1) {
            if (err) { return next(err); }

            userDA.load({'sopenid': message.ToUserName, 'openid': message.FromUserName}, function(err, rows){
                if (err) { return next(err); }
                if (rows && rows.length === 1){
                    userDA.update({'sopenid': message.ToUserName, 'openid': message.FromUserName}, {
                        'subscribe': 0
                    }, function(err, result){
                        if (err) { return next(err); }
                        return next(null, '');
                    });
                }
            });
        }
    });
};

exports = module.exports = subscription;