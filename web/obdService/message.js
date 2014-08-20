/**
 * Created by LM on 14-4-18.
 */
var http = require("http");
var queryString=require('querystring');
var dao=require("../config/dao");
var opt = {
    host: "localhost",
    port: 1234
};
function getSimByObdCode(obdCode,cb){
    var sql="select sim_number as sim from t_car where obd_code=?";
    dao.findBySql(sql,[obdCode],function(rows){
        if(rows.length>0){
            var sim=rows[0].sim;
            cb(sim);
        }
    });
}
function getSimByUser(userStr){
    var sql="select c.obd_code as obdCode,c.sim_number as sim " +
        "from t_account a " +
        "inner join t_car_user cu on cu.acc_id=a.id " +
        "inner join t_car c on cu.car_id=c.id " +
        "where a.wx_oid=?";
    dao.findBySql(sql,[userStr],function(info){
        if(info.err){
            console.log("");
        }
    });
}
//发送获取OBD检测信息的短信          1621
exports.carDetectionSend=function(req,res){
    var query=req.query;
    var user=query.user;
    getSimbyUser(obdCode,function(sim){
        var data ={idArray:idArray};
        opt.method="post";
        opt.path="/message/send/"+sim+"/"+0x1622;
        opt.headers={
            "Content-Type": "application/json",
            "Content-Length":Buffer.byteLength(JSON.stringify(data))
        }
        //data = queryString.stringify(data);
        var req = http.request(opt, function (serverFeedback) {});
        req.write(JSON.stringify(data));
        req.end();
    });
};
//接收获取OBD检测信息短信的回复数据   1621
exports.carDetectionReceive=function(req,res){
    console.log(req.body.dataString);
};
//发送获取OBD版本信息的短信         1625
exports.obdVersionSend=function(req,res){};
//接收获取OBD版本信息短信的回复数据   1625
exports.obdVersionReceive=function(req,res){};
//发送设置OBD参数的短信，无回复      1623
exports.setOBDInfo=function(req,res){};
//发送清空累计平均油耗的短信,无回复   1624
exports.clearAvgOilUsed=function(req,res){};
//发送清除故障码的短信
exports.clearFaultCode=function(req,res){};
//发送还原出厂设置的短信
exports.resetDefault=function(req,res){};
