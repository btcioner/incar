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
                console.log("OK");
                res.json({status:'success'});
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
                group={groupId:groupId,groupName:groupName,type:type,tags:[{tagId:tagId,tagName:tagName}]};
                list[groupId]=group;
            }
        }
        console.log(JSON.stringify(list));
        var tagList=[];
        for(var key in list){
            tagList.push(list[key]);
        }
        res.json(tagList);
    });
}

/**
 * 通过标签及用户信息查询
 */
exports.searchForUsers= function(req,res){
    var body=req.body;
    var tagId=body.tagId;
    var nickName=body.nickName;
    var userPhone=body.userPhone;
    var license=body.license;
    var brand=body.brand;
    var page=parseInt(body.page);
    var pageSize=parseInt(body['pageSize']);
    var sql="select distinct c.id as carId,c.obd_code as obdCode," +
        "c.series as series,c.brand as brand," +
        "c.license as license,u.id as accountId," +
        "u.nick as nickName,u.phone as phone " +
        "from t_car c " +
        "left join t_car_user cu on cu.car_id=c.id " +
        "left join t_account u on cu.acc_id=u.id " +
        "left join t_car_tag ct on ct.car_id=c.id " +
        "where 1=1";
    var args=[];
    if(tagId){
        sql+=" and ct.tag_id=?";
        args.push(tagId);
    }
    if(nickName){
        sql+=" and u.nick like ?";
        args.push("%"+nickName+"%");
    }
    if(userPhone){
        sql+=" and u.phone like ?";
        args.push("%"+userPhone+"%");
    }
    if(license){
        sql+=" and c.license like ?";
        args.push("%"+license+"%");
    }
    if(brand){
        sql+=" and c.brand=?";
        args.push(brand);
    }
    if(page&&pageSize){
        var sqlCount="select count(t.carId) as rowCount from ("+sql+") as t";
        var sqlPage="select * from ("+sql+") as t limit ?,?";
        dao.findBySql(sqlCount,args,function(rows){
            var rowCount=rows[0]['rowCount'];
            args.push((page-1)*pageSize);
            args.push(pageSize);
            dao.findBySql(sqlPage,args,function(rows){
                res.json({status:'success',rowCount:rowCount,data:rows});
            });
        });
    }
    else{
        dao.findBySql(sql,args,function(rows){
            res.json({status:'success',rowCount:rows.length,data:rows});
        });
    }
}
/**
 * 查询某车的标签
 */
exports.getTagsByCarId= function(req,res){
    var carId=req.params['carId'];
    var sql="select tg.type as tagType,t.id as tagId,t.name as tagName " +
        "from t_tag t " +
        "left join t_tag_group tg on tg.id=t.groupId " +
        "left join t_car_tag ct on ct.tag_id=t.id " +
        "where ct.car_id=?";
    dao.findBySql(sql,[carId],function(rows){
        var type0=[];
        var type1=[];
        for(var i=0;i<rows.length;i++){
            var type=rows[i].tagType;
            var tagId=rows[i].tagId;
            var tagName=rows[i].tagName;
            if(type===0){
                type0.push({tagId:tagId,tagName:tagName});
            }
            else{
                type1.push({tagId:tagId,tagName:tagName});
            }
        }
        var list={systemTag:type0,customTag:type1};
        console.log(list);
        res.json(list);
    });
}
/**
 * 给车打标签
 */
exports.markTags= function(req,res){
    var carId=req.params['carId'];
    var tags=req.params['tags'].split(",");
    var sqlList=["delete from t_car_tag where car_id=? and tag_id in(" +
        "select t.id from t_tag t inner join t_tag_group tg on tg.id=t.groupId " +
        "where tg.type>1)"];
    var args=[[carId]];
    for(var i=0;i<tags.length;i++){
        sqlList.push("insert into t_car_tag set ?");
        args.push({car_id:carId,tag_id:tags[i]});
    }
    dao.executeBySql(sqlList,args,function(){
        console.log("OK");
    });
}
/**
 * 添加自定义标签
 */
