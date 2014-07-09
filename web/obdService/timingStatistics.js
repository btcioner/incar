/**
 * Created by LM on 14-7-9.
 */
var dao=require("../config/dao");
/**
 * 获得里程标签Code
 * @param car
 * @returns {string}
 */
function getMilTag(car){
    if(car.mileage){
        if(car.mileage<5000){
            return 'useTo1';
        }
        else{
            return 'useTo2';
        }
    }
    else{
        return '';
    }
}
/**
 * 获得频率标签Code
 * @param car
 * @returns {string}
 */
function getRateTag(car){
    if(car.count){
        if(car.count<60){
            return 'rate1';
        }
        else if(car.count<120){
            return 'rate2';
        }
        else if(car.count<180){
            return 'rate3';
        }
        else{
            return 'rate4';
        }
    }
    else{
        return '';
    }
}
/**
 * 获得偏好标签Code
 * @param car
 * @returns {string}
 */
function getPreTag(car){
    if(car.preCount){
        if(car.preCount<5){
            return 'pre1';
        }
        else if(car.preCount<15){
            return 'pre2';
        }
        else{
            return 'pre3';
        }
    }
    else{
        return '';
    }
}
/**
 * 获得时段标签Code
 * @param car
 * @returns {string}
 */
function getTimeTag(car){
    if(car.time1&&car.time2&&car.time3){
        if(car.time1>car.time2){
            if(car.time1>car.time3){
                return 'time1';
            }
            else{
                return 'time3';
            }
        }
        else{
            if(car.time2>car.time3){
                return 'time2';
            }
            else{
                return 'time3';
            }
        }
    }
    else{
        return '';
    }
}
/**
 * 获得上个自然月的开始和结束
 * @returns [开始时间,结束时间]
 */
function getMonthStartAndEnd(){
    var start=new Date();
    start.setDate(1);
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    var end=new Date(start.valueOf()-1000);
    start.setMonth(start.getMonth()-1);
    return [start,new Date()];
}
/**
 * 重算并更新所有车辆标签
 */
function _buildTags(cb){
    //车系、渠道、车龄
    var sql="select c.id as carId," +
        "concat(c.brand,'-',c.series) as serTag," +
        "a.wx_oid as chlTag," +
        "timestampDiff(YEAR,c.age,now()) as ageTag," +
        "d.currentMileage as milTag," +
        "d.speedUp+d.speedDown+d.sharpTurn as preTag," +
        "dayOfWeek(d.fireTime) as fireWeek," +
        "timestampDiff(hour,DATE(d.fireTime),d.fireTime) as timeTag " +
        "from t_car c " +
        "left join t_car_user cu on c.id=cu.car_id " +
        "left join t_account a on a.id=cu.acc_id " +
        "left join t_obd_drive d on d.obdCode=c.obd_code " +
        "and d.fireTime>=? and d.fireTime<?";
    var args=getMonthStartAndEnd();
    dao.findBySql(sql,args,function(info){
        if(info.err){
            throw err;
        }
        else{
            var rows=info.data;
            var cars={};
            for(var i=0;i<rows.length;i++){
                var tagInfo=rows[i];
                var carId=tagInfo.carId;
                var serTag=tagInfo.serTag;
                var chlTag=tagInfo.chlTag;
                var ageTag=tagInfo.ageTag;
                var milTag=tagInfo.milTag;
                var preTag=tagInfo.preTag;
                var timeTaeg=tagInfo.timeTag;
                var fireWeek=tagInfo.fireWeek;
                var carInfo=cars[carId];
                if(!carInfo){
                    carInfo={};
                    if(serTag)carInfo.serTag='ser'+serTag;
                    if(chlTag)carInfo.chlTag='chl2';
                    if(ageTag)carInfo.ageTag=ageTag/5>0?'age5':'age'+ageTag;
                    carInfo.count=0;
                    carInfo.mileage=0;
                    carInfo.preCount=0;
                    carInfo.time1=0;
                    carInfo.time2=0;
                    carInfo.time3=0;
                    cars[carId]=carInfo;
                }
                carInfo.count+=fireWeek?1:null;
                carInfo.mileage+=milTag;
                carInfo.preCount+=preTag;
                if(fireWeek>1&&fireWeek<7){
                    if(timeTag>=6&&timeTag<10){
                        carInfo.time1++;
                    }
                    else if(timeTag>=10&&timeTag<20){
                        carInfo.time2++;
                    }
                    else{
                        carInfo.time3++;
                    }
                }
                else{
                    carInfo.time3++;
                }
            }
            sql="select t.id,t.code from t_tag t";
            var tagMap={};
            dao.findBySql(sql,[],function(info){
                if(info.err){
                    throw err;
                }
                else{
                    var rows=info.data;
                    var sqls=["truncate table t_car_tag"];
                    var args=[{}];
                    for(i=0;i<rows.length;i++){
                        var code=rows[i].code;
                        var tagId=rows[i].id;
                        tagMap[code]=tagId;
                    }
                    for(var key in cars){
                        var carTag=cars[key];
                        if(carTag.serTag){
                            sqls.push("insert into t_car_tag set ?");
                            args.push({tag_id:tagMap[carTag.serTag],car_id:key});
                        }
                        if(carTag.chlTag){
                            sqls.push("insert into t_car_tag set ?");
                            args.push({tag_id:tagMap[carTag.chlTag],car_id:key});
                        }
                        if(carTag.ageTag){
                            sqls.push("insert into t_car_tag set ?");
                            args.push({tag_id:tagMap[carTag.ageTag],car_id:key});
                        }
                        var tag=getTimeTag(carTag);
                        if(tag!=''){
                            sqls.push("insert into t_car_tag set ?");
                            args.push({tag_id:tagMap[tag],car_id:key});
                        }
                        tag=getMilTag(carTag);
                        if(tag!=''){
                            sqls.push("insert into t_car_tag set ?");
                            args.push({tag_id:tagMap[tag],car_id:key});
                        }
                        tag=getRateTag(carTag);
                        if(tag!=''){
                            sqls.push("insert into t_car_tag set ?");
                            args.push({tag_id:tagMap[tag],car_id:key});
                        }
                        tag=getPreTag(carTag);
                        if(tag!=''){
                            sqls.push("insert into t_car_tag set ?");
                            args.push({tag_id:tagMap[tag],car_id:key});
                        }
                    }
                    dao.executeBySqls(sqls,args,function(info){
                        if(info.err){
                            info.message='计算标签失败';
                            cb(info);
                        }
                        else{
                            cb(info);
                        }
                    });
                }
            });
        }
    });
}


