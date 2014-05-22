/**
 * Created by Jesse on 2/25/14.
 */

'use strict';

var net = require('net');
var packet = require('./src/packet');
var workerProcessMgr = require('child_process');
var workerProcess205 = workerProcessMgr.fork('server/src/worker205.js', ['worker205Process']);
var workerProcess308 = workerProcessMgr.fork('server/src/worker308.js', ['worker308Process']);
console.log('主进程初始化完成：: ' + process.pid);
var toString0X=function(dataBuffer){
    var dataString="";
    for(var i=0;i<dataBuffer.length;i++){
        var intVal=dataBuffer.readUInt8(i);
        if(intVal<0x10){
            dataString+="0"+intVal.toString(16).toUpperCase()+" ";
        }
        else{
            dataString+=intVal.toString(16).toUpperCase()+" ";
        }
    }
    return dataString;

};
//存放每个Socket连接的数组
var connections = {};

workerProcess205.on('message', function(msg) {
    if (msg['type'] === 'response') {
        if (msg.tag && (msg.tag in connections)) {
            var responsePacket=packet.packetBuild(msg.response,0x02);
            connections[msg.tag].write(responsePacket);
            console.log('Work205(' + workerProcess205.pid + '):数据包解析完毕，准备回复OBD:');
            console.log(toString0X(responsePacket));
        }
    }
});
workerProcess308.on('message', function(msg) {
    if (msg['type'] === 'response') {
        if (msg.tag && (msg.tag in connections)) {
            var responsePacket=packet.packetBuild(msg.response,0x05);
            connections[msg.tag].write(responsePacket);
            console.log('Work308(' + workerProcess308.pid + '):数据包解析完毕，准备回复OBD:');
            console.log(toString0X(responsePacket));
        }
    }
});

var server = net.createServer();

server.on('connection', function(socket) {
    var mark=socket.remoteAddress + ':' + socket.remotePort;
    console.log("\n**********************************************************************\n");
    console.log('Main:OBD('+mark+')：已和服务器建立连接');
    connections[mark] = socket;
    //绑定数据接收的事件
    socket.on('data', function(data) {
        console.log('Main:OBD('+mark+')：开始进行初步解析...');
        console.log('数据包：'+toString0X(data));
        var packetJson = packet.packetResolve(data);
        if(packetJson){
            var version=packetJson.version;
            var content=packetJson.content;
            if ( !! content) {
                console.log('Main:OBD('+mark+')：初步解析完成,协议版本'+version+'...');
                //发送消息，将会触发子进程的message事件
                if(version===0x02){
                    workerProcess205.send({
                        'type': 'dataPacket',                               //消息类型
                        'tag': this.remoteAddress + ':' + this.remotePort,  //消息来源
                        'dataPacket': content                               //消息内容
                    });
                }
                if(version===0x05){
                    workerProcess308.send({
                        'type': 'dataPacket',                               //消息类型
                        'tag': this.remoteAddress + ':' + this.remotePort,  //消息来源
                        'dataPacket': content                               //消息内容
                    });
                }
            }
        }
        else{
            console.log('Main:OBD('+mark+')：初步解析无法完成，未知的包数据...');
        }
    });

    socket.on('end', function() {
        console.log('Main:OBD数据流传输完毕：' + this._peername.address + ':' + this._peername.port);

        if (((this._peername.address + ':' + this._peername.port) in connections)) {
            delete connections[this._peername.address + ':' + this._peername.port];
        }
    });
});

server.on('close', function() {
    console.log('Main:主进程' + process.pid + '已关闭.');
    workerProcess205.send({
        'type': 'command',
        'command': 'stop'
    });
    workerProcess308.send({
        'type': 'command',
        'command': 'stop'
    });
});

server.listen(9005, function() {
    console.log('Main:主进程' + process.pid + '开始监听9005端口\n============================================================');
});
process.on('uncaughtException', function (err) {
    console.error(err.stack);
});