var http = require("http");
var data ={idArray:'0xFE05,0xFE06,0xFE07,0xFE08,0xFE09,0xFE0A,0xFE0B,0xFE0C'};
data = require('querystring').stringify(data);
console.log(data);
var opt = {
    method: "post",
    host: "localhost",
    port: 1234,
    path: "/message/send/18086620891/5665"
};

var req = http.request(opt, function (serverFeedback) {
});
req.write(data);
req.end();