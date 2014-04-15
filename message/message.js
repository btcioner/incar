/**
 * Created by LM on 14-3-15.
 */
var net = require('net');
var server = net.createServer();
function toString0X(dataBuffer){
    var dataString="";
    for(var i=0;i<dataBuffer.length;i++){
        var intVal=dataBuffer.readUInt8(i);
        if(intVal<0x10){
            dataString+="0"+intVal+" ";
        }
        else{
            dataString+=intVal.toString(16).toUpperCase()+" ";
        }
    }
    return dataString;

};

var sp = require('serialport');

var SerialPort = sp.SerialPort;
var serialPort = new SerialPort("COM4", {
    baudrate: 9600,
    databits: 8,
    parity: 'none',
    stopbits: 1
}, false);
serialPort.open(function() {
    console.log("端口打开");
});
var spInUse=false;
var msgQueue=new Array();
function sendToSerialPort(){
    if(msgQueue.length==0)return;
    if(spInUse==false){
        spInUse=true;
        var data=msgQueue[0];
        serialPort.write(data, function(err, results) {
            if (err) {
                console.log('err ' + err + '\n');
                return;
            }
            serialPort.drain(function(){
                console.log("写入数据(" + results + '字节)：\n'+data.slice(0,17)+toString0X(data.slice(17,results)));
                spInUse=false;
                msgQueue.splice(0,1);
                if(msgQueue.length>0)sendToSerialPort();
            });
        });
    }
}
server.on('connection', function(socket) {
    console.log('\nmessage server: connection came in and connected. From:: ' + socket.remoteAddress + ':' + socket.remotePort + '\n');

    //绑定数据接收的事件
    socket.on('data', function(data) {
        msgQueue.push(data);
        console.log(msgQueue);
        sendToSerialPort();
    });
    socket.on('end', function() {
        console.log('\nmessage server connection closed. From:: ' + this._peername.address + ':' + this._peername.port + '\n');
    });
});

server.on('close', function() {
    console.log('\nmessage server is closing...\n');
    serialPort.close(function(){
        console.log("端口关闭");
    });
});

server.listen(12345, function() {
    console.log('message server start listenning on port 12345...\n============================================================\n');
});