var http = require("http");
var data = 'AA 55 00 49 FF B6 00 05 16 03 49 4E 43 41 52 30 30 30 31 00 00 00 01 82 00 57 30 4C 30 5A 43 46 36 39 33 31 30 38 33 39 31 41 00 56 32 31 2E 32 30 2E 30 30 00 56 30 2E 30 30 2E 30 30 00 56 33 2E 31 33 2E 31 33 00 FF 00 0E F1';

data = require('querystring').stringify(data);

var opt = {
    method: "put",
    host: "localhost",
    port: 80,
    path: "/wservice/obd/work/wx",
    headers: {
        "Content-Type": 'application/x-www-form-urlencoded',
        "Content-Length": data.length
    }
};

var req = http.request(opt, function (res) {
    res.on("data",function(info){
        console.log(JSON.stringify(info));
    });
});
req.write(data);
req.end();