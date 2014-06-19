'use strict'

var http = require("http");
var dataSet = JSON.stringify({obdInfo:{
    0xFE05:'115.28.106.117',
    0xFE06:9005,
    0xFE07:'115.28.106.117',
    0xFE08:9005,
    0xFE09:'115.28.106.117',
    0xFE0A:9005,
    0xFE0B:'115.28.106.117',
    0xFE0C:9005,
    0xFE1C:'115.28.106.117',
    0xFE1D:9005
}});
var dataGet = JSON.stringify({obdInfo:{
    0xFE05:'lahmyyc2014.vicp.cc',
    0xFE06:48928,
    0xFE07:'lahmyyc2014.vicp.cc',
    0xFE08:48928,
    0xFE09:'lahmyyc2014.vicp.cc',
    0xFE0A:48928,
    0xFE0B:'lahmyyc2014.vicp.cc',
    0xFE0C:48928,
    0xFE1C:'lahmyyc2014.vicp.cc',
    0xFE1D:48928
}});
var data='';
//13871574583
//18476363151 深圳
//13427778006 深圳
//13007196492
var opt = {
    method: "POST",
    host: "localhost",
    port: 1234,
    path: "/message/send/13427778006/"+0x1621,
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
    }
};

var req = http.request(opt, function (serverFeedback) {
    console.log(111);
});

req.write(data);
req.end();