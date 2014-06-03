/**
 * Created by LM on 14-5-27.
 */
var dao=require("../core/dataAccess/dao");
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
exports.buildTags=function(req,res){
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
    dao.findBySql(sql,args,function(rows){
        var cars={};
        for(var i=0;i<rows.length;i++){
            var tagInfo=rows[i];
            var carId=tagInfo.carId;
            var serTag=tagInfo.serTag;
            var chlTag=tagInfo.chlTag;
            var ageTag=tagInfo.ageTag;
            var milTag=tagInfo.milTag;
            var preTag=tagInfo.preTag;
            var timeTag=tagInfo.timeTag;
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
        dao.findBySql(sql,[],function(rows){
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
            dao.executeBySql(sqls,args,function(){
                res.write(JSON.stringify({status:'success'}));
            });
        });
    });

}
//updateTagForUser();
/**
 * 获得当前4S店所有标签大类及其标签的相关信息
 */
exports.tagList= function(req,res){
    var brand=req.params.brand;
    var sql="select g.id as groupId,g.name as groupName,g.type," +
        "t.id as tagId,t.name as tagName " +
        "from t_tag_group g " +
        "left join t_tag t on t.groupId=g.id " +
        "where g.id>1 or g.id=1 and subStr(t.code,4,instr(t.code,'-')-4)=?";
    dao.findBySql(sql,[brand],function(rows){
        var list={};
        for(var i=0;i<rows.length;i++){
            var groupId=rows[i].groupId;
            var groupName=rows[i].groupName;
            var tagId=rows[i].tagId;
            var tagName=rows[i].tagName;
            var type=rows[i].type;
            var group=list[groupId];
            if(group){
                group['tags'].push({tagId:tagId,tagName:tagName});
            }
            else{
                group={groupName:groupName,type:type,tags:[{tagId:tagId,tagName:tagName}]};
                list[groupId]=group;
            }
        }
        console.log(JSON.stringify(list));
        res.write(JSON.stringify(list));
    });
}




















var tagGroup=[
    {name:"车系",description:"车系",type:0},
    {name:"渠道",description:"车主的来源",type:0},
    {name:"车龄",description:"车的驾驶年限",type:0},
    {name:"用途",description:"标识车是商用还是家用",type:0},
    {name:"用车时段",description:"用来描述车主的用车时段",type:0},
    {name:"用车频率",description:"用来描述车主的用车频率",type:0},
    {name:"驾驶偏好",description:"用来描述车主的驾驶偏好",type:0}
];
function initTagGroup(){
    var sql="insert into t_tag_group set ?";
    for(var i=0;i<tagGroup.length;i++){
        dao.insertBySql(sql,tagGroup[i],function(info,args){
            args.id=info.insertId;
            console.log(args);
        });
    }
}
function initCarBrandForTag(){
    var sql="select * from t_car_dictionary";
    dao.findBySql(sql,[],function(rows){
        for(var i=0;i<rows.length;i++){
            var cd=rows[i];
            var code='ser'+cd.brandCode+'-'+cd.seriesCode;
            var name=cd.series;
            var description=cd.description;
            var tag={
                code:code,
                name:name,
                description:name,
                active:1,
                groupId:1
            };
            sql="insert into t_tag set ?";
            dao.insertBySql(sql,tag,function(info,args){
                args.id=info.insertId;
                console.log("成功添加车系标签："+JSON.stringify(args));
            });
        }
    });
}
function initOtherTag(){
    var tags=[
        {code:'chl1',name:"APP",description:"手机客户端",active:1,groupId:6},
        {code:'chl2',name:"微信",description:"微信端",active:1,groupId:6},
        {code:'chl3',name:"电话",description:"电话营销",active:1,groupId:6},

        {code:'age0',name:"不到一年",description:"不到一年",active:1,groupId:5},
        {code:'age1',name:"一到两年",description:"一到两年",active:1,groupId:5},
        {code:'age2',name:"两到三年",description:"两到三年",active:1,groupId:5},
        {code:'age3',name:"三到四年",description:"三到四年",active:1,groupId:5},
        {code:'age4',name:"四到五年",description:"四到五年",active:1,groupId:5},
        {code:'age5',name:"五年以上",description:"五年以上",active:1,groupId:5},

        {code:'useTo1',name:"商用",description:"商业用车",active:1,groupId:2},
        {code:'useTo2',name:"家用",description:"家庭用车",active:1,groupId:2},

        {code:'time1',name:"上下班",description:"6:00-10:00,17:00-20:00使用",active:1,groupId:7},
        {code:'time2',name:"工作时",description:"10:00-17:00使用",active:1,groupId:7},
        {code:'time3',name:"非工作时段",description:"20:00-6:00使用",active:1,groupId:7},

        {code:'rate1',name:"极低",description:"很少很少",active:1,groupId:3},
        {code:'rate2',name:"低",description:"很少",active:1,groupId:3},
        {code:'rate3',name:"一般",description:"一般",active:1,groupId:3},
        {code:'rate4',name:"高",description:"很多",active:1,groupId:3},

        {code:'pre1',name:"保守",description:"保守",active:1,groupId:4},
        {code:'pre2',name:"普通",description:"普通",active:1,groupId:4},
        {code:'pre3',name:"豪放",description:"豪放",active:1,groupId:4}
    ];
    var sql="insert into t_tag set ?";
    for(var i=0;i<tags.length;i++){
        dao.insertBySql(sql,tags[i],function(info,args){
            args.id=info.insertId;
            console.log(args);
        });
    }
}
//initTagGroup();
//initCarBrandForTag();
//initOtherTag();