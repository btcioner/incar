/**
 * Created by LM on 14-4-3.
 * OBD编号
 * 微信号(隐式)
 * 用户姓名
 * 电话
 * 品牌系列年款
 * 车牌号
 * 当前行驶里程
 * 业务分析：
 * 零、前提条件：
 * 1、所有4S店应该已经存在于t_service_account表和t_staff_org中，并已启用
 * 2、所有待售和已售OBD设备都已存在于t_device_obd表中
 * 一、全新用户(微信)
 * 1、用户关注4S店公共号
 * 前端：找到4S店并关注
 * 后端：t_wx_user表存入相关数据
 * 2、用户将OBD装入车中并开始使用
 * 前端：无
 * 后端：OBD正常运行，并将产生的数据存入OBD数据基表，管理员端可看到该OBD运行情况
 *      但在用户完成绑定前，用户端和4S店没有任何变化
 * 3、用户进入微站，请求进行OBD绑定
 * 前提：1、每次在微信上进入某4S店时，首先根据用户和4S店的微信号，到t_account_channel表中查询
 *      如果存在该渠道则用户开始正常使用服务，入不存在则显示微站链接并建议用户完成尽快绑定
 *      2、用户填入的OBD如果已经和某车建立关联则提示用户，用户昵称和电话在t_staff_account中不能重复
 * 前端：进行用户身份识别页面，用户选择新用户/老用户
 *      老用户：识别方式选择(手机验证/用户名密码登陆/邮箱验证)，不同平台视情况选择一到多种验证方式
 *            微信用户只支持手机验证，用户填入手机号码，
 *            如用户不存在提示后跳到新用户，如存在发送验证码完成身份识别
 *      新用户：进入新用户注册页面，用户填入OBD编号昵称电话(必填)，品牌系列年款车牌号里程数(选填)
 *             提交并完成绑定
 *      当进行用户OBD关联的时候，如果此OBD已经和别的用户关联，则进入到车主短信验证界面
 *      该界面提示用户：该OBD已有其他用户完成绑定，您可以通过短信方式请求车主完成授权
 *      ，用户选择是则发送短信，并验证验证码，验证通过则继续绑定操作，该用户为该OBD的从属用户
 * 后端：老用户：根据手机号从t_staff_account中找到accountId(用户标示)
 *            根据sopenId从t_service_account中找到orgId(组织标示)
 *            根据openId和sopenId从t_wx_user中找到其主键并作为channelKey(渠道标示)
 *            通过以上3个标示在t_accunt_channel中建立用户组织渠道的关联关系
 *      新用户：新用户的绑定由4个步骤来完成：
 *          1、创建新用户。
 *             新用户手机号不能重复，通过手机号和昵称在t_staff_account中创建新数据，获得accountId
 *             完成绑定后，可通过平台相关模块来完成个人信息的补完工作
 *          2、关联4S店对应的渠道信息(参考老用户)。
 *          3、建立用户与OBD设备的关联关系。
 *             首先通过OBDCode到t_account_obd查询，看是否存在关联关系
 *             如果已存在则发短信给owner验证，验证通过后在此表中建立此用户和OBD的关系，但不是owner。
 *             如果不存在则以owner建立关系
 *          4、创建车辆信息，建立OBD与车之间的关系。
 *             首先通过用户填入的车辆信息在t_car_info中创建数据，并根据产生的carId建立和OBD的关系
 *             建立关系时保存绑定时间。(当OBD要换车时，只需要在老车关联信息
 *             里填入解绑时间，以此标示该OBD在不同时间段服侍的主人，作为OBD信息在查询时的一个时间断点)
 */