exports.addTag= function(req,res){
    var groupId=req.params['groupId'];
    var tagName=req.params['tagName'];
    var description=req.params['description'];
    var code=req.params['code'];
    var active=req.params['active'];
    if(!groupId)groupId=8;
    if(!description)description='';
    if(!code)code='';
    if(!active)active=1;
    var sql="insert into t_tag set ?";
    var args={groupId:groupId,name:tagName,description:description,code:code,active:active};
    dao.insertBySql(sql,args,function(info,tag){
        tag.id=info.insertId;
        console.log("成功添加标签:"+JSON.stringify(tag));
        res.json({status:'success'});
    });
}
/**
 * 删除自定义标签
 */
exports.delTag= function(req,res){
    var tagId=req.params['tagId'];
    var sqlList=["delete from t_tag where id=?","delete from t_car_tag where tag_id=?"];
    var args=[[tagId],[tagId]];
    dao.executeBySql(sqlList,args,function(){
        res.json({status:'success'});
    });
}

/**
 * 通过复合标签查询
 */
exports.searchByTags= function(req,res){
    var tags=req.params.tags.split(",");
    if(tags.length>0){
        var sql="select g.id as groupId,g.type as groupType,t.id as tagId " +
            "from t_tag_group g " +
            "left join t_tag t on t.groupId=g.id"
        dao.findBySql(sql,[],function(rows){
            var tagMap={};
            for(var i=0;i<rows.length;i++){
                var groupId=rows[i].groupId;
                var tagId=rows[i].tagId;
                var type=rows[i].groupType;
                tagMap[tagId]={groupId:groupId,type:type};
            }
            var tagList={};
            for(i=0;i<tags.length;i++){
                var tagId=tags[i];
                var tagInfo=tagMap[tagId];
                var groupId=tagInfo.groupId;
                var type=tagInfo.type;
                var tagInfo=tagList[groupId];

                if(!tagInfo){
                    tagInfo={type:type,tags:[]};
                    tagList[groupId]=tagInfo;
                }
                tagInfo.tags.push(tagId);
            }
            var sqlBuild=buildSearchSql(tagList);
            sql=sqlBuild.sql;
            var args=sqlBuild.args;
            dao.findBySql(sql,args,function(rows){
                res.json(rows);
            });

        });
    }
    else{
        res.json({status:'failure'});
    }
}

function buildSearchSql(tagList){
    tagList={1:{type:0,tags:[2,3,4]},2:{type:null,tags:[]},3:{type:0,tags:[5,6,0]},4:{type:1,tags:[8]}};
    var sqlStart="select distinct c.id as carId,c.obd_code as obdCode,u.id as accountId from t_car c " +
        "left join t_car_user cu on cu.car_id=c.id " +
        "left join t_account u on cu.acc_id=u.id ";
    var sqlJoin="";
    var sqlWhere="where 1=1 ";
    var sqlCustomerTag="";
    var args=[];
    for(var key in tagList){
        var type=tagList[key].type;
        var tags=tagList[key].tags;
        if(tags&&tags.length>0){
            sqlJoin+="left join t_car_tag ct"+key+" on ct"+key+".car_id=c.id ";
            var sqlTemp=" ct"+key+".car_id in (";
            for(var i=0;i<tags.length;i++){
                if(i>0){
                    sqlTemp+=",?";
                }
                else{
                    sqlTemp+="?";
                }
                args.push(tags[i]);
            }
            sqlTemp+=")";
            if(type>0){
                sqlCustomerTag+=" or"+sqlTemp;
            }
            else{
                sqlWhere+=" and"+sqlTemp;
            }
        }
    }
    var sql=sqlStart+sqlJoin+sqlWhere+sqlCustomerTag;
    console.log(sql);
    return {sql:sql,args:args};
}

//buildSearchSql({});















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