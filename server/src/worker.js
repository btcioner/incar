/**
 * Created by Jesse Qu on 2/25/14.
 */

'use strict';

var dao = require('../core/dao');
var dataManager = require('../core/dataManager');
var http = require("http");

function sendToMessageServer(dataBuffer,obdCode){
    console.log("接收到短信回复：\n");
    console.log(dataBuffer);
    var dataJson={"dataString":dataBuffer};
    var opt = {
        method: "POST",
        host: "localhost",
        port: 80,
        path: "/wservice/message/obdTestReceive/"+obdCode,
        headers: {
            "Content-Type": "application/json",
            "Content-Length":dataJson.length
        }
    };
    var req = http.request(opt, function (serverFeedback) {});
    req.write(JSON.stringify(dataJson));
    req.end();
}

/**
 * Main application file
 */

console.log('\n---- WORKER PROCESS:: child process id: ' + process.pid + '\n');

// Default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


// Bind process IPC events
process.on('message', function(msg, objectHandle) {
    var dataBuffer = new Buffer(msg.dataPacket);



    if (msg['type'] === 'command') {
        if (msg.command == 'stop') {
            console.log('---- WORKER PROCESS:: pid: ' + process.pid + ' exiting ...\n');
            process.exit();
        }
    }
    if (msg['type'] === 'dataPacket') {
        console.log('---- WORKER PROCESS:: receive data:' + toString0X(dataBuffer) + '\n');

        var dataPacketResponse = packetProcess(msg.dataPacket,msg.tag);

        if ( !! dataPacketResponse) {
            process.send({
                'type': 'response',
                'tag': msg.tag,
                'response': dataPacketResponse
            });
            console.log('---- WORKER PROCESS:: ' + 'response has been sent back.\n');
        } else {
            console.log('---- WORKER PROCESS:: no responses.\n');
        }
    }
});


/*
 *  Utility functions
 */
