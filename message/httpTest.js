'use strict'

var http = require("http");
var dataSet = JSON.stringify({obdInfo:{
    0xFE05:'lahmyyc2014.vicp.cc',
    0xFE06:48928
}});
var dataGet = JSON.stringify({obdInfo:{
    0xFE05:'lahmyyc2014.vicp.cc',
    0xFE06:48928
}});
var data=dataSet;
var opt = {
    method: "POST",
    host: "localhost",
    port: 1234,
    path: "/message/send/13007196492/"+0x1623,
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
    }
};

var req = http.request(opt, function (serverFeedback) {});

req.write(data);
req.end();