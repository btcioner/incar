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
function getMonthStartAndEnd(year,month){
    var start=new Date();
    if(year)start.setFullYear(year);
    if(month)start.setMonth(month);
    start.setDate(1);
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    var end=new Date(start.valueOf()-1000);
    start.setMonth(start.getMonth()-1);
    return [start,end];
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

function doRecursionForStatistics(startTime,endTime,sqlArray,sqlArgs,cb){
    if(startTime<=endTime){
        var year=startTime.getFullYear();
        var month=startTime.getMonth()+1;
        console.log('开始计算'+year+'年'+month+'月的行程数据');
        var sql="select d.obdCode," +
            "c.s4_id as s4Id," +
            "min(d.fireTime) as markTime," +
            "count(d.id) as sumCount," +
            "round(sum(d.currentMileage)/1000,2) as sumMileage," +
            "round(sum(d.currentAvgOilUsed*d.currentMileage/100)/sum(d.currentMileage),2) as avgOil," +
            "round(3.6*sum(d.currentMileage)/sum(d.runTime),2) as avgSpeed " +
            "from t_obd_drive d inner join t_car c on c.obd_code=d.obdCode " +
            "where d.carStatus in(3,4) " +
            "and d.fireTime>=? and d.fireTime<? and c.s4_id is not null " +
            "group by d.obdCode,c.s4_id";
        var args=getMonthStartAndEnd(year,month);
        dao.findBySql(sql,args,function(info){
            if(info.err){
                console.log('统计Obd信息时出现错误:'+info.err);
            }
            else{
                var rows=info.data;
                sql="insert into t_obd_statistics set ?";
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
                    var markTime=rows[i].markTime;
                    var obdSta={
                        obdCode:obdCode,
                        s4Id:s4Id,
                        year:year,
                        month:month,
                        countMth:countMth?Math.round(countMth):0,
                        mileageMth:mileageMth?Math.round(mileageMth):0,
                        avgOilMth:avgOilMth?Math.round(avgOilMth*10)/10:0.0,
                        speedMth:speedMth?Math.round(speedMth):0,
                        type:1,
                        markTime:markTime
                    };
                    sqlArgs.push(obdSta);
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
                            speedMth:speedMth,
                            markTime:markTime
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
                        countMth:Math.round(s4Info.countMth/s4Info.count),
                        mileageMth:Math.round(s4Info.mileageMth/s4Info.count),
                        avgOilMth:Math.round(s4Info.avgOilMth/s4Info.count*10)/10,
                        speedMth:Math.round(s4Info.speedMth/s4Info.count),
                        type:2,
                        markTime:s4Info.markTime
                    };
                    sqlArray.push(sql);
                    sqlArgs.push(totalArgs);
                }
                console.log(month+":"+JSON.stringify(sqlArgs));
                startTime.setMonth(startTime.getMonth()+1);
                doRecursionForStatistics(startTime,endTime,sqlArray,sqlArgs,cb);
            }
        });
    }
    else{
        console.log("递归结束:");
        if(sqlArray.length>0&&sqlArgs.length>0){
            dao.executeBySqls(sqlArray,sqlArgs,function(info){
                if(info.err){
                    console.log('统计OBD数据失败：'+JSON.stringify(info));
                }
                else{
                    console.log('统计OBD数据成功：'+JSON.stringify(info));
                }
                cb(info);
            });
        }
        else{
            cb({status:"failure",message:"数据已是最新的，请下个自然月再次执行！"});
        }

    }
}
function _buildObdInfoByMonth(cb){
    //获得上个自然月的开始结束时间
    var se=getMonthStartAndEnd();
    //开始时间为统计的终点
    var previewMonthStart=se[0];
    //查询统计表最大标记时间，此为循环的标识量
    var sql="select max(markTime) as lastMarkTime "+
        "from t_obd_statistics os";
    dao.findBySql(sql,[],function(info){
        if(info.err){
            console.log("查询统计表最近标记时间时出现错误："+info.err);
        }
        else{
            var rows=info.data;
            var lastMarkTime=rows[0].lastMarkTime;
            if(lastMarkTime){//如果存在则以当前最大标记时间的下一个月为循环起始值
                lastMarkTime=new Date(lastMarkTime);
                lastMarkTime.setMonth(lastMarkTime.getMonth()+1);
                doRecursionForStatistics(lastMarkTime,previewMonthStart,[],[],cb);
            }
            else{//如果不存在查询OBD行程表找到最早的点火时间为循环起始值
                sql="select min(d.fireTime) minFireTime from t_obd_drive d where d.fireTime>?";
                dao.findBySql(sql,[new Date('2014-01-01 00:00:00')],function(info){
                    if(info.err){
                        console.log("查询OBD行程表最早点火时间时出现错误："+info.err);
                    }
                    else{
                        var lastMarkTime=new Date(info.data[0].minFireTime);
                        //置为当月起始值
                        lastMarkTime.setDate(1);
                        lastMarkTime.setHours(0);
                        lastMarkTime.setMinutes(0);
                        lastMarkTime.setSeconds(0);
                        doRecursionForStatistics(lastMarkTime,previewMonthStart,[],[],cb);
                    }
                });
            }
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
_buildObdInfoByMonth(function(){});