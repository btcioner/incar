/**
 * Created by LM on 14-7-9.
 */
var dao=require("../config/dao");

exports.loadTravelReport=function(req,res){
    var param=req.params;
    var obdCode=param.obdCode;
    var s4Id=param.s4Id;
    var sql="select distinct * FROM t_obd_statistics s " +
        "where s.s4Id=? and (s.obdCode=? or s.type=2) " +
        "order by s.type";
    var args=[s4Id,obdCode];
    dao.findBySql(sql,args,function(info){
        res.json(info);
    });
};