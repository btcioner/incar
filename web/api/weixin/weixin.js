/**
 * Created by Jesse Qu on 3/19/14.
 */
'use strict';

var crypto = require('crypto');
var xml2js = require('xml2js');
var ejs = require('ejs');
var BufferHelper = require('bufferhelper');
var Session = require('./session');

/*!
 * Check Signature
 */
var checkSignature = function (query, token) {
    var signature = query.signature;
    var timestamp = query.timestamp;
    var nonce = query.nonce;

    var shasum = crypto.createHash('sha1');
    var arr = [token, timestamp, nonce].sort();
    shasum.update(arr.join(''));

    return shasum.digest('hex') === signature;
};

/*!
 * Response Template
 */
var tpl = ['<xml>',
    '<ToUserName><![CDATA[<%-toUsername%>]]></ToUserName>',
    '<FromUserName><![CDATA[<%-fromUsername%>]]></FromUserName>',
    '<CreateTime><%=createTime%></CreateTime>',
    '<MsgType><![CDATA[<%=msgType%>]]></MsgType>',
    '<% if (msgType === "news") { %>',
    '<ArticleCount><%=content.length%></ArticleCount>',
    '<Articles>',
    '<% content.forEach(function(item){ %>',
    '<item>',
    '<Title><![CDATA[<%-item.title%>]]></Title>',
    '<Description><![CDATA[<%-item.description%>]]></Description>',
    '<PicUrl><![CDATA[<%-item.picUrl || item.picurl || item.pic %>]]></PicUrl>',
    '<Url><![CDATA[<%-item.url%>]]></Url>',
    '</item>',
    '<% }); %>',
    '</Articles>',
    '<% } else if (msgType === "music") { %>',
    '<Music>',
    '<Title><![CDATA[<%-content.title%>]]></Title>',
    '<Description><![CDATA[<%-content.description%>]]></Description>',
    '<MusicUrl><![CDATA[<%-content.musicUrl || content.url %>]]></MusicUrl>',
    '<HQMusicUrl><![CDATA[<%-content.hqMusicUrl || content.hqUrl %>]]></HQMusicUrl>',
    '</Music>',
    '<% } else if (msgType === "voice") { %>',
    '<Voice>',
    '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
    '</Voice>',
    '<% } else if (msgType === "image") { %>',
    '<Image>',
    '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
    '</Image>',
    '<% } else if (msgType === "video") { %>',
    '<Video>',
    '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
    '<ThumbMediaId><![CDATA[<%-content.thumbMediaId%>]]></ThumbMediaId>',
    '</Video>',
    '<% } else { %>',
    '<Content><![CDATA[<%-content%>]]></Content>',
    '<% } %>',
    '</xml>'].join('');

/*!
 * Compiled Template
 */
var compiled = ejs.compile(tpl);

/*!
 * Extract XML from what weixin committed.
 */
var getMessage = function (stream, callback) {
    var buf = new BufferHelper();
    buf.load(stream, function (err, buf) {
        if (err) {
            return callback(err);
        }
        var xml = buf.toString('utf-8');
        xml2js.parseString(xml, {trim: true}, callback);
    });
};

/*!
 * Check whether an object is empty. A workaround for xml2js
 */
var isEmpty = function (thing) {
    return typeof thing === "object" && (thing !== null) && Object.keys(thing).length === 0;
};

/*!
 * Convert what xml2js parsed out to object we can access directly.
 */
var formatMessage = function (result) {
    var message = {};
    for (var key in result.xml) {
        var val = result.xml[key][0];
        message[key] = (isEmpty(val) ? '' : val).trim();
    }
    return message;
};

/*!
 * Reply content to weixin.
 */
var reply = function (content, fromUsername, toUsername) {
    var info = {};
    var type = 'text';
    info.content = content || '';
    if (Array.isArray(content)) {
        type = 'news';
    } else if (typeof content === 'object') {
        if (content.hasOwnProperty('type')) {
            type = content.type;
            info.content = content.content;
        } else {
            type = 'music';
        }
    } else {
        type = 'text';
    }
    info.msgType = type;
    info.createTime = new Date().getTime();
    info.toUsername = toUsername;
    info.fromUsername = fromUsername;
    return compiled(info);
};

var respond = function (handler) {
    return function (req, res, next) {
        getMessage(req, function (err, result) {
            if (err) {
                err.name = 'BadMessage' + err.name;
                return next(err);
            }
            var message = formatMessage(result);
            var callback = handler.getHandler(message.MsgType);
            req.weixin = message;
            res.reply = function (content) {
                res.writeHead(200);
                res.end(reply(content, message.ToUserName, message.FromUserName));
            };

            var done = function () {
                // 兼容旧API
                if (handler.handle) {
                    callback(req, res, next);
                } else {
                    callback(message, req, res, next);
                }
            };

            if (req.sessionStore) {
                var storage = req.sessionStore;
                var _end = res.end;
                var openid = message.FromUserName + ':' + message.ToUserName;

                res.end = function () {
                    _end.apply(res, arguments);
                    if (req.wxsession) {
                        req.wxsession.save();
                    }
                };

                storage.get(openid, function (err, session) {
                    if (!session) {
                        req.wxsession = new Session(openid, req);
                        req.wxsession.cookie = req.session.cookie;
                    } else {
                        req.wxsession = new Session(openid, req, session);
                    }
                    done();
                });
            } else {
                done();
            }
        });
    };
};

