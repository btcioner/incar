/**
 * Created by LM on 14-6-6.
 */
'use strict'
var http = require("http");
var dataSet = JSON.stringify({
    s4Id:1,
    groupId:8,
    tagName:'自定义测试标签',
    description:'',
    active:1,
    creator:'柳明'
});
var data=dataSet;
var opt = {
    method: "post",
    host: "localhost",
    port: 80,
    path: "/tag/addTag",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
    }
};

var req = http.request(opt, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    });
});
req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});
req.write(data);
req.end();