function getOBDSuccess(cmd){
    var responseBuffer = new Buffer(16);
    var offset = 0;

    responseBuffer.writeUInt16BE(cmd, offset);
    offset += 2;

    responseBuffer.writeUInt8(0x00, offset);
    offset += 1;

    console.log("---- WORKER PROCESS:: "+cmd+" response length - " + offset);

    return responseBuffer.slice(0, offset);
}
function packetProcess(packetInput,tag) {
    var responseBuffer=null;
    var dataBuffer= dataManager.init(packetInput,0);
    var commandWord = dataManager.nextWord();           //cmd
    var obdCode=dataManager.nextString();               //OBD编号
    switch (commandWord) {
        case 0x1601:
            responseBuffer = packetProcess_1601(dataBuffer);
            break;
        case 0x1602:
            responseBuffer = packetProcess_1602(dataBuffer);
            break;
        case 0x1603:
            responseBuffer = packetProcess_1603(dataBuffer);
            break;
        case 0x1605:
            responseBuffer = packetProcess_1605(dataBuffer);
            break;
    }
    //涉及到OBD短信的反馈一律发送到短信中心进行处理
    if(commandWord>=0x1621){
        sendToMessageServer(dataBuffer,obdCode);
        responseBuffer=getOBDSuccess(commandWord);
    }
    //所有OBD发送过来的数据都会保存进历史表
    if ( !! responseBuffer) {
        dataManager.init(dataBuffer,2);
        //1、获得报文内容
        var vin=dataManager.nextString();                   //VIN码
        var history={};
        history.obdCode=obdCode;
        history.vin=vin;
        history.ipAddress=tag.split(":")[0];
        history.port=tag.split(":")[1];
        history.content=toString0X(dataBuffer);
        history.receiveDate=new Date();
        var sql="insert into t_obd_history set ?";
        dao.executeBySql([sql],[history],function(){
            console.log("成功创建历史信息!");
        });
        console.log('---- WORKER PROCESS:: a 0x' + commandWord.toString(16) + ' packet was processed and answered.');
        return responseBuffer;
    }
}
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
function packetProcess_1601(dataBuffer) {
    dataManager.init(dataBuffer,2);
    //1、获得报文内容
    var obdCode=dataManager.nextString();               //OBD编号
    var vin=dataManager.nextString();                   //VIN码
    var brand=dataManager.nextByte();                   //品牌
    var series=dataManager.nextByte();                  //系列
    var modelYear=dataManager.nextByte();               //年款
    var currentTime=dataManager.nextString();           //当前时间
    currentTime=getDateTimeStamp();                     //由于设备问题先取系统时间(后期去掉)
    var dataType=dataManager.nextByte();                //数据包类型
    //2、如果是发动机启动则创建一条新的行驶信息
    if(dataType===1){
        var obd={};
        obd.obdCode=obdCode;
        obd.vin=vin;
        obd.brand=brand;
        obd.series=series;
        obd.modelYear=modelYear;
        obd.carStatus=1;
        obd.fireTime=currentTime;
        obd.firingVoltage=dataManager.nextString();//点火电压
        var sql="insert into t_obd_drive set ?";
        dao.executeBySql([sql],[obd],function(){
            console.log("成功创建行驶信息:"+JSON.stringify(obd));
        });
    }
    //3、其他情况则更新行驶信息，需要先获取行驶信息的id
    else if(dataType===2){
        //2、获取当前行驶详细信息
        var faultCode=new Array();
        var fcCount=dataManager.nextByte();               //故障码个数
        for(var i=0;i<fcCount;i++){
            var code=dataManager.nextString();             //故障码
            var status=dataManager.nextString();           //故障码属性
            var desc=dataManager.nextString();             //故障码描述
            faultCode.push({code:code,status:status,desc:desc});
        }
        var mileage=dataManager.nextLong();            //累计行驶里程
        var avgOilUsed=parseFloat(dataManager.nextString());           //累计平均耗油
        avgOilUsed=avgOilUsed?avgOilUsed:null;
        var carCondition=new Array();
        var ccCount=dataManager.nextWord();            //车况信息个数
        for(var i=0;i<ccCount;i++){
            var id=dataManager.nextWord();;             //ID
            var value=dataManager.nextString();            //值
            carCondition.push({id:id,value:value});
        }
        var sql="select t.id from t_obd_drive t where t.obdCode=? and t.carStatus<=?";
        dao.findBySql(sql,[obdCode,2],function(rows){
            if(rows.length>0){
                var id=rows[0].id;
                var sql1="update t_obd_drive set ? where id=?";
                var sql2="insert into t_drive_detail set ?";
                var args1=[{carStatus:2},id];
                var args2={
                    obdCode:obdCode,
                    obdDriveId:id,
                    faultCode:JSON.stringify(faultCode),
                    avgOilUsed:avgOilUsed,
                    mileage:mileage,
                    carCondition:JSON.stringify(carCondition),
                    createTime:new Date()
                };
                dao.executeBySql([sql1,sql2],[args1,args2],function(){
                    console.log("车辆行驶详情保存成功:"+JSON.stringify(args2));
                });
            }
            else{
                console.log("车辆行驶信息丢失");
            }
        });
    }
    else if(dataType===3){
        var firingVoltage=dataManager.nextString();          //点火电压
        var runTime=dataManager.nextLong();            //发动机运行时间
        var currentMileage=dataManager.nextLong();      //行驶里程
        var currentAvgOilUsed=parseFloat(dataManager.nextString());  //本次驾驶平均油耗
        currentAvgOilUsed=currentAvgOilUsed?currentAvgOilUsed:null;
        var speedingTime=dataManager.nextLong();        //超速行驶时间(>120km/h)
        var speedUp=dataManager.nextWord();            //急加速次数
        var speedDown=dataManager.nextWord();          //急减速次数
        var sharpTurn=dataManager.nextWord();          //急转弯次数
        var flameVoltage=dataManager.nextString();       //熄火电压
        var avgOilUsed=parseFloat(dataManager.nextString());         //累计平均油耗
        avgOilUsed=avgOilUsed?avgOilUsed:null;
        var mileage=dataManager.nextLong();            //累计行驶里程
        var sql="select t.id from t_obd_drive t where t.obdCode=? and t.carStatus<=?";
        dao.findBySql(sql,[obdCode,3],function(rows){
            if(rows.length>0){
                var id=rows[0].id;
                var sql="update t_obd_drive set ? where id=?";
                var args=[{
                    firingVoltage:firingVoltage,
                    runTime:runTime,
                    currentMileage:currentMileage,
                    currentAvgOilUsed:currentAvgOilUsed,
                    speedingTime:speedingTime,
                    speedUp:speedUp,
                    speedDown:speedDown,
                    sharpTurn:sharpTurn,
                    flameVoltage:flameVoltage,
                    avgOilUsed:avgOilUsed,
                    mileage:mileage,
                    carStatus:3,
                    flameOutTime:currentTime
                },id];
                dao.executeBySql([sql],[args],function(){
                    console.log("车辆熄火信息保存成功:"+JSON.stringify(args));
                });
            }
        });
    }
    else if(dataType===4){
        var voltageAfter=dataManager.nextString();          //熄火后电压
        var sql="select t.id from t_obd_drive t where t.obdCode=? and t.carStatus<=?";
        dao.findBySql(sql,[obdCode,4],function(rows){
            if(rows.length>0){
                var id=rows[0].id;
                var sql="update t_obd_drive set ? where id=?";
                var args=[{
                    voltageAfter:voltageAfter,
                    carStatus:4
                },id];
                dao.executeBySql([sql],[args],function(){
                    console.log("车辆熄火后信息保存成功:"+JSON.stringify(args));
                });
            }
        });
    }
    else{
        console.log("车辆行驶信息丢失");
    }
    var responseBuffer = new Buffer(16);
    var offset = 0;

    responseBuffer.writeUInt16BE(0x1601, offset);
    offset += 2;

    responseBuffer.writeUInt8(0x00, offset);
    offset += 1;

    console.log('---- WORKER PROCESS:: 0x1601 response length - ' + offset);

    return responseBuffer.slice(0, offset);
}
function packetProcess_1602(dataBuffer) {
    dataManager.init(dataBuffer,2);
    //1、获得报文内容
    var obdCode=dataManager.nextString();               //OBD编号
    var vin=dataManager.nextString();                   //VIN码
    var brand=dataManager.nextByte();                   //品牌
    var series=dataManager.nextByte();                  //系列
    var modelYear=dataManager.nextByte();               //年款
    var currentTime=dataManager.nextString();           //当前时间
    currentTime=getDateTimeStamp();                     //由于设备问题先取系统时间(后期去掉)
    var alarmType=dataManager.nextByte();               //报警类型
    var obdAlarm={};
    obdAlarm.obdCode=obdCode;
    obdAlarm.vin=vin;
    obdAlarm.brand=brand;
    obdAlarm.series=series;
    obdAlarm.modelYear=modelYear;
    obdAlarm.createTime=new Date();
    obdAlarm.alarmType=alarmType;
    if(alarmType===1){
        var faultCode={};
        var fcCount=dataManager.nextByte();               //故障码个数
        faultCode.count=fcCount;
        var fcDetail=new Array();
        for(var i=0;i<fcCount;i++){
            var code=dataManager.nextString();             //故障码
            var status=dataManager.nextString();           //故障码属性
            var desc=dataManager.nextString();             //故障码描述
            fcDetail.push({code:code,status:status,desc:desc});
        }
        faultCode.detail=fcDetail;
        obdAlarm.faultCode=JSON.stringify(faultCode);
    }

    var sql="insert into t_obd_alarm set ?";
    dao.executeBySql([sql],[obdAlarm],function(){
        console.log("成功创建报警信息:"+JSON.stringify(obdAlarm));
    });


    var responseBuffer = new Buffer(16);
    var offset = 0;

    responseBuffer.writeUInt16BE(0x1602, offset);
    offset += 2;

    responseBuffer.writeUInt8(0x00, offset);
    offset += 1;

    console.log('---- WORKER PROCESS:: 0x1602 response length - ' + offset);

    return responseBuffer.slice(0, offset);
}

