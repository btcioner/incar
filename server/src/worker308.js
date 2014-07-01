/**
 * Created by Jesse Qu on 2/25/14.
 * 158913807970
 */

'use strict';

var dao = require('../core/dao');
var dataManager = require('../core/dataManager');
var http = require("http");
var byteCmd=[0xFE01,0xFE04,0xFE16,0xF913807970E17,0xFE19];
var wordCmd=[0xFE06,0xFE08,0xFE0A,0xFE0C,0xFE0D,0xFE0E,0xFE0F,0xFE11,0xFE12,0xFE1A];
var longCmd=[0xFE03,0xFE14];

function toTime(str){
    var dt=new Date(str);
    var min=new Date('1970-01-02 00:00:00');
    if(dt>min){
        return getDateTimeStamp(dt);
    }
    return getDateTimeStamp(min);
}
function sendToMessageServer(dataBuffer,commandWord){
    console.log("接收到短信回复："+commandWord+"\n");
    var dataJson={dataString:dataBuffer};
    var opt = {
        method: "POST",
        host: "lahmyyc2014.vicp.cc",
        port: 48928,
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
    var dataBuffer= dataManager.init(packetInput,0);
    var commandWord = dataManager.nextWord();           //cmd
    var obdCode=dataManager.nextString();               //OBD编号
    var saveAndReturn=function(responseBuffer){
        saveToHistory(dataBuffer,tag);
        if(!responseBuffer){
            responseBuffer=getOBDSuccess(commandWord);
        }
        cb(responseBuffer);
    };
    if(commandWord===0x1601){
        packetProcess_1601(dataBuffer,saveAndReturn);
    }
    if(commandWord===0x1602){
        packetProcess_1602(dataBuffer,saveAndReturn);
    }
    if(commandWord===0x1603){
        packetProcess_1603(dataBuffer,saveAndReturn);
    }
    if(commandWord===0x1605){
        packetProcess_1605(dataBuffer,saveAndReturn);
    }
    if(commandWord===0x1606){
        packetProcess_1606(dataBuffer,saveAndReturn);
    }
    if(commandWord===0x1607){
        packetProcess_1607(dataBuffer,saveAndReturn);
    }
    if(commandWord===0x1608){
        packetProcess_1608(dataBuffer,saveAndReturn);
    }
    if(commandWord===0x160A){
        packetProcess_160A(dataBuffer,saveAndReturn);
    }
    if(commandWord>=0x1621&&commandWord<=0x16E0){
        sendToMessageServer(dataBuffer,commandWord);
        saveAndReturn();
    }
    if(commandWord===0x9502){
        saveAndReturn();
    }
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
    dao.executeBySql(sql,history,function(info){
        if(info.err){
            console.log("创建历史信息失败:"+err);
        }
        else{
            console.log("成功创建历史信息!");
        }
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

function get401ValueByID(id){
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
};
function set401ValueByID(id,value){
    if(id<0xFE03||id===0xFE13||id===0xFE14||id>0xFE1A)return;

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
};
function packetProcess_1601(dataBuffer,cb) {
    dataManager.init(dataBuffer,2);
    //1、获得报文内容
    var obdCode=dataManager.nextString();               //OBD编号
    var tripId=dataManager.nextDoubleWord();            //Trip编号
    var vid=dataManager.nextString();                   //vid
    var vin=dataManager.nextString();                   //VIN码
    var rt=dataManager.nextString();
    var receiveTime=toTime(rt);                         //当前时间
    var lastUpdateTime=getDateTimeStamp(null);
    var dataType=dataManager.nextByte();                //数据包类型
    //2、如果是发动机启动则创建一条新的行驶信息
    if(dataType===0x01){
        var sql="select t.tripId,t.obdCode,t.id,t.carStatus from t_obd_drive t where t.tripId=? and t.obdCode=?";
        dao.findBySql(sql,[tripId,obdCode],function(info){
            if(info.err){
                throw info.err;
            }
            else{
                var rows=info.data;
                if(rows.length===0){
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
                    obd.fireLocationTime=toTime(other[3]);              //定位时间
                    obd.fireLocationType=other[4];              //定位方式(1-基站定位,2-GPS定位)
                    obd.lastUpdateTime=lastUpdateTime;
                    var sql="insert into t_obd_drive set ?";
                    dao.insertBySql(sql,obd,function(info){
                        if(info.err){
                            throw err;
                        }
                        else{
                            console.log("成功创建行驶信息(点火):"+JSON.stringify(info));
                            cb();
                        }
                    });
                }
                else{
                    console.log("行程信息已经存在");
                    cb();
                }
            }
        });
    }
    //3、其他情况则更新行驶信息，需要先获取行驶信息的id
    else{
        var sql="select t.id as driveId,t.carStatus from t_obd_drive t where t.tripId=? and t.obdCode=?";
        dao.findBySql(sql,[tripId,obdCode],function(info){
            if(info.err){
                throw info.err;
            }
            else{
                var rows=info.data;
                if(rows.length>0){
                    var driveId=rows[0].driveId;
                    var carStatus=rows[0].carStatus;
                    if(dataType===0x02){
                        //2、获取当前行驶详细信息
                        var driveDetail=[];
                        var detailCount=dataManager.nextWord();            //车况信息个数

                        for(var i=0;i<detailCount;i++){
                            var id=dataManager.nextWord();;             //ID
                            var value=get401ValueByID(id);
                            driveDetail.push({id:id,value:value});
                        }
                        var sql="insert into t_drive_detail set ?";
                        var args={
                            obdCode:obdCode,
                            obdDriveId:driveId,
                            detail:JSON.stringify(driveDetail),
                            createTime:new Date()
                        };
                        if(carStatus>1){
                            dao.insertBySql(sql,args,function(info){
                                if(info.err){
                                    throw err;
                                }
                                else{
                                    console.log("车辆行驶详情保存成功:"+JSON.stringify(info));
                                    cb();
                                }
                            });
                        }
                        else{
                            var sqlDrive="update t_obd_drive set ? where id=?";
                            var argsDrive=[{carStatus:2,lastUpdateTime:lastUpdateTime},id];
                            dao.executeBySqls([sql,sqlDrive],[args,argsDrive],function(info){
                                if(info.err){
                                    console.log(info);
                                    throw err;
                                }
                                else{
                                    console.log("成功更新行驶信息(行驶中):"+JSON.stringify(info));
                                    cb();
                                }
                            });
                        }
                    }
                    else if(dataType===3){
                        //--熄火
                        //-----本次行程数据小计
                        var runTime=dataManager.nextWord();            //发动机运行时间
                        var currentMileage=dataManager.nextLong();     //本次驾驶行驶里程
                        var currentAvgOilUsed=dataManager.nextWord();  //本次驾驶平均油耗
                        var mileage=dataManager.nextLong();            //累计行驶里程
                        var avgOilUsed=dataManager.nextWord();         //累计平均油耗
                        //-----本行程车速分组统计
                        var speedGroup=[];              //本行程车速分组统计(JSON)
                        var groupCount=dataManager.nextByte();
                        for(var i=0;i<groupCount;i++){
                            var speed=dataManager.nextByte();
                            var time=dataManager.nextWord();
                            var distance=dataManager.nextLong();
                            speedGroup.push({speed:speed,time:time,distance:distance});
                        }
                        //-----驾驶习惯统计
                        var speedingTime=dataManager.nextWord();       //超速行驶时间
                        var speedUp=dataManager.nextWord();            //急加速次数
                        var speedDown=dataManager.nextWord();          //急减速次数
                        var sharpTurn=dataManager.nextLong();          //急转弯次数
                        var speedMax=dataManager.nextByte();           //最高车速
                        //-----熄火定位信息
                        var flameOutSpeed=dataManager.nextString();          //熄火车速
                        var flameOutDistance=dataManager.nextString(); //熄火时行驶距离
                        var other=dataManager.nextString().split(',');
                        var flameOutLongitude=other[0];      //熄火时经度
                        var flameOutLatitude=other[1];       //熄火时纬度
                        var flameOutDirection=other[2];      //熄火时方向
                        var flameOutLocationTime=toTime(other[3]);   //熄火时定位时间
                        var flameOutLocationType=other[4];   //熄火时定位方式(1-基站定位,2-GPS定位)
                        var sql="update t_obd_drive set ? where id=?";
                        var args=[{
                            runTime:runTime,
                            currentMileage:currentMileage,
                            currentAvgOilUsed:currentAvgOilUsed,
                            mileage:mileage,
                            avgOilUsed:avgOilUsed,
                            speedGroup:JSON.stringify(speedGroup),
                            speedingTime:speedingTime,
                            speedUp:speedUp,
                            speedDown:speedDown,
                            sharpTurn:sharpTurn,
                            speedMax:speedMax,
                            flameOutSpeed:flameOutSpeed,
                            flameOutDistance:flameOutDistance,
                            flameOutLongitude:flameOutLongitude,
                            flameOutLatitude:flameOutLatitude,
                            flameOutDirection:flameOutDirection,
                            flameOutLocationTime:flameOutLocationTime,
                            flameOutLocationType:flameOutLocationType,
                            carStatus:3,
                            flameOutTime:receiveTime,
                            lastUpdateTime:lastUpdateTime
                        },id];
                        dao.executeBySql(sql,args,function(info){
                            if(info.err){
                                throw err;
                            }
                            else{
                                console.log("成功更新行驶信息(熄火):"+JSON.stringify(info));
                                cb();
                            }
                        });
                    }
                    else if(dataType===4){
                        var flameOutVoltage=dataManager.nextString();        //熄火时蓄电池电压
                        var sql="update t_obd_drive set ? where id=?";
                        var args=[{
                            flameOutVoltage:flameOutVoltage,
                            carStatus:4,
                            lastUpdateTime:lastUpdateTime
                        },id];
                        dao.executeBySql(sql,args,function(info){
                            if(info.err){
                                throw err;
                            }
                            else{
                                console.log("成功更新行驶信息(行程结束):"+JSON.stringify(info));
                                cb();
                            }
                        });
                    }
                    else{
                        var sql="update t_obd_drive set ? where id=?";
                        var args=[{
                            carStatus:5,
                            lastUpdateTime:lastUpdateTime
                        },id];
                        dao.executeBySql(sql,args,function(info){
                            if(info.err){
                                throw err;
                            }
                            else{
                                console.log("成功更新行驶信息(异常):"+JSON.stringify(info));
                                cb();
                            }
                        });
                    }
                }
                else{
                    console.log("车辆行驶信息丢失,无法找到[OBDCode:"+obdCode+"][TripId:"+tripId+"]对应的行程信息");
                    cb();
                }
            }
        });
    }
}
function packetProcess_1602(dataBuffer,cb) {
    dataManager.init(dataBuffer,2);
    //1、获得报文内容
    var obdCode=dataManager.nextString();           //OBD编号
    var tripId=dataManager.nextDoubleWord();        //Trip编号
    var vid=dataManager.nextString();               //vid
    var vin=dataManager.nextString();               //VIN码
    var createTime=toTime(dataManager.nextString());//当前时间
    var alarmType=dataManager.nextByte();           //报警类型
    var speed=dataManager.nextString();             //车速
    var travelDistance=dataManager.nextString();    //行驶距离
    var other=dataManager.nextString().split(',');
    var longitude=other[0];          //经度
    var latitude=other[1];           //纬度
    var direction=other[2];          //方向
    var locationTime=toTime(other[3]);       //定位时间
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
    dao.insertBySql(sql,obdAlarm,function(info){
        if(info.err){
            throw err;
        }
        else{
            var alarm=info.data;
            console.log("成功创建报警信息:"+JSON.stringify(alarm));
            cb();
            if(alarm.alarmType===0x02){
                sql="insert into t_remind set ?";
                var remind={
                    obdCode:obdCode,
                    remindType:1,
                    remindStatus:1,
                    createTime:createTime
                };
                dao.insertBySql(sql,remind,function(info){
                    if(info.err){
                        throw err;
                    }
                    else{
                        console.log("成功创建碰撞提醒信息:"+JSON.stringify(info));
                    }
                });
            }
        }
    });
}



//生成要回复的报文内容并返回，回复和数据库操作异步处理
function get1603Response(obd){
    var responseBuffer = new Buffer(1024*10);
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
        dataManager.writeByte(obd.modelYear-2000);
        var edNum=Math.round(parseFloat(obd.engineDisplacement)*10)/10;
        var ed=edNum.toString().split(".");
        var edStr='0.0';
        if(ed&&ed.length===1){
            edStr = ed[0]+".0";
        }
        else if(ed.length>1){
            edStr=edNum.toString();
        }
        dataManager.writeString(edStr+obd.engineType);
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
        dataManager.writeWord(obd.closeAfterFlameOut);
        dataManager.writeByte(obd.criticalVoltage);
        var vtArray =obd.voltageThreshold.split(',');
        dataManager.writeWord(vtArray.length);
        for(var i=0;i<vtArray.length;i++){
            dataManager.writeByte(parseInt(vtArray[i]));
        }
    }
    //运行中数据

    var uploadInterval;     //行驶中上传数据间隔时间
    var uploadParamId=obd.uploadParamId;   //行驶中上传数据参数Id，参考4.01和4.02
    var runtimeCount=uploadParamId?uploadParamId.length:0;
    dataManager.writeByte(runtimeCount);
    if(runtimeCount>0){
        dataManager.writeWord(obd.uploadInterval);
        for(var i=0;i<runtimeCount;i++){
            dataManager.writeWord(uploadParamId[i]);
        }
    }

    //其他数据
    dataManager.writeString(obd.updateId);
    return dataManager.getBuffer();
}

function get1603Default(){
    return {
        createTime:new Date(),          //时间戳
        lastUpdateTime:new Date(),

        actionCount:0x02,               //执行动作数量(0x00或0x02)
        initCode:0x00,                  //恢复出厂设置序列号
        isCodeClear:0xF0,               //是否清码

        carUpdateCount:0x00,            //车辆信息更新数量(0x00或0x05)

        serverConfigCount:0x05,         //网络参数更新数量(0x00-0x05)
        addressParam:"114.215.172.92",  //获取参数数据地址
        portParam:9005,                 //获取参数数据端口
        addressUpload:"114.215.172.92", //主动上传数据地址
        portUpload:9005,                //主动上传数据端口
        addressAlarm:"114.215.172.92",  //报警数据上传地址
        portAlarm:9005,                 //报警数据上传端口
        addressMessage:"114.215.172.92",//短信回复数据地址
        portMessage:9005,               //短信回复数据端口
        addressLocation:"114.215.172.92",//定位数据地址
        portLocation:9005,              //定位数据端口

        speedGroup:"1,45,90,255",       //车速分段统计

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
        closeAfterFlameOut:0x00B4,      //熄火后关闭时间点
        voltageThreshold:"120,153",     //熄火后电池电压阀值


        uploadInterval:120,             //行驶中上传数据间隔时间
        uploadParamId:[12],             //行驶中上传数据参数Id，参考4.01和4.02

        updateId:"0.0.0"                //软件升级Id
    };
};
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


    var sql="select t.id,t.brand,t.series,t.modelYear,t.engineType," +
        "t.disp,t.initCode from t_car t where t.obd_code=?";
    dao.findBySql(sql,obdCode,function(info) {
        if(info.err){
            throw err;
        }
        else{
            //3、如果找到了则校验传入的OBD信息和数据库中的OBD信息，若不同则更新
            var rows=info.data;
            if(rows.length>0){
                var obd=rows[0];
                var obdInfo=get1603Default();
                obdInfo.carUpdateCount=0x05;            //车辆信息更新数量(0x00或0x05)
                obdInfo.vid=obd.id;                     //vid
                obdInfo.brand=obd.brand;                //品牌
                obdInfo.series=obd.series;              //系列
                obdInfo.modelYear=obd.modelYear;        //年款
                obdInfo.engineType=obd.engineType;     //发动机类型
                obdInfo.engineDisplacement=obd.disp;    //发动机排量
                obdInfo.initCode=obd.initCode;         //恢复出厂序列号
                cb(get1603Response(obdInfo));
            }
            //4、如果不存在则创建一个新的OBD，并写入默认数据
            else{
                console.log("无法识别的ObdCode:"+obdCode);
                /*obdInfo=get1603Default();
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
                 });*/
            }
        }
    });
}

function packetProcess_1605(dataBuffer,cb) {
    console.log('接收到1605数据');
    cb();
}
function packetProcess_1606(dataBuffer,cb) {
    console.log('接收到1606数据');
    cb();
}
function packetProcess_1607(dataBuffer,cb) {
    console.log('接收到1607数据');
    cb();
}
function packetProcess_1608(dataBuffer,cb) {
    var obdCode=dataManager.nextString();           //OBD编号
    var tripId=dataManager.nextDoubleWord();        //Trip编号
    var vid=dataManager.nextString();               //vid
    var vin=dataManager.nextString();               //VIN码
    var createTime=toTime(dataManager.nextString());//当前时间
    var faultCode=[];
    var fcCount=dataManager.nextByte();               //故障码个数
    for(var i=0;i<fcCount;i++){
        var code=dataManager.nextString();             //故障码
        var status=dataManager.nextString();           //故障码属性
        var desc=dataManager.nextString();             //故障码描述
        faultCode.push({code:code,status:status,desc:desc});
    }
    var driveDetail=[];
    var detailCount=dataManager.nextWord();            //车况信息个数
    for(var i=0;i<detailCount;i++){
        var id=dataManager.nextWord();;             //ID
        var value=dataManager.nextString();         //值
        driveDetail.push({id:id,value:value});
    }
    var lowSpeed={
        obdCode:obdCode,
        tripId:tripId,
        vid:vid,
        vin:vin,
        receiveTime:createTime,
        faultCode:faultCode,
        driveDetail:driveDetail
    };
    console.log('成功创建怠速信息:'+JSON.stringify(lowSpeed));
    cb();
}
function packetProcess_160A(dataBuffer,cb) {
    console.log('接收到160A数据');
    cb();
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