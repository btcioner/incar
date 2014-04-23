/**
 * Created by LM on 14-4-18.
 */
var http = require("http");
var queryString=require('querystring');
var dao=require("../core/dataAccess/dao");
var opt = {
    host: "localhost",
    port: 1234
};
function getSimByObdCode(obdCode,cb){
    var sql="select sim_number as sim from t_car_info where obdCode=?";
    dao.findBySql(sql,[obdCode],function(rows){
        if(rows.length>0){
            var sim=rows[0].sim;
            cb(sim);
        }
    });
}
//发送获取OBD检测信息的短信          1622
exports.obdTestSend=function(req,res){
    var obdCode=req.params.obdCode;
    var sql= "select distinct code from t_car";
    var paramArray=[];
    dao.findBySql(sql,[],function(rows){
        for(var i=0;i<rows.length;i++){
            var cJson=rows[i];
            paramArray.push(cJson.code);
        }
        for(var j=0xFE00;j<=0xFE1A;j++){
            paramArray.push(j);
        }
        getSimByObdCode(obdCode,function(sim){
            opt.method="post";
            opt.path="/message/send/"+sim+"/5665";
            var data ={idArray:JSON.stringify(paramArray)};
            data = queryString.stringify(data);
            var req = http.request(opt, function (serverFeedback) {});
            req.write(data);
            req.end();
        });
    });
};
//接收获取OBD检测信息短信的回复数据   1621
exports.obdTestReceive=function(req,res){};
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