function packetProcess_1603(dataBuffer) {
    dataManager.init(dataBuffer,2);
    //1、根据内容获得OBD编号等信息
    var obdCode=dataManager.nextString();           //OBD编号
    var vin=dataManager.nextString();               //VIN码
    var brand=dataManager.nextByte();               //品牌
    var series=dataManager.nextByte();              //系列
    var modelYear=dataManager.nextByte();           //年款
    /*测试用，肖龙用车*/
    brand=0x0B;
    series=0x33;
    var hardwareVersion=dataManager.nextString();   //硬件版本号
    var firmwareVersion=dataManager.nextString();   //固件版本号
    var softwareVersion=dataManager.nextString();   //软件版本号
    //构建OBD对应的JSON对象，回复给OBD设备的数据来源
    var obd=dao.get1603Default();
    obd.obdCode=obdCode;
    obd.vin=vin;
    obd.hardwareVersion=hardwareVersion;
    obd.firmwareVersion=firmwareVersion;
    obd.softwareVersion=softwareVersion;
    obd.brand=brand;
    obd.series=series;
    obd.modelYear=modelYear;
    obd.createTime=new Date();
    obd.lastUpdateTime=new Date();
    //2、根据OBD编号查询OBD信息，一个JSON对象
    var sql="select * from t_obd_info t where t.obdCode=?";
    dao.findBySql(sql,obdCode,function(rows) {
        //3、如果找到了则校验传入的OBD信息和数据库中的OBD信息，若不同则更新
        if(rows.length>0){
            var needUpdate=false;
            var obdInfo=rows[0];
            if(vin!==obdInfo.vin)needUpdate=true;
            if(brand!==obdInfo.brand)needUpdate=true;
            if(series!==obdInfo.series)needUpdate=true;
            if(modelYear!==obdInfo.modelYear)needUpdate=true;
            if(hardwareVersion!==obdInfo.hardwareVersion)needUpdate=true;
            if(firmwareVersion!==obdInfo.firmwareVersion)needUpdate=true;
            if(softwareVersion!==obdInfo.softwareVersion)needUpdate=true;
            if(needUpdate){
                var sql="update t_obd_info t set ? where t.obdCode=?";
                var updateArgs=[{
                    vin:vin,
                    brand:brand,
                    series:series,
                    modelYear:modelYear,
                    hardwareVersion:hardwareVersion,
                    firmwareVersion:firmwareVersion,
                    softwareVersion:softwareVersion
                },obdCode];
                dao.executeBySql([sql],[updateArgs],function(err,rows,fields){
                    if(err)throw err;
                    console.log("更新成功:"+JSON.stringify(updateArgs));
                });
            }
            else{
                console.log("不需要更新");
            }
        }
        //4、如果不存在则创建一个新的OBD，并写入默认数据
        else{
            var sql="insert into t_obd_info set ?";
            dao.executeBySql([sql],[obd],function(err,rows,fields){
                if(err)throw err;
                console.log("添加成功:"+JSON.stringify(obd));
            });
        }
    });


    //5、生成要回复的报文内容并返回，回复和数据库操作异步处理
    var responseBuffer = new Buffer(128);
    var offset = 0;
    var lenWritten = 0;
    var timeStamp = '';
    responseBuffer.writeUInt16BE(0x1603, offset);
    offset += 2;
    responseBuffer.writeUInt8(obd.initCode, offset);
    offset += 1;

    responseBuffer.writeUInt8(obd.isCodeClear, offset);
    offset += 1;
    responseBuffer.writeUInt8(obd.brand, offset);
    offset += 1;
    responseBuffer.writeUInt8(obd.series, offset);
    offset += 1;
    responseBuffer.writeUInt8(obd.modelYear, offset);
    offset += 1;
    //----------------------
    lenWritten = responseBuffer.write(obd.addressParam, offset);
    offset += lenWritten;
    responseBuffer.writeUInt8(0x00, offset);
    offset += 1;
    responseBuffer.writeUInt16BE(obd.portParam, offset);
    offset += 2;
    //----------------------
    lenWritten = responseBuffer.write(obd.addressUpload, offset);
    offset += lenWritten;
    responseBuffer.writeUInt8(0x00, offset);
    offset += 1;
    responseBuffer.writeUInt16BE(obd.portUpload, offset);
    offset += 2;
    //----------------------
    lenWritten = responseBuffer.write(obd.addressAlarm, offset);
    offset += lenWritten;
    responseBuffer.writeUInt8(0x00, offset);
    offset += 1;
    responseBuffer.writeUInt16BE(obd.portAlarm, offset);
    offset += 2;
    //----------------------
    lenWritten = responseBuffer.write(obd.addressMessage, offset);
    offset += lenWritten;
    responseBuffer.writeUInt8(0x00, offset);
    offset += 1;
    responseBuffer.writeUInt16BE(obd.portMessage, offset);
    offset += 2;
    responseBuffer.writeUInt16BE(obd.criticalVoltage, offset);
    offset += 2;

    responseBuffer.writeUInt16BE(obd.uploadInterval, offset);
    offset += 2;
    var vtArray=obd.voltageThreshold.split(",");
    responseBuffer.writeUInt16BE(vtArray.length, offset);
    offset += 2;
    for(var i=0;i<vtArray.length;i++){
        responseBuffer.writeUInt8(vtArray[i],offset);
        offset += 1;
    }


    responseBuffer.writeUInt16BE(obd.closeAfterFlameOut, offset);
    offset += 2;

    lenWritten = responseBuffer.write(obd.updateId, offset);
    offset += lenWritten;
    responseBuffer.writeUInt8(0x00, offset);
    offset += 1;

    timeStamp = getDateTimeStamp();
    lenWritten = responseBuffer.write(timeStamp, offset);
    offset += lenWritten;
    responseBuffer.writeUInt8(0x00, offset);
    offset += 1;

    console.log('---- WORKER PROCESS:: 0x1603 response length - ' + offset);

    return responseBuffer.slice(0, offset);
}

function packetProcess_1605(dataBuffer) {

    var responseBuffer = new Buffer(16);
    var offset = 0;

    responseBuffer.writeUInt16BE(0x1605, offset);
    offset += 2;

    responseBuffer.writeUInt8(0x00, offset);
    offset += 1;

    console.log('---- WORKER PROCESS:: 0x1605 response length - ' + offset);

    return responseBuffer.slice(0, offset);
}

function getDateTimeStamp(time) {
    var date = time?time:new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}