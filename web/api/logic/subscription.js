/**
 * Created by Jesse Qu on 3/20/14.
 */

'use strict';

var ejs = require('ejs');
var mysql = require('mysql');
var config = require('../../config/config');
var WXAPI = require('../weixin').API;

var subscription = {};

subscription.subscribe = function(message, req, next) {

    var tpl = [
        '欢迎您的关注！\n',
        '如果您是本4S店的车主用户，请您点击本消息注册您的信息。\n',
        '\n'
    ].join('');

    var compiled = ejs.compile(tpl);

    return next(null, [{
        title: '',
        description: compiled({}),
        picurl: '',
        url: 'http://' + req.headers.host + '/msite/infoConfig.html?user=' + message.FromUserName + '@' + message.ToUserName
    }]);
};

subscription.unsubscribe = function(message, req, next) {
    return next(null, [{
        title: '',
        description: '',
        picurl: '',
        url: ''
    }]);
};

subscription.db = require('../../config/db');

exports = module.exports = subscription;