/**
 * 微信自动回复平台的内部的Handler对象
 * @param {String} token 口令
 * @param {Function} handle handle对象
 */
var Handler = function (token, handle) {
    this.token = token;
    this.handlers = {};
    this.handle = handle;
};

/**
 * 设置handler对象
 * 按消息设置handler对象的快捷方式
 *
 * - `text(fn)`
 * - `image(fn)`
 * - `voice(fn)`
 * - `video(fn)`
 * - `location(fn)`
 * - `link(fn)`
 * - `event(fn)`
 * @param {String} type handler处理的消息类型
 * @param {Function} handle handle对象
 */
Handler.prototype.setHandler = function (type, fn) {
    this.handlers[type] = fn;
    return this;
};

['text', 'image', 'voice', 'video', 'location', 'link', 'event'].forEach(function (method) {
    Handler.prototype[method] = function (fn) {
        return this.setHandler(method, fn);
    };
});

/**
 * 根据消息类型取出handler对象
 * @param {String} type 消息类型
 */
Handler.prototype.getHandler = function (type) {
    return this.handle || this.handlers[type] || function (info, req, res, next) {
        next();
    };
};

/**
 * 根据Handler对象生成响应方法，并最终生成中间件函数
 */
Handler.prototype.middlewarify = function () {
    var token = this.token;
    var _respond = respond(this);
    return function (req, res, next) {
        if (req.weixin_token) {
            if (!checkSignature(req.query, req.weixin_token)) {
                res.writeHead(401);
                res.end('Invalid signature');
                return;
            }
            var method = req.method;
            if (method === 'GET') {
                res.writeHead(200);
                res.end(req.query.echostr);
            } else if (method === 'POST') {
                _respond(req, res, next);
            } else {
                res.writeHead(501);
                res.end('Not Implemented');
            }
        }
        else {
            token(req.params[0], function(err, result){
                if (err) {
                    res.writeHead(401);
                    res.end('Invalid incar wx service account');
                }
                else {
                    var wxServiceToken = result.wxServiceToken;

                    if (wxServiceToken === null) {
                        res.writeHead(401);
                        res.end('Invalid incar wx service account');
                        return;
                    }
                    else if (wxServiceToken === 0) {
                        res.writeHead(401);
                        res.end('Valid incar wx service account, but not in service');
                        return;
                    }

                    if (!checkSignature(req.query, wxServiceToken)) {
                        res.writeHead(401);
                        res.end('Invalid signature from tencent');
                        return;
                    }

                    var method = req.method;
                    if (method === 'GET') {
                        res.writeHead(200);
                        res.end(req.query.echostr);
                    } else if (method === 'POST') {
                        _respond(req, res, next);
                    } else {
                        res.writeHead(501);
                        res.end('Not Implemented');
                    }
                }
            });
        }
    };
};

/**
 * 根据口令
 *
 * Examples:
 * 使用weixin作为自动回复中间件的三种方式
 * ```
 * weixin(token, function (req, res, next) {});
 *
 * weixin(token, weixin.text(function (message, req, res, next) {
 *   // TODO
 * }).location(function (message, req, res, next) {
 *   // TODO
 * }));
 *
 * weixin(token)
 *   .text(function (message, req, res, next) {
 *     // TODO
 *   }).location(function (message, req, res, next) {
 *    // TODO
 *   }).middleware();
 * ```
 * 静态方法
 *
 * - `text`，处理文字推送的回调函数，接受参数为(text, req, res, next)。
 * - `image`，处理图片推送的回调函数，接受参数为(image, req, res, next)。
 * - `voice`，处理声音推送的回调函数，接受参数为(voice, req, res, next)。
 * - `video`，处理视频推送的回调函数，接受参数为(video, req, res, next)。
 * - `location`，处理位置推送的回调函数，接受参数为(location, req, res, next)。
 * - `link`，处理链接推送的回调函数，接受参数为(link, req, res, next)。
 * - `event`，处理事件推送的回调函数，接受参数为(event, req, res, next)。
 * @param {String} token 在微信平台填写的口令
 * @param {Function} handle 生成的回调函数，参见示例
 */
var middleware = function (token, handle) {
    if (arguments.length === 1) {
        return new Handler(token);
    }

    if (arguments.length === 2) {
        if (handle instanceof Handler) {
            handle.token = token;
            return handle.middlewarify();
        } else {
            return new Handler(token, handle).middlewarify();
        }
    }
};

['text', 'image', 'voice', 'video', 'location', 'link', 'event'].forEach(function (method) {
    middleware[method] = function (fn) {
        return (new Handler())[method](fn);
    };
});

module.exports = middleware;
module.exports.toXML = compiled;
module.exports.reply = reply;
