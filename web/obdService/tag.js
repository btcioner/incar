/**
 * Created by LM on 14-5-27.
 */
var dao=require("../config/dao");

/**
 * 获得当前4S店所有标签大类及其标签的相关信息
 */
exports.tagList= function(req,res){
    var brand=req.params.brand;
    var s4Id=req.params.s4Id;
    var sql="select g.id as groupId,g.name as groupName,g.type," +
        "t.id as tagId,t.name as tagName " +
        "from t_tag_group g " +
        "left join t_tag t on t.groupId=g.id " +
        "where g.id in (2,3,4,5,6,7) " +
        "or g.id=1 and subStr(t.code,4,instr(t.code,'-')-4)=? " +
        "or g.id=8 and t.s4Id=? ";
    dao.findBySql(sql,[brand,s4Id],function(info){
        if(info.err){
            res.json(info);
        }
        else{
            var rows=info.data;
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
            var tagList=[];
            for(var key in list){
                tagList.push(list[key]);
            }
            info.data=tagList
            res.json(info);
        }

    });
}
/**
 * 获得当前4S店所有标签大类及其标签的相关信息(系统标签)
 */
exports.tagListSystem= function(req,res){
    var brand=req.params.brand;
    var sql="select g.id as groupId,g.name as groupName," +
        "t.id as tagId,t.name as tagName " +
        "from t_tag_group g " +
        "left join t_tag t on t.groupId=g.id " +
        "where g.type=? and( g.id>1 or g.id=1 and subStr(t.code,4,instr(t.code,'-')-4)=?)";
    dao.findBySql(sql,[0,brand],function(info){
        if(info.err){
            res.json(info);
        }
        else{
            var rows=info.data;
            var list={};
            for(var i=0;i<rows.length;i++){
                var groupId=rows[i].groupId;
                var groupName=rows[i].groupName;
                var tagId=rows[i].tagId;
                var tagName=rows[i].tagName;
                var group=list[groupId];
                if(group){
                    group['tags'].push({tagId:tagId,tagName:tagName});
                }
                else{
                    group={groupId:groupId,groupName:groupName,tags:[{tagId:tagId,tagName:tagName}]};
                    list[groupId]=group;
                }
            }
            var tagList=[];
            for(var key in list){
                tagList.push(list[key]);
            }
            info.data=tagList;
            res.json(info);
        }

    });
}
/**
 * 获得当前4S店所有标签大类及其标签的相关信息(自定义标签)
 */
exports.tagListCustom= function(req,res){
    var s4Id=req.params.s4Id;
    var query=req.query;
    var page=parseInt(query['page']);
    var pageSize=parseInt(query['pageSize']);
    var sql="select t.id as tagId,t.name as tagName," +
        "t.createTime as createTime,t.creator as creator " +
        "from t_tag t " +
        "left join t_tag_group g on t.groupId=g.id " +
        "where g.type>? and t.s4Id=?";
    var args=[0,s4Id];
    dao.findBySqlForPage(sql,args,function(info){
        res.json(info);
    },(page-1)*pageSize,pageSize);
}
/**
 * 通过标签及用户信息查询
 */
