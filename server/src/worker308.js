/**
 * Created by Jesse Qu on 2/25/14.
 */

'use strict';

var dao = require('../core/dao');
var dataManager = require('../core/dataManager');
var info401=require('carInfo401')(dataManager);
var http = require("http");

function sendToMessageServer(dataBuffer,commandWord){
    console.log("接收到短信回复："+commandWord+"\n");
    var dataJson={dataString:dataBuffer};
    var opt = {
        method: "POST",
        host: "localhost",
        port: 1234,
        path: "/message/receive/"+commandWord,
        headers: {
            "Content-Type": "application/json",
            "Content-Length":Buffer.byteLength(JSON.stringify(dataJson))
        }
    };
    var req = http.request(opt, function (serverFeedback) {});
    req.write(JSON.stringify(dataJson));
    req.end();
}

/**
 * Main application file
 */

console.log('协议版本3.08的解析进程初始化完成:' + process.pid);


// Default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


// Bind process IPC events
process.on('message', function(msg, objectHandle) {
    var dataBuffer = new Buffer(msg.dataPacket);
    var mark=msg.tag;
    if (msg['type'] === 'command') {
        if (msg.command == 'stop') {
            console.log('Work308(' + process.pid + ')OBD('+mark+'):进程结束...');
            process.exit();
        }
    }
    if (msg['type'] === 'dataPacket') {
        console.log('Work308(' + process.pid + ')OBD('+mark+'):开始解析数据包...');
        packetProcess(msg.dataPacket,msg.tag,function(dataPacketResponse){
            if (!! dataPacketResponse) {
                process.send({
                    'type': 'response',
                    'tag': msg.tag,
                    'response': dataPacketResponse
                });
            } else {
                console.log('Work308(' + process.pid + ')OBD('+mark+'):解析数据包失败...');
            }
        });
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
    return responseBuffer.slice(0, offset);
}
function packetProcess(packetInput,tag,cb) {
    var responseBuffer=null;
    var dataBuffer= dataManager.init(packetInput,0);
    var commandWord = dataManager.nextWord();           //cmd
    var obdCode=dataManager.nextString();               //OBD编号
    switch (commandWord) {
        case 0x1601:
            responseBuffer = packetProcess_1601(dataBuffer);
            if(!!responseBuffer){
                saveToHistory(dataBuffer,tag);
            }
            cb(responseBuffer);
            break;
        case 0x1602:
            responseBuffer = packetProcess_1602(dataBuffer);
            if(!!responseBuffer){
                saveToHistory(dataBuffer,tag);
            }
            cb(responseBuffer);
            break;
        case 0x1603:
            packetProcess_1603(dataBuffer,function(responseBuffer){
                console.log('1603回复：'+toString0X(responseBuffer));
                if(!!responseBuffer){
                    saveToHistory(dataBuffer,tag);
                }
                cb(responseBuffer);
            });
            break;
        case 0x1605:
            responseBuffer = packetProcess_1605(dataBuffer);
            if(!!responseBuffer){
                saveToHistory(dataBuffer,tag);
            }
            cb(responseBuffer);
            break;
    }
    //涉及到OBD短信的反馈一律发送到短信中心进行处理
    if(commandWord>=0x1621&&commandWord<=0x16E0){
        sendToMessageServer(dataBuffer,commandWord);
        responseBuffer=getOBDSuccess(commandWord);
        if(!!responseBuffer){
            saveToHistory(dataBuffer,tag);
        }
        return;
    }
    if(commandWord===0x9502){
        return getOBDSuccess(0x1602);
    }
    return getOBDSuccess(commandWord);
}
//所有OBD发送过来的数据都会保存进历史表
function saveToHistory(dataBuffer,tag){
    dataManager.init(dataBuffer,2);
    //1、获得报文内容
    var obdCode=dataManager.nextString();           //OBD编号
    var tripId=dataManager.nextDoubleWord();        //Trip编号
    var vid=dataManager.nextString();               //vid
    var vin=dataManager.nextString();               //VIN码
    var history={};
    history.obdCode=obdCode;
    history.tripId=tripId;
    history.vid=vid;
    history.vin=vin;
    history.ipAddress=tag.split(":")[0];
    history.port=tag.split(":")[1];
    history.content=toString0X(dataBuffer);
    history.receiveDate=new Date();
    var sql="insert into t_obd_history set ?";
    dao.executeBySql([sql],[history],function(){
        console.log("成功创建历史信息!");
    });
}
function toString0X(dataBuffer){
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
function packetProcess_1601(dataBuffer) {
    dataManager.init(dataBuffer,2);
    //1、获得报文内容
    var obdCode=dataManager.nextString();               //OBD编号
    var tripId=dataManager.nextDoubleWord();            //Trip编号
    var vid=dataManager.nextString();                   //vid
    var vin=dataManager.nextString();                   //VIN码
    var receiveTime=dataManager.nextString();           //当前时间
    var lastUpdateTime=getDateTimeStamp(null);
    var dataType=dataManager.nextByte();                //数据包类型
    //2、如果是发动机启动则创建一条新的行驶信息
    if(dataType===0x01){
        var obd={};
        obd.obdCode=obdCode;
        obd.tripId=tripId;
        obd.vid=vid;
        obd.vin=vin;
        obd.carStatus=1;
        obd.fireTime=receiveTime;
        obd.firingVoltage=dataManager.nextString(); //点火电压
        obd.fireSpeed=dataManager.nextString();     //点火车速
        obd.fireDistance=dataManager.nextString();//当前行驶距离
        var other=dataManager.nextString().split(',');
        obd.fireLongitude=other[0];                 //经度
        obd.fireLatitude=other[1];                  //纬度
        obd.fireDirection=other[2];                 //方向
        obd.fireLocationTime=other[3];              //定位时间
        obd.fireLocationType=other[4];              //定位方式(1-基站定位,2-GPS定位)
        obd.lastUpdateTime=lastUpdateTime;
        var sql="insert into t_obd_drive set ?";
        dao.executeBySql([sql],[obd],function(){
            console.log("成功创建行驶信息:"+JSON.stringify(obd));
        });
    }
    //3、其他情况则更新行驶信息，需要先获取行驶信息的id
    else if(dataType===2){
        //2、获取当前行驶详细信息

        var driveDetail=[];
        var detailCount=dataManager.nextWord();            //车况信息个数
        for(var i=0;i<detailCount;i++){
            var id=dataManager.nextWord();;             //ID
            var value=info401.getValueByID(id);
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

    return responseBuffer.slice(0, offset);
}
function packetProcess_1602(dataBuffer) {
    dataManager.init(dataBuffer,2);
    //1、获得报文内容
    var obdCode=dataManager.nextString();           //OBD编号
    var tripId=dataManager.nextDoubleWord();        //Trip编号
    var vid=dataManager.nextString();               //vid
    var vin=dataManager.nextString();               //VIN码
    var createTime=dataManager.nextString();        //当前时间
    var alarmType=dataManager.nextByte();               //报警类型
    var speed=dataManager.nextString();              //车速
    var travelDistance=dataManager.nextString();     //行驶距离
    var other=dataManager.nextString().split(',');
    var longitude=other[0];          //经度
    var latitude=other[1];           //纬度
    var direction=other[2];          //方向
    var locationTime=other[3];       //定位时间
    var locationType=other[4];       //定位方式(1-基站定位,2-GPS定位)
    var obdAlarm={};
    obdAlarm.obdCode=obdCode;
    obdAlarm.tripId=tripId;
    obdAlarm.vid=vid;
    obdAlarm.vin=vin;
    obdAlarm.createTime=createTime;
    obdAlarm.alarmType=alarmType;
    obdAlarm.speed=speed;
    obdAlarm.travelDistance=travelDistance;
    obdAlarm.longitude=longitude;
    obdAlarm.latitude=latitude;
    obdAlarm.direction=direction;
    obdAlarm.locationTime=locationTime;
    obdAlarm.locationType=locationType;
    if(alarmType===0x01){
        var faultCode=[];
        var fcCount=dataManager.nextByte();               //故障码个数
        for(var i=0;i<fcCount;i++){
            var code=dataManager.nextString();             //故障码
            var status=dataManager.nextString();           //故障码属性
            var desc=dataManager.nextString();             //故障码描述
            faultCode.push({code:code,status:status,desc:desc});
        }
        obdAlarm.faultInfo=JSON.stringify(faultCode);
    }
    else if(alarmType===0x04||alarmType===0x05){
        obdAlarm.faultInfo=dataManager.nextString();
    }
    var sql="insert into t_obd_alarm set ?";
    dao.executeBySql([sql],[obdAlarm],function(){
        console.log("成功创建报警信息:"+JSON.stringify(obdAlarm));
    });
    return getOBDSuccess(0x1602);
}
function get1603Default(){
    return {
        createTime:new Date(),          //时间戳
        lastUpdateTime:new Date(),

        actionCount:0x02,               //执行动作数量(0x00或0x02)
        initCode:0x00,                  //恢复出厂设置序列号
        isCodeClear:0xF0,               //是否清码

        carUpdateCount:0x05,            //车辆信息更新数量(0x00或0x05)
        vid:"VID20140501",              //vid
        brand:0xFF,                     //品牌
        series:0xFF,                    //系列
        modelYear:0xFF,                 //年款
        engineDisplacement:"2.5T",      //发动机排量

        serverConfigCount:0x05,         //网络参数更新数量(0x00-0x05)
        addressParam:"220.249.72.235",  //获取参数数据地址
        portParam:9005,               //获取参数数据端口
        addressUpload:"220.249.72.235", //主动上传数据地址
        portUpload:9005,              //主动上传数据端口
        addressAlarm:"220.249.72.235",  //报警数据上传地址
        portAlarm:9005,               //报警数据上传端口
        addressMessage:"220.249.72.235",//短信回复数据地址
        portMessage:9005,             //短信回复数据端口
        addressLocation:"220.249.72.235",//定位数据地址
        portLocation:9005,            //定位数据端口

        speedGroup:"0,60,120,250",      //车速分段统计

        locationCount:0x03,             //定位信息更新数量(0x00或0x03)
        metrePerLocation:75,            //每行驶多少米定位一次
        secondsPerLocation:9,           //每过多少秒定位一次
        locationModel:0x00,             //定位模式/距离与时间的关系

        alarmCount:0x04,                //报警信息更新数量(0x00或0x04)
        overSpeed:120,                  //超速临界值(单位km/h，超过此值被判定为超速，默认120km/h)
        overSpeedTime:6,                //超速持续时间(单位秒，超速持续多少秒时报警，默认6秒)
        waterTemperatureAlarm:110,      //水温报警值(单位℃，默认110℃)
        voltageAlarm:132,               //报警电压(单位0.1V，默认132，即13.2V)

        fireOffCount:0x03,              //熄火后信息更新数量(0x00或0x03)
        criticalVoltage:115,            //关机临界电压
        closeAfterFlameOut:0xFF,        //熄火后关闭时间点
        voltageThreshold:"120,153",     //熄火后电池电压阀值

        runtimeCount:0x00,              //运行中数据更新数量(0x00或0x02，暂时只支持0x00)
        uploadInterval:300,             //行驶中上传数据间隔时间
        uploadParamId:"65024,65026,65027",//行驶中上传数据参数Id，参考4.01和4.02

        updateId:"0.0.0"                //软件升级Id
    };
};
//生成要回复的报文内容并返回，回复和数据库操作异步处理
function get1603Response(obd){

    var responseBuffer = new Buffer(4096);
    dataManager.init(responseBuffer,0);
    dataManager.writeWord(0x1603);
    dataManager.writeString(getDateTimeStamp(obd.lastUpdateTime));
    //动作
    dataManager.writeByte(obd.actionCount);
    if(obd.actionCount>0x00){
        dataManager.writeByte(obd.initCode);
        dataManager.writeByte(obd.isCodeClear);
    }
    //车信息
    dataManager.writeByte(obd.carUpdateCount);
    if(obd.carUpdateCount>0x00){
        dataManager.writeString(obd.vid);
        dataManager.writeByte(obd.brand);
        dataManager.writeByte(obd.series);
        dataManager.writeByte(obd.modelYear);
        dataManager.writeString(obd.engineDisplacement);
    }
    //服务器配置
    dataManager.writeByte(obd.serverConfigCount);
    if(obd.serverConfigCount>0x00){
        dataManager.writeString(obd.addressParam);
        dataManager.writeWord(obd.portParam);
        dataManager.writeString(obd.addressUpload);
        dataManager.writeWord(obd.portUpload);
        dataManager.writeString(obd.addressAlarm);
        dataManager.writeWord(obd.portAlarm);
        dataManager.writeString(obd.addressMessage);
        dataManager.writeWord(obd.portMessage);
        dataManager.writeString(obd.addressLocation);
        dataManager.writeWord(obd.portLocation);
    }
    //车速分组
    var speedGroup=obd.speedGroup.split(',');
    console.log(speedGroup);
    dataManager.writeByte(speedGroup.length);
    for(var i=0;i<speedGroup.length;i++){
        dataManager.writeByte(parseInt(speedGroup[i]));
    }
    //定位
    dataManager.writeByte(obd.locationCount);
    if(obd.locationCount>0x00){
        dataManager.writeWord(obd.metrePerLocation);
        dataManager.writeWord(obd.secondsPerLocation);
        dataManager.writeByte(obd.locationModel);
    }

    //报警
    dataManager.writeByte(obd.alarmCount);
    if(obd.alarmCount>0x00){
        dataManager.writeByte(obd.overSpeed);
        dataManager.writeWord(obd.overSpeedTime);
        dataManager.writeWord(obd.waterTemperatureAlarm);
        dataManager.writeByte(obd.voltageAlarm);
    }
    //熄火后信息
    dataManager.writeByte(obd.fireOffCount);
    if(obd.fireOffCount>0x00){
        dataManager.writeWord(obd.criticalVoltage);
        dataManager.writeByte(obd.closeAfterFlameOut);
        var vtArray =obd.voltageThreshold.split(',');
        dataManager.writeWord(vtArray.length);
        for(var i=0;i<vtArray.length;i++){
            dataManager.writeByte(parseInt(vtArray[i]));
        }
    }
    //运行中数据
    var runtimeCount;       //运行中数据更新数量(0x00或0x02，暂时只支持0x00)
    var uploadInterval;     //行驶中上传数据间隔时间
    var uploadParamId=[];   //行驶中上传数据参数Id，参考4.01和4.02
    dataManager.writeByte(obd.runtimeCount);
    console.log(obd.runtimeCount>0x00)
    if(obd.runtimeCount>0x00){
        dataManager.writeWord(obd.uploadInterval);
        var upArray =obd.uploadParamId.split(',');
        for(var i=0;i<upArray.length;i++){
            dataManager.writeWord(parseInt(upArray[i]));
        }
    }

    //其他数据
    dataManager.writeString(obd.updateId);
    var aaa=dataManager.getBuffer();
    console.log(aaa);
    return aaa;
}
function packetProcess_1603(dataBuffer,cb) {
    dataManager.init(dataBuffer,2);
    //1、根据内容获得OBD编号等信息
    var obdCode=dataManager.nextString();           //OBD编号
    var tripId=dataManager.nextDoubleWord();        //Trip编号
    var vid=dataManager.nextString();               //vid
    var vin=dataManager.nextString();               //VIN码
    var hardwareVersion=dataManager.nextString();   //硬件版本号
    var firmwareVersion=dataManager.nextString();   //固件版本号
    var softwareVersion=dataManager.nextString();   //软件版本号
    var diagnosisType=dataManager.nextByte();       //诊断类型
    var initCode=dataManager.nextByte();            //恢复出厂序列号
    //构建OBD对应的JSON对象，回复给OBD设备的数据来源
    //2、根据OBD编号查询OBD信息，一个JSON对象
    var sql="select * from t_obd_info t where t.obdCode=?";
    dao.findBySql(sql,obdCode,function(rows) {
        //3、如果找到了则校验传入的OBD信息和数据库中的OBD信息，若不同则更新
        var obdInfo={};
        if(rows.length>0){
            obdInfo=rows[0];
        }
        //4、如果不存在则创建一个新的OBD，并写入默认数据
        else{
            obdInfo=get1603Default();
            obdInfo.obdCode=obdCode;
            obdInfo.tripId=tripId;
            obdInfo.vid=vid;
            obdInfo.vin=vin;
            obdInfo.hardwareVersion=hardwareVersion;
            obdInfo.firmwareVersion=firmwareVersion;
            obdInfo.softwareVersion=softwareVersion;
            obdInfo.diagnosisType=diagnosisType;
            obdInfo.initCode=initCode;
            var sql="insert into t_obd_info set ?";
            dao.executeBySql([sql],[obdInfo],function(err,rows,fields){
                if(err)throw err;
                console.log("添加成功:"+JSON.stringify(obdInfo));
            });
        }
        cb(get1603Response(obdInfo));
    });
}

function packetProcess_1605(dataBuffer) {

    var responseBuffer = new Buffer(16);
    var offset = 0;

    responseBuffer.writeUInt16BE(0x1605, offset);
    offset += 2;

    responseBuffer.writeUInt8(0x00, offset);
    offset += 1;

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