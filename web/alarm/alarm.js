/**
 * Created by LM on 14-6-15.
 */

var dao=require("../core/dataAccess/dao");
//碰撞模拟数据
//AA 55 00 77 FF 89 00 05 16 02 57 46 51 30 30 30 31 31 38 31 34 00 00 00 00 12 31 35 00 57 30 4C 30 5A 43 46 36 39 33 31 30 38 33 39 31 41 00 32 30 31 34 2D 30 36 2D 31 31 20 31 36 3A 34 36 3A 35 39 00 02 30 00 30 00 45 31 31 34 2E 34 30 30 30 30 32 2C 4E 33 30 2E 34 37 38 39 30 31 2C 30 2C 32 30 31 34 2D 30 36 2D 31 31 00 31 36 3A 34 36 3A 31 30 2C 31 00 16 19
exports.allCollideRemind=function(req,res){
    var s4Id=req.params.s4Id;
    var query=req.query;
    var page=parseInt(query['page']);
    var pageSize=parseInt(query['pageSize']);
    var remindStatus=req.query.remindStatus;
    var remindType=1;
    var sql="select r.id,u.nick,u.phone,c.license,c.brand as brandCode,c.series as seriesCode,cd.brand,cd.series,r.remindType,r.remindStatus,r.createTime " +
        "from t_remind r " +
        "left join t_car c on r.obdCode=c.obd_code " +
        "left join t_car_user cu on c.id=cu.car_id " +
        "left join t_account u on cu.acc_id=u.id " +
        "left join t_car_dictionary cd on c.brand=cd.brandCode and c.series=cd.seriesCode " +
        "where c.s4_id=? and r.remindType=?";
    var args=[s4Id,remindType];
    if(remindStatus){
        sql+=" and r.remindStatus=?";
        args.push(remindStatus);
    }
    dao.findBySqlForPage(sql,args,function(pageInfo){
        res.json(pageInfo);
    },page,pageSize);
}

exports.careCollideRemind=function(req,res){
    var remindId=req.params['remindId'];
    if(!remindId){
        res.json({status:'failure',message:'无法获取提醒Id'});
    }
    var sql="update t_remind set remindStatus=? where id=?";
    var args=[2,remindId];
    dao.executeBySql([sql],[args],function(err){
        if(err){
            res.json({status:'failure'});
        }
        else{
            res.json({status:'success'});
        }
    });
}