/**
 * Created by LM on 14-6-6.
 */
'use strict'

var dao=require("../config/dao");

function getObdInfo(obdCode){
    var sql="select * from t_obd_drive d where d.obdCode=? and d.fireTime>? and d.fireTime<? order by d.tripId";
    var startTime=new Date("2014-07-09 00:00:00");
    dao.findBySql(sql,[obdCode,startTime,new Date()],function(info){
        var obdArray=info.data;
        dao.findBySql("select * from t_drive_dictionary",[],function(info){
            var rows=info.data;
            var obdDic={};
            for(var i=0;i<rows.length;i++){
                obdDic[rows[i].code]=rows[i];
            }
            for(var i=0;i<obdArray.length;i++){
                var obd=obdArray[i];
                console.log("\n************************************");
                console.log("点火时间:"+obd.fireTime);
                console.log("熄火时间:"+obd.flameOutTime);
                console.log("行驶时间:"+obd.runTime+"秒");
                console.log("行驶距离:"+obd.currentMileage+"米");
                console.log("平均油耗:"+obd.currentAvgOilUsed/100+"L/100km");
                console.log("累计行驶距离:"+obd.mileage+"公里");
                console.log("累计平均油耗:"+obd.avgOilUsed/100+"L/100km");
                console.log("速段统计(速度1即0-1，速度45即1-45，速度90即45-90，速度255即90以上):");
                var sg=JSON.parse(obd.speedGroup);
                for(var j=0;j<sg.length;j++){
                    console.log("\t速度:"+sg[j].speed+"  时间"+sg[j].time+"秒   距离"+sg[j].distance+"米");
                }
                console.log("超速时间:"+obd.speedingTime+"秒，最大车速"+obd.speedMax+"km/h");
                console.log("急加速:"+obd.speedUp+"次,急减速"+obd.speedDown+"次，急转弯"+obd.sharpTurn+"次\n");
            }
            sql="select * from t_drive_detail dd where dd.createTime>? order by dd.obdDriveId,dd.createTime"
            dao.findBySql(sql,[startTime],function(info){
                var rows=info.data;
                for(var i=0;i<rows.length;i++){
                    var createTime=rows[i].createTime;
                    var detail=JSON.parse(rows[i].detail);
                    console.log("\n"+createTime+"的详细数据：");
                    for(var j=0;j<detail.length;j++){
                        var dic=obdDic[detail[j].id];
                        if(!dic) continue;
                        console.log(dic.description+"："+detail[j].value+dic.unit);
                    }
                }
            });
        });
    });
}
getObdInfo("INCAR000004");