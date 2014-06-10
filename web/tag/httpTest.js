/**
 * Created by LM on 14-6-6.
 */
'use strict'

var http = require("http");
var dataSet = JSON.stringify({
    tags:'545,546'
});
var data=dataSet;
var opt = {
    method: "GET",
    host: "localhost",
    port: 80,
    path: "/tag/searchByTags/aqweqweqw",
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