var dao=require("../core/dataAccess/dao");
var msgCentre=require("../core/message/msgCentre");
function buildChannel(channel,accountId,params,cb){
    if(channel==='wx'){
        //获得用户和组织的微信号
        var openId=params.openId;
        var sopenId=params.sopenId;
        var sql=" select sa.orgId,wu.id as channelKey,ac.accountId" +
            " from t_wx_service_account sa" +
            " left join t_wx_user wu on sa.openId=wu.sopenId" +
            " left join t_account_channel ac on wu.id=ac.channelKey and ac.channelCode=?" +
            " where wu.openId=? and sa.openId=?";
        dao.findBySql(sql,['wx',openId,sopenId],function(rows){
            if(rows.length>0){
                var channelData=rows[0];
                var orgId=channelData.orgId;
                var aId=channelData.accountId;
                var channelKey=channelData.channelKey;
                //如果aId有值则说明渠道关系已建立
                if(aId===null){
                    var channelJson={
                        accountId:accountId,
                        orgId:orgId,
                        channelCode:'wx',
                        channelKey:channelKey
                    };
                    var sql="insert into t_account_channel set ?";
                    dao.insertBySql(sql,[channelJson],function(info){
                        var channelId=info.insertId;
                        if(channelId){
                            console.log("成功创建渠道关系"+channelId);
                            channelJson.channelId=channelId;
                            cb(null,channelJson);
                        }
                    });
                }
            }
        });
    }
}
function buildObdByAccount(accountId,param){
    var obdCode=param.obdCode;
    var sql="select ao.accountId,ao.obdCode,ao.owner " +
        "from t_account_obd ao where ao.obdCode=?";
    dao.findBySql(sql,[accountId,obdCode],function(rows){
        sql="insert into t_account_obd set ?";
        var aoJson={
            accountId:accountId,
            obdCode:obdCode
        };
        if(rows.length>0){
            var owner=rows[0].owner;
            var aId=rows[0].accountId;

            if(accountId!==aId){
                console.log("该OBD已经和别的用户产生绑定");
                aoJson.owner=0;
                dao.insertBySql(sql,[aoJson],function(info){
                    console.log("建立用户-OBD关系，非owner");
                });
            }
            else{
                console.log("无需绑定");
            }
        }
        else{
            console.log("建立新绑定关系");
            aoJson.owner=1;
            dao.insertBySql(sql,[aoJson],function(info){
                console.log("建立用户-OBD关系，owner");
            });
        }
    });
}
function buildCarByObd(param){
    var obdCode=param.obdCode;
    var brand=param.brand;
    var series=param.series;
    var modelYear=param.modelYear;
    var license=param.license;
    var mileage=param.mileage;

    var sql="update t_car_info set ? where obdCode=?";
    var carJson={
        brand:brand,
        series:series,
        modelYear:modelYear,
        license:license,
        mileage:mileage?mileage:0
    };
    dao.executeBySql(sql,[carJson,obdCode],function(){
        console.log("更新成功");
    });
}
exports.testOBD=function(req,res){
    var obdCode=req.params.obdCode;
    var sql= "select * from t_car";
    var paramArray=[];
    dao.findBySql(sql,[],function(rows){
        for(var i=0;i<rows.length;i++){
            var cJson=rows[i];
            paramArray.push(cJson.code);
        }
        for(var j=0xFE00;j<=0xFE1A;j++){
            paramArray.push(j);
        }
        dao.findBySql("select sim_number as sim from t_device_obd where obdCode=?",[obdCode],function(rows){
            if(rows.length>0){
                var sim=rows[0].sim;
                msgCentre.getOBDRuntime(obdCode,sim,paramArray,function(info){
                    res.send(info);
                });
            }
        });

    });
};
exports.bindOBD = function(req, res){
    var channel=req.params.channel;
    var bindJson=req.body;
    var phone=bindJson.phone;
    var nickName=bindJson.name;
    var sql="select id from t_staff_account where phone=?";
    dao.findBySql(sql,[phone],function(rows){
        if(rows.length>0){
            console.log("找到账户，直接建立渠道关系");
            var accountId=rows[0].id;
            buildChannel(channel,accountId,bindJson);
            buildObdByAccount(accountId,bindJson);
            buildCarByObd(bindJson);
        }
        else{
            console.log("未找到账户，建立账户");
            var accJson={
                nick:nickName,
                phone:phone,
                status:1
            };
            sql="insert into t_staff_account set ?";
            dao.insertBySql(sql,[accJson],function(info){
                var accountId=info.insertId;
                buildChannel(channel,accountId,bindJson);
            });
        }

    });

};





/*


//1622获得OBD相关信息，传入[id1,id2]返回{id1:val1,id2:val2},ID来源4.01以及4.02
var getOBDRuntime=function(obdCode,sim,idArray){
    dataManager.init(new Buffer(1024),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1622);
    dataManager.writeWord(idArray.length);
    for(var i=0;i<idArray.length;i++){
        dataManager.writeWord(idArray[i]);
    }
    sendMessage(dataManager.getBuffer());
};
//1623设置OBD相关信息，传入{id1:val1,id2:val2},ID来源4.01
exports.setOBDInfo=function(obdCode,sim,obdInfo){
    dataManager.init(new Buffer(1024),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1623);
    dataManager.writeByte(Object.keys(obdInfo).length);
    for(var key in obdInfo){
        var numKey=parseInt(key);
        dataManager.writeWord(numKey);
        setValueByID(numKey,obdInfo[key]);
    }
    sendMessage(dataManager.getBuffer());
};
//1624清空累计平均油耗
exports.clearAvgOilUsed=function(obdCode,sim,cb){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1624);
    callbackMapping[obdCode]=cb;
    sendMessage(dataManager.getBuffer());
};
//1625获得OBD版本信息
exports.getOBDVersionInfo=function(obdCode,sim,cb){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1625);
    callbackMapping[obdCode]=cb;
    sendMessage(dataManager.getBuffer());
};
//1626清除故障码
exports.clearFaultCode=function(obdCode,sim,cb){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x1626);
    callbackMapping[obdCode]=cb;
    sendMessage(dataManager.getBuffer());
};
//16E0还原出厂设置
exports.resetDefault=function(obdCode,sim,cb){
    dataManager.init(new Buffer(19),0);
    dataManager.writeString("SMS"+sim+"#LD");
    dataManager.setOffset(dataManager.getOffset()-1);//消息不带0x00
    dataManager.writeWord(0x16E0);
    callbackMapping[obdCode]=cb;
    sendMessage(dataManager.getBuffer());
};*/
