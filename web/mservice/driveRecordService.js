/**
 * Created by liz on 14-7-14.
 */
'use strict';

var mysql = require('mysql');
var dao=require("../config/dao");
exports = module.exports = function(service) {
    service.post.driveRecord = driveRecord;

}

function driveRecord(req, res) {

    var postData = req.body;
    console.log(postData);
    var temp=postData.user.split('@');
    var openid=temp[0];
    var sopenid=temp[1];
    var wx_oid=openid+":"+sopenid
    var sql="select id from t_account where wx_oid =?";
    dao.findBySql(sql,[wx_oid],function(info){
        if (info.err) { res.json({status:"连接数据库出错！"});return }
        else{
            var acc_id = info.data[0].id;
             sql="select car_id from t_car_user where acc_id=?"
            dao.findBySql(sql,[acc_id],function(info){
                if (info.err) { res.json({status:"您还没有注册车云终端！"});return }
                else{
                    if(info.data.length == 0)
                    {
                        res.json({status:"您还没有注册车云终端！"});return
                    }else{
                    var car_id = info.data[0].car_id
                    sql="select obd_code from t_car where id =?"
                    dao.findBySql(sql,[car_id],function(info){
                        if (info.err) { res.json({status:"连接数据库出错！"});return }
                        else{
                            var obd_code = info.data[0].obd_code
                            sql="select fireTime,currentMileage,currentAvgOilUsed,flameOutTime from t_obd_drive where obdCode =? order by fireTime DESC limit 0,20"
                            dao.findBySql(sql,[obd_code],function(info){
                                if (info.err) { res.json({status:"连接数据库出错！"});return }
                                else{
                                    if(info.data.length == 0){
                                        res.json({status:"暂时还没有行车记录！"});return
                                    }else{
                                        res.json({status:"ok",recordList:info.data});
                                    }
                                }
                            });
                        }
                    });
                    }
                }
            });
        }
    });
}

