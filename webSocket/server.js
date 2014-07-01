var app = require('express')()
    , server = require('http').createServer(app)
    , io = require('socket.io').listen(server);

server.listen(80);

/*
app.get('/carInfo/:obdCode', function (req, res) {
    var obdCode=req.params['obdCode'];
    console.log(obdCode);
    res.json({status:'success'});
});
*/

io.sockets.on('connection', function (socket) {
    console.log('connection');
    socket.on('getCarInfo',function(data){
        console.log(data);
    });
});