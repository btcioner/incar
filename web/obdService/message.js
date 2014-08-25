/**
 * Created by LM on 14-4-18.
 */
var http = require("http");
var dao=require("../config/dao");
var detectionMap={};
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
    var query=req.query;
    var user=query.user;
    getSimByUser(user,function(err,obdCode,sim){
        if(err){
            res.json(err);
        }
        else{
            sendMessage(sim,0x1621,'',function(result){
                if(result.status=='success'){
                    console.log(obdCode+"车辆检测短信发送成功，等待数据服务器回复...");
                    res.json({status:'success',obdCode:obdCode});
                }
                else{
                    console.log(obdCode+"车辆检测短信发送失败...");
                    res.json({status:'failure'});
                }
            });
        }
    });
};

//接收获取OBD检测信息短信的回复数据   1621
/*
 一切正常——您的车各项指标都很正常。
 可放心行驶——您的车有一些小问题，但不影响行驶。
 建议保养——您的车存在安全隐患，需要保养。
 须立即检修——您的车需要立即检修，不适合继续行驶。
 检测失败——当前车辆情况不适合进行检测，请稍后重试！
 检测失败——无法获取车辆检测信息，请确保您的车在点火状态下。
 */
function getCurrentDetection(detection){
    var level=detection.faultLevel;
    if(level===0x00){
        detection.result='一切正常';
        detection.title='您的车各项指标都很正常';
    }
    if(level===0x01){
        detection.result='可放心行驶';
        detection.title='您的车有一些小问题，但不影响行驶';
    }
    if(level===0x02){
        detection.result='建议保养';
        detection.title='您的车存在安全隐患，需要保养';
    }
    if(level===0x03){
        detection.result='须立即检修';
        detection.title='您的车需要立即检修，不适合继续行驶';
    }
    if(level===0xFF){
        detection.result='检测失败';
        detection.title='当前车辆情况不适合进行检测，请稍后重试';
    }
    return detection;
}
//收取OBD检测信息的短信回复          1621
exports.carDetectionReceive=function(req,res){
    var obdCode=req.params.obdCode;
    var detection=req.body.dataString;

    if(obdCode&&detection){
        var detInfo=getCurrentDetection(detection);
        detectionMap[obdCode+'|'+0x1621]={
            status:'success',
            obdCode:obdCode,
            result:detInfo.result,
            current:detInfo
        };
        console.log("收到："+JSON.stringify(detInfo));
        res.json({status:'success'});
    }
    else{
        console.log('obdCode:'+obdCode+'   detection:'+detection+'   数据传输有误');
        res.json({status:'failure'});
    }
};
//轮询获得检测结果
exports.getCurrentDetection=function(req,res){
    var obdCode=req.params.obdCode;
    var detInfo=detectionMap[obdCode+'|'+0x1621];
    if(detInfo){
        res.json(detInfo);
        delete detectionMap[obdCode+'|'+0x1621];
    }
    else{
        res.json({status:'wait'});
    }
};
//获得所有检测结果
exports.getAllDetection=function(req,res){
    var query=req.query;
    var user=query.user;
    var sql="select c.obd_code as obdCode,c.sim_number as sim,d.fault,d.faultLevel,faultCount,faultShow,createTime " +
        "from t_account a " +
        "inner join t_car_user cu on cu.acc_id=a.id " +
        "inner join t_car c on cu.car_id=c.id " +
        "left join t_car_detection d on d.obdCode=c.obd_code " +
        "where a.wx_oid=? and d.faultLevel<=? " +
        "order by d.createTime desc";
    dao.findBySql(sql,[user,3],function(info){
        if(info.err){
            res.json({status:'failure',
                result:'初始化失败',
                message:'无法获取检测的车辆信息！'});
        }
        else{
            var rows=info.data;
            if(rows.length>0){
                var lastDetection=rows[0];
                var obdCode=lastDetection.obdCode;
                var sim=lastDetection.sim;
                var history=[];
                for(var i=1;i<rows.length;i++){
                    var det=rows[i];
                    history.push({
                        faultLevel:det.faultLevel,
                        faultShow:det.faultShow,
                        createTime:lastDetection.createTime
                    });
                }
                var detInfo=detectionMap[obdCode+'|'+0x1621];
                if(detInfo){
                    delete detectionMap[obdCode+'|'+0x1621];
                }
                else{
                    detInfo={
                        status:'success',
                        obdCode:obdCode,
                        result:"<<<点击左侧按钮开始检测",
                        current:{
                            faultLevel:lastDetection.faultLevel,
                            fault:lastDetection.fault,
                            createTime:lastDetection.createTime
                        }
                    }
                }
                detInfo.history=history;
                res.json(detInfo);
            }
            else{
                console.log("远程检测时查找用户OBD信息失败,用户没有绑定车辆");
                res.json({
                    status:'failure',
                    result:'初始化失败',
                    message:'用户尚未绑定任何车辆,请先注册'
                });
            }
        }
    });
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
