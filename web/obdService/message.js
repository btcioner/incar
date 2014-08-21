/**
 * Created by LM on 14-4-18.
 */
var http = require("http");
var queryString=require('querystring');
var dao=require("../config/dao");
var MESSAGE_SERVER_HOST='localhost';
var MESSAGE_SERVER_PORT=1234;
var MESSAGE_SERVER_PATH='/message/send/';
function getSimByUser(userStr,cb){
    var sql="select c.obd_code as obdCode,c.sim_number as sim " +
        "from t_account a " +
        "inner join t_car_user cu on cu.acc_id=a.id " +
        "inner join t_car c on cu.car_id=c.id " +
        "where a.wx_oid=?";
    dao.findBySql(sql,[userStr],function(info){
        if(info.err){
            console.log("车辆检测时查找用户OBD信息出现错误："+info.err);
            cb({status:'failure',message:'获取车辆信息失败'});
        }
        else{
            var rows=info.data;
            if(rows.length>0){
                var obdCode= rows[0].obdCode;
                var sim=rows[0].sim;
                cb(null,obdCode,sim);
            }
            else{
                console.log("车辆检测时查找用户OBD信息失败,用户没有绑定车辆");
                cb({status:'failure',message:'获取车辆信息失败'});
            }
        }
    });
}
function sendMessage(sim,cmd,data,cb){
    var opt = {
        method: "post",
        host: MESSAGE_SERVER_HOST,
        port: MESSAGE_SERVER_PORT,
        path: MESSAGE_SERVER_PATH+sim+'/'+cmd,
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data)
        }
    };
    var req = http.request(opt, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (results) {
            console.log(JSON.stringify(results));
            var result=JSON.parse(results);
            cb(result);
        });
    });
    req.on('error', function(e) {
        console.log("连接短信服务器失败：" + e.message);
    });
    req.write(data);
    req.end();
}
//发送获取OBD检测信息的短信          1621
exports.carDetectionSend=function(req,res){
    console.log(1);
    var query=req.query;
    var user=query.user;
    getSimByUser(user,function(err,obdCode,sim){
        if(err){
            res.json(err);
        }
        else{
            console.log(2);
            sendMessage(sim,0x1621,'',function(result){
                if(result.status=='success'){
                    console.log(obdCode+"车辆检测短信发送成功，等待数据服务器回复...");
                }
                else{
                    console.log(obdCode+"车辆检测短信发送失败...");
                }
            });
        }
    });
};
//接收获取OBD检测信息短信的回复数据   1621
exports.carDetectionReceive=function(req,res){

    console.log(req.body);
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
