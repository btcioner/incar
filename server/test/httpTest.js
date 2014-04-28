var http = require("http");
var data = {
    openId: 'o1fUut3BkIo8XM6-dddddd',
    sopenId: "gh_895980ee6356",
    name:"柳明",
    phone:"180888666666"
};

data = require('querystring').stringify(data);
console.log(data);
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

var req = http.request(opt, function (serverFeedback) {
});
req.write(data + "\n");
req.end();