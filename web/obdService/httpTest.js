/**
 * Created by LM on 14-6-6.
 */
'use strict'

var http = require("http");
var dataSet = JSON.stringify({
    carId:8,
    tags:'546,557'
});
var data=dataSet;
var opt = {
    method: "get",
    host: "localhost",
    port: 80,
    path: "/alarm/1?remindStatus=1&page=2&pageSize=5",
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