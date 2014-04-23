'use strict'

var http = require("http");

var data ={idArray:[0xFE05,0xFE06,0xFE07,0xFE08,0xFE09,0xFE0A,0xFE0B,0xFE0C]};

data = JSON.stringify(data);

var opt = {
    method: "POST",
    host: "localhost",
    port: 80,
    path: "/wservice/message/obdTestSend/WFQ00011755",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
    }
};

var req = http.request(opt, function (serverFeedback) {});

req.write(data);
req.end();