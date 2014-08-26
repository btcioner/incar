/**
 * Created by LM on 14-8-26.
 */
var sp = require('serialport');
var dataManager = require('./src/dataManager');
var SerialPort = sp.SerialPort;
var serialPort = new SerialPort("COM4", {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1
}, false);
serialPort.open(function() {
    console.log("端口打开");
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS18086620891#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1621);
    var data=dataManager.getBuffer();
    serialPort.write(data, function(err, results) {
        if(err){
            console.log(err + '\n');
        }
        serialPort.drain(function(){
            console.log("写入数据(" + results + '字节)：\n'+data.slice(0,17)+toString0X(data.slice(17,results)));
        });
    });
});
function toString0X(dataBuffer){
    var dataString='';
    for(var i=0;i<dataBuffer.length;i++){
        var intVal=dataBuffer.readUInt8(i);
        if(intVal<0x10){
            dataString+='0'+intVal+' ';
        }
        else{
            dataString+=intVal.toString(16).toUpperCase()+" ";
        }
    }
    return dataString;
}