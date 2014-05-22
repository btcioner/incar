'use strict';
var dao=require("./dao");;
//var msgCentre=require("./msgCentre")
function getRandom(start,end,decimal){
    decimal=decimal?decimal:0;
    return Math.floor((start+Math.random()*(end+1-start))*Math.pow(10,decimal))/(Math.pow(10,decimal+1)*0.1);
}
function getRandomTime(year,month,day){
    var d=new Date();
    var y=year?year:2014;
    d.setYear(y);
    var m=month?month:getRandom(0,11,0);
    d.setMonth(m);
    var da=day?day:getRandom(1,30,0);
    if(m===1){
        d.setDate(da>28?28:getRandom(1,da));
    }
    else {
        d.setDate(getRandom(1,da));
    }
    d.setHours(getRandom(0,23));
    d.setMinutes(getRandom(0,59));
    d.setSeconds(getRandom(0,59));
    return d;
}

var sql="insert into t_obd_drive set ?";
var sqlDetail="insert into t_drive_detail set ?";
var detailArray=[];
var driveArray=[];
var driveCount=50;
var carCondition=[
    {"id":0,"value":"8.83"},
    {"id":1,"value":"0"},
    {"id":2,"value":"关"},
    {"id":4,"value":"CL"},
    {"id":5,"value":"---"},
    {"id":6,"value":"1.6"},
    {"id":7,"value":"5"},
    {"id":8,"value":"-3.9"},
    {"id":10,"value":"-6.2"},
    {"id":12,"value":"-100.0"},
    {"id":14,"value":"-100.0"},
    {"id":16,"value":"48"},
    {"id":17,"value":"30"},
    {"id":18,"value":"0"},
    {"id":19,"value":"0"},
    {"id":20,"value":"-39"},
    {"id":21,"value":"37"},
    {"id":22,"value":"3.03"},
    {"id":23,"value":"16.9"},
    {"id":25,"value":"O2S22 | O2S11"},
    {"id":26,"value":"0.275"},
    {"id":27,"value":"0.8"},
    {"id":28,"value":"0.170"},
    {"id":74,"value":"EOBD"}];
var obdCode="WFQ00012925";
var vid="11111";
var vin="W0L0ZCF693108391A";
//158913798138,158913805191
var speedGroupArray=[0,80,160];

for(var i=0;i<driveCount;i++){
    var runtime=getRandom(600,3600,0);
    var fireTime=getRandomTime(2014,4,22);
    var flameOutTime=new Date(fireTime.valueOf()+runtime*1000);
    var lastUpdateTime=new Date(flameOutTime.valueOf()+60 * 1000);
    var speedGroup=[];
    for(var j=0;j<speedGroupArray.length;j++){
        var speedUnit=speedGroupArray[j];
        speedGroup.push({
            speed:speedUnit,
            time:getRandom(0,600,0),
            distance:speedUnit===0?0:getRandom(1000,10000,0)
        });
    }
    var drive={
        obdCode:obdCode,                        //OBD设备号
        tripId:i,                               //行程标识
        vid:vid,                                //车辆标识
        vin:vin,                                //发动机标识
        lastUpdateTime:lastUpdateTime,          //最后更新时间
        fireTime:fireTime,                      //点火时间
        firingVoltage:getRandom(7,10,1),        //点火电压
        fireSpeed:getRandom(10,50,0),           //点火定位车速
        fireDistance:getRandom(100,1000,0),     //点火定位行驶距离
        fireLongitude:'W'+getRandom(0,180,6),   //点火定位经度
        fireLatitude:'S'+getRandom(0,90,6),     //点火定位纬度
        fireDirection:getRandom(0,360,0),       //点火定位方向
        fireLocationTime:fireTime,              //点火定位时间
        fireLocationType:1,                     //点火定位方式(1-基站定位,2-GPS定位)
        runTime:runtime,                        //本次行程持续时间
        currentMileage:getRandom(6,100,1),      //本次驾驶行驶里程
        currentAvgOilUsed:getRandom(7,12,2),    //本次驾驶平均油耗
        mileage:getRandom(0,10000,0),           //累计行驶里程
        avgOilUsed:getRandom(7,12,2),           //累计平均油耗
        speedGroup:JSON.stringify(speedGroup),  //本行程车速分组统计(JSON)
        speedingTime:getRandom(0,30,0),         //超速行驶时间
        speedUp:getRandom(0,10,0),              //急加速次数
        speedDown:getRandom(0,10,0),            //急减速次数
        sharpTurn:getRandom(0,10,0),            //急转弯次数
        speedMax:getRandom(60,250,0),           //最高车速
        flameOutSpeed:getRandom(10,50,0),       //熄火定位车速
        flameOutDistance:getRandom(100,1000,0), //熄火定位行驶距离
        flameOutLongitude:'W'+getRandom(0,180,6),//熄火定位经度
        flameOutLatitude:'S'+getRandom(0,90,6), //熄火定位纬度
        flameOutDirection:getRandom(0,360,0),   //熄火定位方向
        flameOutLocationTime:fireTime,          //熄火定位时间
        flameOutLocationType:1,                 //熄火定位方式(1-基站定位,2-GPS定位)
        flameOutVoltage:getRandom(7,10,1),      //熄火时蓄电池电压
        carStatus:4,                            //车辆当前状态(启动、行驶、熄火、完成、异常)12345
        flameOutTime:flameOutTime               //熄火时间
    };
    driveArray.push(drive);
}
for(i=0;i<driveArray.length;i++){
    dao.insertBySql(sql,driveArray[i],function(info,drive){
        detailArray=[];
        var driveId=drive.id=info.insertId;
        console.log("成功添加行车数据"+driveId+"--"+JSON.stringify(drive));
        var fireTime=drive.fireTime;
        var flameOutTime=drive.flameOutTime;
        while(fireTime<flameOutTime){
            var detail={
                obdCode:obdCode,
                obdDriveId:driveId,
                detail:JSON.stringify(carCondition),
                createTime:fireTime
            }
            detailArray.push(detail);
            fireTime=new Date(fireTime.valueOf()+5* 60 * 1000);
        }
        if(i===driveCount){
            for(var k=0;k<detailArray.length;k++){
                dao.insertBySql(sqlDetail,[detailArray[k]],function(info){
                    console.log("成功添加车况数据"+info.insertId);
                });
            }
        }
    });
}



