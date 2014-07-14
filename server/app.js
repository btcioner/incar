'use strict';

var net = require('net');
var packet = require('./src/packet');
var work = require('./src/worker308.js');
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

var server = net.createServer();

server.on('connection', function(socket) {
    var mark=socket.remoteAddress + ':' + socket.remotePort;
    console.log("\n**********************************************************************");
    console.log('OBD('+mark+')：已和服务器建立连接');
    //绑定数据接收的事件
    socket.on('data', function(data) {
        console.log('OBD('+mark+')：开始进行初步解析...');
        console.log('数据包：'+toString0X(data));
        var packetJson = packet.packetResolve(data);
        if(packetJson){
            var version=packetJson.version;
            var content=packetJson.content;
            console.log('OBD('+mark+')：初步解析完成,协议版本'+version+'...');
            if(version===0x02){
                console.log('2.05版本协议，挂起');
            }
            if(version===0x05){
                work.packetProcess(content,mark,function(dataPacketResponse){
                    var responseData=packet.packetBuild(dataPacketResponse,0x05);
                    socket.write(responseData);
                    console.log('OBD('+mark+')：数据包解析完毕，准备回复OBD:');
                    console.log(toString0X(responseData));
                });
            }
        }
        else{
            console.log('OBD('+mark+')：初步解析无法完成，未知的包数据...');
        }
    });

    socket.on('end', function() {
        console.log('OBD('+mark+')：数据流传输完毕');
        console.log("**********************************************************************\n");
    });
    socket.on('error',function(err){
        console.log('OBD('+mark+')：出现错误：'+err);
        server.close();
        throw err;
    });
});

server.listen(9005, function() {
    console.log('服务启动，开始监听9005端口\n============================================================');
});