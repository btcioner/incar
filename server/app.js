/**
 * Created by Jesse on 2/25/14.
 */

'use strict';

var net = require('net');
var packet = require('./src/packet');
var workerProcessMgr = require('child_process');
var workerProcess = workerProcessMgr.fork('server/src/worker.js', ['workerProcess']);
console.log('\n');
console.log('Main   process id: ' + process.pid);
console.log('Worker process id: ' + workerProcess.pid);
console.log('\n');

//存放每个Socket连接的数组
var connections = {};

workerProcess.on('message', function(msg) {
    if (msg['type'] === 'response') {
        if (msg.tag && (msg.tag in connections)) {
            connections[msg.tag].write(packet.getPacket(msg.response));
        }
    }
});

var server = net.createServer();

server.on('connection', function(socket) {

    console.log('\nMain process: connection came in and connected. From:: ' + socket.remoteAddress + ':' + socket.remotePort + '\n');

    connections[socket.remoteAddress + ':' + socket.remotePort] = socket;
    //绑定数据接收的事件
    socket.on('data', function(data) {
        var payload = packet.getPayload(data);
        if ( !! payload) {
            //发送消息，将会触发子进程的message事件
            workerProcess.send({
                'type': 'dataPacket',                               //消息类型
                'tag': this.remoteAddress + ':' + this.remotePort,  //消息来源
                'dataPacket': payload                               //消息内容
            });
        }
    });

    socket.on('end', function() {
        console.log('\nMain process: connection closed. From:: ' + this._peername.address + ':' + this._peername.port + '\n');

        if (((this._peername.address + ':' + this._peername.port) in connections)) {
            delete connections[this._peername.address + ':' + this._peername.port];
        }
    });
});

server.on('close', function() {
    console.log('\nMain process(pid: ' + process.pid + ') is closing.\n');
    workerProcess.send({
        'type': 'command',
        'command': 'stop'
    });
});

server.listen(9005, function() {
    console.log('Main process(pid: ' + process.pid + ') is listenning on port 9005...\n============================================================\n');
});