function _buildObdInfoByMonth(cb){
    var sql="select d.obdCode," +
        "c.s4_id as s4Id," +
        "count(d.id) as sumCount,        " +
        "round(sum(d.currentMileage)/1000,2) as sumMileage," +
        "round(sum(d.currentAvgOilUsed*d.currentMileage/100)/sum(d.currentMileage),2) as avgOil," +
        "round(3.6*sum(d.currentMileage)/sum(d.runTime),2) as avgSpeed " +
        "from t_obd_drive d inner join t_car c on c.obd_code=d.obdCode " +
        "where d.carStatus in(3,4) " +
        "and d.fireTime>=? and d.fireTime<? " +
        "group by d.obdCode,c.s4_id";
    var args=getMonthStartAndEnd();
    var year=args[0].getFullYear();
    var month=args[0].getMonth()+1;
    dao.findBySql(sql,args,function(info){
        if(info.err){
            console.log('统计Obd信息时出现错误:'+info.err);
        }
        else{
            var rows=info.data;
            sql="insert into t_obd_statistics set ?";
            var sqlArray=[];
            var args=[];
            var s4Total={};
            var avgCountTotal=0;
            var avgMileageTotal=0.0;
            var avgOilTotal=0.0;
            var avgSpeedTotal=0.0;
            for(var i=0;i<rows.length;i++){
                sqlArray.push(sql);
                var obdCode=rows[i].obdCode;
                var s4Id=rows[i].s4Id;
                var countMth=rows[i].sumCount;
                var mileageMth=rows[i].sumMileage;
                var avgOilMth=rows[i].avgOil;
                var speedMth=rows[i].avgSpeed;
                var obdSta={
                    obdCode:obdCode,
                    s4Id:s4Id,
                    year:year,
                    month:month,
                    countMth:countMth,
                    mileageMth:mileageMth,
                    avgOilMth:avgOilMth,
                    speedMth:speedMth,
                    type:1
                };
                args.push(obdSta);
                var s4Info=s4Total[s4Id];
                if(s4Info){
                    s4Info.count++;
                    s4Info.countMth+=countMth;
                    s4Info.mileageMth+=mileageMth;
                    s4Info.avgOilMth+=avgOilMth;
                    s4Info.speedMth+=speedMth;
                }
                else{
                    s4Total[s4Id]={
                        count:1,
                        countMth:countMth,
                        mileageMth:mileageMth,
                        avgOilMth:avgOilMth,
                        speedMth:speedMth
                    };
                }
            }
            for(var s4Id in s4Total){
                var s4Info=s4Total[s4Id];
                var totalArgs={
                    obdCode:year+'年'+month+'月小计',
                    s4Id:s4Id,
                    year:year,
                    month:month,
                    countMth:Math.round(s4Info.countMth/s4Info.count*100)/100,
                    mileageMth:Math.round(s4Info.mileageMth/s4Info.count*100)/100,
                    avgOilMth:Math.round(s4Info.avgOilMth/s4Info.count*100)/100,
                    speedMth:Math.round(s4Info.speedMth/s4Info.count*100)/100,
                    type:2
                };
                sqlArray.push(sql);
                args.push(totalArgs);
            }
            dao.executeBySqls(sqlArray,args,function(info){
                if(info.err){
                    console.log('统计OBD数据失败：'+JSON.stringify(info));
                }
                else{
                    console.log('统计OBD数据成功：'+JSON.stringify(info));
                }
                cb(info);
            });
        }
    });
}

exports.buildTags=function(req,res){
    _buildTags(function(info){
        res.json(info);
    });
}
exports.buildObdInfoByMonth=function(req,res){
    _buildObdInfoByMonth(function(info){
        res.json(info);
    });
}
//_buildTags(function(){});
//_buildObdInfoByMonth(function(){});