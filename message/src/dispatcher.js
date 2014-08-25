/**
 * Created by LM on 14-3-15.
 */
'use strict'

var http = require("http");
var dataManager = require('./dataManager');
var message=require('./message');



//1621取得车辆当前检测数据
function send1621(sim,cb){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1621);
    message.send(dataManager.getBuffer(),cb);
}
//1623设置OBD相关信息，传入{id1:val1,id2:val2},ID来源4.01
function send1623(sim,obdInfo,cb){
    dataManager.init(new Buffer(1024),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1623);
    dataManager.writeByte(Object.keys(obdInfo).length);
    for(var key in obdInfo){
        var numKey=parseInt(key);
        dataManager.writeWord(numKey);
        dataManager.writeString(obdInfo[key]);
    }
    message.send(dataManager.getBuffer(),cb);
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
    var callBack=function(info){
        res.json(info);
    }
    switch(cmd){
        case 0x1621:
            send1621(sim,callBack);
            return;
        case 0x1622:
            var idArray=body['idArray'];
            send1622(sim,idArray);
            break;
        case 0x1623:
            var obdInfo=body['obdInfo'];
            send1623(sim,obdInfo,callBack);
            return;
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

/*

function receive1621(dataBuffer){
    dataManager.init(dataBuffer,2);
    //1、获得报文内容
    var obdCode=dataManager.nextString();           //OBD编号
    var tripId=dataManager.nextDoubleWord();        //Trip编号
    var vid=dataManager.nextString();               //vid
    var vin=dataManager.nextString();               //VIN码
    var faultLevel=dataManager.nextByte();          //故障等级
    var faultCount=dataManager.nextByte();          //故障个数
    var fault=[];
    for(var i=0;i<faultCount;i++){
        var code=dataManager.nextString();             //故障码
        var status=dataManager.nextString();           //故障码属性
        var desc=dataManager.nextString();             //故障码描述
        fault.push({code:code,status:status,desc:desc});
    }
    return {
        obdCode:obdCode,
        tripId:tripId,
        vid:vid,
        vin:vin,
        faultLevel:faultLevel,
        fault:fault
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
}*/
