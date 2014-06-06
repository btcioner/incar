/**
 * Created by LM on 14-3-15.
 */
'use strict'

var http = require("http");
var dataManager = require('./dataManager');
var message=require('./message');
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
        var faultCode=[];
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
        var interval=[];
        for(i=0;i<dataManager.nextByte();i++){
            interval.push(dataManager.nextWord());
        }
        return interval;
    }
    if(id===0xFE15){
        var voltage=[];
        for(i=0;i<dataManager.nextWord();i++){
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
        for(i=0;i<value.length;i++){
            dataManager.writeByte(value[i]);
        }
        return;
    }
    dataManager.writeString(value);
}

function receive1621(dataBuffer){
    dataManager.init(dataBuffer,2);
    //1、获得报文内容
    var obdCode=dataManager.nextString();               //OBD编号
    var vin=dataManager.nextString();                   //VIN码
    var brand=dataManager.nextByte();                   //品牌
    var series=dataManager.nextByte();                  //系列
    var modelYear=dataManager.nextByte();               //年款

    var content=[];
    var contentCount=dataManager.nextWord();
    for(var i=0;i<contentCount;i++){
        var id=dataManager.nextWord();                  //ID
        var value=getValueByID(id);
        content.push({id:id,value:value});
    }
    return {
        obdCode:obdCode,
        vin:vin,
        brand:brand,
        series:series,
        modelYear:modelYear,
        content:content
    };
}
function receive1625(dataBuffer){
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
    return {
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
}
//1622获得OBD相关信息，传入[id1,id2]返回{id1:val1,id2:val2},ID来源4.01以及4.02
function send1622(sim,idArray){
    dataManager.init(new Buffer(1024),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1622);
    dataManager.writeWord(idArray.length);
    for(var i=0;i<idArray.length;i++){
        dataManager.writeWord(idArray[i]);
    }
    message.send(dataManager.getBuffer());
}
//1623设置OBD相关信息，传入{id1:val1,id2:val2},ID来源4.01
function send1623(sim,obdInfo){
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
    message.send(dataManager.getBuffer());
}
//1624清空累计平均油耗
function send1624(sim){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1624);
    message.send(dataManager.getBuffer());
}
//1625获得OBD版本信息
function send1625(sim){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1625);
    message.send(dataManager.getBuffer());
}
//1626清除故障码
function send1626(sim){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1626);
    message.send(dataManager.getBuffer());
}
//16E0还原出厂设置
function send16E0(sim){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x16E0);
    message.send(dataManager.getBuffer());
}


//接收Web端发送短信的请求并完成短信发送
exports.receiveMessageRequest=function(req,res){
    var param=req.params;
    var sim=param.sim;
    var cmd=parseInt(param.cmd);
    var body=req.body;
    console.log(body);
    var back={status:'success'};
    switch(cmd){
        case 0x1622:
            var idArray=body['idArray'];
            send1622(sim,idArray);
            break;
        case 0x1623:
            var obdInfo=body['obdInfo'];
            send1623(sim,obdInfo);
            break;
        case 0x1624:
            send1624(sim);
            break;
        case 0x1625:
            send1625(sim);
            break;
        case 0x1626:
            send1626(sim);
            break;
        case 0x16E0:
            send16E0(sim);
            break;
    }
    res.send(back);
};
//接收OBD数据端短信数据的回复并转给Web端
exports.receiveMessageResponse=function(req,res){
    var returnJson={};
    var commandWord=parseInt(req.params.cmd);
    var data=req.body.dataString;
    var bf=new Buffer(data);
    switch (commandWord) {
        case 0x1621:
            returnJson = receive1621(bf);
            break;
        case 0x1625:
            returnJson = receive1625(bf);
            break;
    }
    console.log(returnJson);
    var dataJson={dataString:returnJson};
    var opt = {
        method: "POST",
        host: "localhost",
        port: 80,
        path: "/wservice/message/obdTestReceive/"+returnJson.obdCode,
        headers: {
            "Content-Type": "application/json",
            "Content-Length":Buffer.byteLength(JSON.stringify(dataJson))
        }
    };
    var req = http.request(opt, function (serverFeedback) {});
    req.write(JSON.stringify(dataJson));
    req.end();
};