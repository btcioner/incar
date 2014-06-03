'use strict'

var http = require("http");

var data ={nickName:'周'};

data = JSON.stringify(data);

var opt = {
    method: "GET",
    host: "localhost",
    port: 80,
    path: "/tag/searchForUsers",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
    }
};

var req = http.request(opt, function (serverFeedback) {});

req.write(data);
req.end();