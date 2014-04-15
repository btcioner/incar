/**
 * Created by LM on 14-3-15.
 */
var net = require('net');
var server = net.createServer();
var dataManager = require('./dataManager');
var callbackMapping={};
function sendMessage(data){
    var client=net.connect({host:'127.0.0.1',port: 12345},function() {
        console.log('client connected');
        client.write(data);
        client.end();
    });
}

server.on('connection', function(socket) {
    console.log('\nmessage server: connection came in and connected. From:: ' + socket.remoteAddress + ':' + socket.remotePort + '\n');

    //绑定数据接收的事件
    socket.on('data', function(data) {
        var dataBuffer = null;
        if (Buffer.isBuffer(data))
            dataBuffer = data;
        else
            dataBuffer = new Buffer(data);
        var returnJson = undefined;
        var commandWord = dataBuffer.readUInt16BE(0);
        switch (commandWord) {
            case 0x1621:
                returnJson = packetProcess_1621(dataBuffer);
                break;
            case 0x1625:
                returnJson = packetProcess_1625(dataBuffer);
                break;
        }
        var cb=callbackMapping[returnJson.obdCode];
        if(cb){
            cb(returnJson);
            callbackMapping.delete(returnJson.obdCode);
        }
    });

    socket.on('end', function() {
        console.log('\nmessage server connection closed. From:: ' + this._peername.address + ':' + this._peername.port + '\n');
    });
});

server.on('close', function() {
    console.log('\nmessage server is closing...\n');
});

server.listen(54321, function() {
    console.log('message server start listenning on port 54321...\n============================================================\n');
});
var byteCmd=[0xFE01,0xFE04,0xFE16,0xFE17,0xFE19];
var wordCmd=[0xFE06,0xFE08,0xFE0A,0xFE0C,0xFE0D,0xFE0E,0xFE0F,0xFE11,0xFE12,0xFE1A];
var longCmd=[0xFE03,0xFE14];
function getValueByID(id){
    if(wordCmd.indexOf(id)>=0){
        return dataManager.nextWord();
    }
    if(byteCmd.indexOf(id)>=0){
        return dataManager.nextByte();
    }
    if(longCmd.indexOf(id)>=0){
        return dataManager.nextLong();
    }
    if(id===0xFE00){
        var faultCode=new Array();
        var fcCount=dataManager.nextByte();               //故障码个数
        for(var i=0;i<fcCount;i++){
            var code=dataManager.nextString();             //故障码
            var status=dataManager.nextString();           //故障码属性
            var desc=dataManager.nextString();             //故障码描述
            faultCode.push({code:code,status:status,desc:desc});
        }
        return faultCode;
    }
    if(id===0xFE10){
        var interval=new Array();
        for(var i=0;i<dataManager.nextByte();i++){
            interval.push(dataManager.nextWord());
        }
        return interval;
    }
    if(id===0xFE15){
        var voltage=new Array();
        for(var i=0;i<dataManager.nextWord();i++){
            voltage.push(dataManager.nextByte());
        }
        return voltage;
    }
    return dataManager.nextString();
}
function setValueByID(id,value){
    if(id<0xFE03||id==0xFE13||id==0xFE14||id>0xFE1A)return;

    if(wordCmd.indexOf(id)>=0){
        dataManager.writeWord(value);
        return;
    }
    console.log(id+"-"+byteCmd+"\n"+byteCmd.indexOf(id));
    if(byteCmd.indexOf(id)>=0){

        dataManager.writeByte(value);
        return;
    }
    if(longCmd.indexOf(id)>=0){
        dataManager.writeLong(value);
        return;
    }
    if(id===0xFE10){
        dataManager.writeByte(value.length);
        for(var i=0;i<value.length;i++){
            dataManager.writeWord(value[i]);
        }
        return;
    }
    if(id===0xFE15){
        dataManager.writeWord(value.length);
        for(var i=0;i<value.length;i++){
            dataManager.writeByte(value[i]);
        }
        return;
    }
    dataManager.writeString(value);
}
function packetProcess_1621(dataBuffer){
    dataManager.init(dataBuffer,2);
    //1、获得报文内容
    var obdCode=dataManager.nextString();               //OBD编号
    var vin=dataManager.nextString();                   //VIN码
    var brand=dataManager.nextByte();                   //品牌
    var series=dataManager.nextByte();                  //系列
    var modelYear=dataManager.nextByte();               //年款

    var content=new Array();
    var contentCount=dataManager.nextWord();
    for(var i=0;i<contentCount;i++){
        var id=dataManager.nextWord();                  //ID
        var value=getValueByID(id);
        content.push({id:id,value:value});
    }
    var json1621={
        obdCode:obdCode,
        vin:vin,
        brand:brand,
        series:series,
        modelYear:modelYear,
        content:content
    };
    return json1621;
}
function packetProcess_1625(dataBuffer){
    dataManager.init(dataBuffer,2);
    //1、获得报文内容
    var obdCode=dataManager.nextString();               //OBD编号
    var vin=dataManager.nextString();                   //VIN码
    var brand=dataManager.nextByte();                   //品牌
    var series=dataManager.nextByte();                  //系列
    var modelYear=dataManager.nextByte();               //年款
    var hardwareVersion=dataManager.nextString();       //硬件版本号
    var firmwareVersion=dataManager.nextString();       //固件版本号
    var softwareVersion=dataManager.nextString();       //软件版本号
    var softType=dataManager.nextByte();                //软件类别
    var json1625={
        obdCode:obdCode,
        vin:vin,
        brand:brand,
        series:series,
        modelYear:modelYear,
        hardwareVersion:hardwareVersion,
        firmwareVersion:firmwareVersion,
        softwareVersion:softwareVersion,
        softType:softType
    };
    return json1625;
}




//1622获得OBD相关信息，传入[id1,id2]返回{id1:val1,id2:val2},ID来源4.01以及4.02
exports.getOBDRuntime=function(obdCode,sim,idArray,cb){
    dataManager.init(new Buffer(1024),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1622);
    dataManager.writeWord(idArray.length);
    for(var i=0;i<idArray.length;i++){
        dataManager.writeWord(idArray[i]);
    }
    callbackMapping[obdCode]=cb;
    sendMessage(dataManager.getBuffer());
};
//1623设置OBD相关信息，传入{id1:val1,id2:val2},ID来源4.01
exports.setOBDInfo=function(obdCode,sim,obdInfo){
    dataManager.init(new Buffer(1024),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1623);
    dataManager.writeByte(Object.keys(obdInfo).length);
    for(var key in obdInfo){
        var numKey=parseInt(key);
        dataManager.writeWord(numKey);
        setValueByID(numKey,obdInfo[key]);
    }
    sendMessage(dataManager.getBuffer());
};
//1624清空累计平均油耗
exports.clearAvgOilUsed=function(obdCode,sim,cb){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1624);
    callbackMapping[obdCode]=cb;
    sendMessage(dataManager.getBuffer());
};
//1625获得OBD版本信息
exports.getOBDVersionInfo=function(obdCode,sim,cb){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1625);
    callbackMapping[obdCode]=cb;
    sendMessage(dataManager.getBuffer());
};
//1626清除故障码
exports.clearFaultCode=function(obdCode,sim,cb){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1626);
    callbackMapping[obdCode]=cb;
    sendMessage(dataManager.getBuffer());
};
//16E0还原出厂设置
exports.resetDefault=function(obdCode,sim,cb){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x16E0);
    callbackMapping[obdCode]=cb;
    sendMessage(dataManager.getBuffer());
};