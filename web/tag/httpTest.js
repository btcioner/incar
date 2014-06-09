/**
 * Created by LM on 14-6-6.
 */
'use strict'

var http = require("http");
var dataSet = JSON.stringify({
    s4Id:1,
    groupId:8,
    tagName:'店长亲戚',
    description:'你懂的',
    code:'cus2',
    active:1,
    createTime:new Date(),
    creator:'僵梨'
});
var data=dataSet;
var opt = {
    method: "POST",
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

req.write(data);
req.end();