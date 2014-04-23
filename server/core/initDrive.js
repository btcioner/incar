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
var faultCode=[
    {
        "code":"P0117",
        "status":"存贮故障码",
        "desc":"发动机冷却液温度传感器1电路低"
    },{
        "code":"P0195",
        "status":"存贮故障码",
        "desc":"机油温度传感器电路故障"
    }
];
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
var obdCode="WFQ00013044";
for(var i=0;i<driveCount;i++){
    var runtime=getRandom(25,200,0);
    var fTime=getRandomTime(2014,3,18);
    var drive={
        obdCode:obdCode,
        vin:"W0L0ZCF693108391A",
        brand:9,
        series:84,
        modelYear:0xFF,
        firingVoltage:getRandom(7,10,1),
        runTime:runtime,
        currentMileage:getRandom(6,100,1),
        currentAvgOilUsed:getRandom(7,12,2),
        speedingTime:getRandom(0,30,0),
        speedUp:getRandom(0,10,0),
        speedDown:getRandom(0,10,0),
        sharpTurn:getRandom(0,10,0),
        flameVoltage:getRandom(7,10,1),
        avgOilUsed:getRandom(7,12,2),
        mileage:getRandom(0,10000,0),
        voltageAfter:getRandom(7,10,1),
        carStatus:4,
        fireTime:fTime,
        flameOutTime:new Date(fTime.valueOf()+runtime* 60 * 1000)
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
        var fCode=getRandom(0,10)>2?"[]":JSON.stringify(faultCode);
        while(fireTime<flameOutTime){
            var detail={
                obdCode:obdCode,
                obdDriveId:driveId,
                faultCode:fCode,
                carCondition:JSON.stringify(carCondition),
                avgOilUsed:getRandom(8,12,1),
                mileage:getRandom(0,10,2),
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