exports.searchForUsers= function(req,res){
    var s4Id=req.params.s4Id;
    var query=req.query;
    var tagCode=query.tagCode;
    var nickName=query.nickName;
    var userPhone=query.userPhone;
    var license=query.license;
    var brand=query.brand;
    var groupId=query.groupId;
    var series=query.series;
    var page=parseInt(query.page);
    var pageSize=parseInt(query['pageSize']);
    var sql="select distinct c.id as carId,c.obd_code as obdCode," +
        "c.series as series,c.brand as brand," +
        "d.series as seriesName,d.brand as brandName," +
        "c.license as license,u.id as accountId," +
        "u.nick as nickName,u.phone as phone " +
        "from t_car c " +
        "left join t_car_user cu on cu.car_id=c.id " +
        "left join t_account u on cu.acc_id=u.id " +
        "left join t_car_tag ct on ct.car_id=c.id " +
        "left join t_tag t on t.id=ct.tag_id " +
        "left join t_car_dictionary d on d.brandCode=c.brand and d.seriesCode=c.series " +
        "where c.s4_id=?";
    var args=[s4Id];
    if(tagCode){
        sql+=" and t.code=?";
        args.push(tagCode);
    }
    else{
        if(groupId){
            if(groupId===-1){
                sql+=" and ct.tag_id is null";
            }
            else{
                sql+=" and t.groupId=?";
                args.push(groupId);
            }
        }
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
    if(series){
        sql+=" and c.series=?";
        args.push(series);
    }
    dao.findBySqlForPage(sql,args,function(info){
        res.json(info);
    },(page-1)*pageSize,pageSize);
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
    dao.findBySql(sql,[carId],function(info){
        if(info.err){
            res.json(info);
        }
        else{
            var rows=info.data;
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
            info.data=list;
            res.json(info);
        }

    });
}

/**
 * 给车打标签
 */
exports.markTags= function(req,res){
    var carId=req.body['carId'];
    var tagStr=req.body['tags'].toString();
    var tags=tagStr?tagStr.split(","):[];
    var sqlList=["delete from t_car_tag where car_id=? and tag_id in(" +
        "select t.id from t_tag t inner join t_tag_group tg on tg.id=t.groupId and tg.type>0)"];
    var args=[[carId]];
    for(var i=0;i<tags.length;i++){
        if(tags[i]){
            sqlList.push("insert into t_car_tag set ?");
            args.push({car_id:carId,tag_id:tags[i]});
        }
    }
    dao.executeBySqls(sqlList,args,function(info){
        res.json(info);
    });
}
/**
 * 添加自定义标签
 */
exports.addTag= function(req,res){
    var body=req.body;
    var s4Id=body['s4Id'];
    var groupId=body['groupId'];
    var tagName=body['tagName'];
    var description=body['description'];
    var code=body['code'];
    var active=body['active'];
    var createTime=new Date();
    var creator=body['creator'];
    if(!groupId)groupId=8;
    if(!description)description='';
    if(!code)code='';
    if(!active)active=1;
    if(!creator)creator='';
    var sql="insert into t_tag set ?";
    var args={
        s4Id:s4Id,
        groupId:groupId,
        name:tagName,
        description:description,
        code:code,
        active:active,
        createTime:createTime,
        creator:creator
    };
    dao.insertBySql(sql,args,function(info){
        res.json(info);
    });
}
/**
 * 删除自定义标签
 */
exports.delTag= function(req,res){
    var tagId=req.params['tagId'];
    var sqlList=["delete from t_tag where id=?","delete from t_car_tag where tag_id=?"];
    var args=[[tagId],[tagId]];
    dao.executeBySqls(sqlList,args,function(info){
        res.json(info);
    });
}

/**
 * 通过复合标签查询
 */
exports.searchByTags= function(req,res){
    var tags=req.params.tags;
    if(tags){
        var tagArray=tags.toString().split(",");
        var sql="select g.id as groupId,g.type as groupType,t.id as tagId " +
            "from t_tag_group g " +
            "left join t_tag t on t.groupId=g.id"
        dao.findBySql(sql,[],function(info){
            if(info.err){
                res.json(info);
            }
            else{
                var rows=info.data;
                var tagMap={};
                for(var i=0;i<rows.length;i++){
                    var groupId=rows[i].groupId;
                    var tagId=rows[i].tagId;
                    var type=rows[i].groupType;
                    tagMap[tagId]={groupId:groupId,type:type};
                }
                var tagList={};
                for(i=0;i<tagArray.length;i++){
                    var tagId=tagArray[i];
                    var tagInfo=tagMap[tagId];
                    if(!tagInfo)continue;
                    var groupId=tagInfo.groupId;
                    var type=tagInfo.type;

                    var t=tagList[groupId];

                    if(!t){
                        t={type:type,tags:[]};
                        tagList[groupId]=t;
                    }
                    t.tags.push(tagId);
                }
                var sqlBuild=buildSearchSql(tagList);
                sql=sqlBuild.sql;
                var args=sqlBuild.args;
                if(args.length>0){
                    dao.findBySql(sql,args,function(info){
                        res.json(info);
                    });
                }
                else{
                    res.json({status:'failure'});
                }
            }
        });
    }
    else{
        res.json({status:'failure'});
    }
}

function buildSearchSql(tagList){
    //tagList={1:{type:0,tags:[2,3,4]},2:{type:null,tags:[]},3:{type:0,tags:[5,6,0]},4:{type:1,tags:[8]}};
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
    return {sql:sql,args:args};
}