/*msgCentre.getOBDRuntime("WFQ00011755",13007196492,[0xFE05,0xFE06,0xFE07,0xFE08,0xFE09,0xFE0A,0xFE0B,0xFE0C],function(returnJson){
    console.log("得到返回值:\n"+JSON.stringify(returnJson));
});*/
/*msgCentre.resetDefault("WFQ00011755",13007196493,function(){

});*/

/*msgCentre.setOBDInfo("WFQ00011755",18402701709,{
    0xFE05:"220.249.72.235",
    0xFE06:0x232D,
    0xFE07:"220.249.72.235",
    0xFE08:0x232D,
    0xFE09:"220.249.72.235",
    0xFE0A:0x232D,
    0xFE0B:"220.249.72.235",
    0xFE0C:0x232D
},function(returnJson){
    console.log("得到返回值:\n"+JSON.stringify(returnJson));
});*/

/*var sp = require('serialport');

var SerialPort = sp.SerialPort;
var serialPort = new SerialPort("COM3", {
    baudrate: 9600,
    databits: 8,
    parity: 'none',
    stopbits: 1
}, false);

serialPort.open(function() {//18402701709
    var binContent = new Buffer(19);
    var offset=17;
    binContent.write("SMS13007196492#LD");
    binContent.writeUInt16BE(0x1623,offset);
    offset+=2;

    console.log(binContent);
    serialPort.write(binContent, function(err, results) {
        if (err) {
            console.log('err ' + err + '\n');
            return;
        }
        console.log('results: ' + results + '\n');
    });


});*/
/*

var convert=require('iconv-lite');

var dataBuffer = new Buffer(20);
dataBuffer.writeUInt8(0xCE,0);
dataBuffer.writeUInt8(0xD2,1);
dataBuffer.writeUInt8(0xB0,2);
dataBuffer.writeUInt8(0xAE,3);
dataBuffer.writeUInt8(0xC4,4);
dataBuffer.writeUInt8(0xE3,5);
dataBuffer.writeUInt8(0x00,6);


var dataManager=require("./dataManager");
dataManager.init(new Buffer(1024),0);
dataManager.writeByte(1);
dataManager.writeString("我爱你");
dataManager.writeWord(8);
dataManager.setOffset(0);


console.log(dataManager.nextByte());
console.log(dataManager.nextString());
console.log(dataManager.nextWord());
console.log(toString0X(dataManager.getBuffer()));
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

var aaa={a:[{ff:33,fff:44},{ff:33,fff:44}],b:{s:3},c:[2,3,4,5]};
console.log(Object.keys(aaa).length);*/
