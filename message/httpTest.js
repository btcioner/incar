'use strict'

var http = require("http");
var dataSet = JSON.stringify({obdInfo:{
    0xFE05:"lahmyyc2014.vicp.cc",
    0xFE06:48928,
    0xFE07:"lahmyyc2014.vicp.cc",
    0xFE08:48928,
    0xFE09:"lahmyyc2014.vicp.cc",
    0xFE0A:48928,
    0xFE0B:"lahmyyc2014.vicp.cc",
    0xFE0C:48928
}});
var dataGet = JSON.stringify({idArray:[0xFE05,0xFE06,0xFE07,0xFE08,
    0xFE09,0xFE0A,0xFE0B,0xFE0C,0xFE1C,0xFE1D]});
var data=dataGet;
// 15827289341  000001
// 15827149392  000002
// 13871574583  000003
// 15827078410  000004
// 15827205365  000005
// 13871412186  短信
var opt = {
    method: "POST",
    host: "localhost",
    port: 1234,
    path: "/message/send/15827205365/"+0x1622,
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