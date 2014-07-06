/**
 * Created by zhoupeng on 14-5-15.
 */
'use strict';

var util = require('util');
var https = require('https');
var db = require('../config/db');

exports = module.exports = function(service) {
    service.post.getOpenid = getOpenid;
}

function getOpenid(req, res) {
    var app_id = req.body.app_id;
    var code = req.body.code;
    if(!app_id){
        res.send(400, 'app_id cannot be found!');
        return;
    }
    if(!code){
        res.send(400, 'code cannot be found!');
        return;
    }

    var pool = db();
    var sql = "SELECT wx_app_secret FROM t_4s WHERE wx_app_id = ?";
    pool.query(sql, [app_id], function(ex, result){
        if(ex){
            res.send(500, ex);
            return;
        }
        if(result.length === 0){
            res.send(404, 'Cannot find the app_id!');
            return;
        }
        if(result.length > 1){
            res.send(500, 'More than one app_id found!');
            return;
        }
        if(!result[0].wx_app_secret){
            res.send(404, 'Cannot find the app_secret!');
            return;
        }

        var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code';
        util.format(url, req.body.app_id, result[0].wx_app_secret, code);
        https.get(url, function(res2){
            console.log(res2.statusCode);
            res2.on('data', function(data){
                console.log(data);
                res.send(200, data);
            });
        });
    });
    return;

    var postData = req.body;
    var code=postData.code;
    var myurl=postData.url;

    var http=require('./nodegrass');
    http.get(myurl, function(data) {

             console.log(data);
            //process.stdout.write(d);
               res.send(data);
        });
    }




