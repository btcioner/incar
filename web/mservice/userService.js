/**
 * Created by Jesse Qu on 3/25/14.
 */

'use strict';

var dao=require("../core/dataAccess/dao");

exports = module.exports = function(service) {
    service.post.enroll = userEnroll;
}
function getUserInfo(wxFlag){
    var sql="select * from t_account where wx_oid like ?";
    dao.findBySql(sql,['%'+wx+'%'],function(rows){
        if(rows.length>0){
            return rows[0];
        }
        else{
            return null;
        }
    });
}
//验证微信用户是否存在账户
function userCheck(req,res){
    var params=req.params;
    var openId=params.openId;
    var openId4S=params.sopenId;
    var wx=openId+"-"+openId4S
    var user=getUserInfo(wx);
    var accountId=user?user.accountId:null;
    res.write({status:'success',accountId:accountId});
}
//通过已有账户信息登录，并和当前微信用户绑定
function userLogin(req,res){
    var params=req.params;
    var openId=params.openId;
    var openId4S=params.sopenId;
    var username=params.username;
    var password=params.password;
    var wx=openId+"-"+openId4S
    var sql="select id,wx_oid from t_account where name=? and pwd=?";
    dao.findBySql(sql,[username,password],function(rows){
        if(rows.length>0){
            var id=rows[0].id;
            var oldWX=rows[0].wx_oid;
            var newWX=oldWX?oldWX+';'+wx:wx;
            sql="update t_account set ? where id=?";
            dao.executeBySql(sql,[{wx_oid:newWX},id],function(err){
                if(err){
                    res.wirte({status:'failed',message:'无法完成当前账户与微信账户的绑定'});
                }
                res.wirte({status:'success',accountId:id});
            });
        }
        else{
            res.wirte({status:'failed',message:'登录失败'});
        }
    });
}
//登记并注册没有账户的微信用户
function userEnroll(req, res) {
    var params=req.params;
    var username=params.name;
    var password=params.password;
    var openId=params.user;
    var openId4S=params.sopenId;
    var phone=params.phone;
    var nickName=params.nick;

    var sql="select id from t_4s where openid=?";
    dao.findBySql(sql,[openId4S],function(rows){
        if(rows.length>0){
            var s4id=rowsp[0].id;
            var user={
                name:username,
                pwd:password,
                wx_oid:openId+'-'+openId4S,
                phone:phone,
                nick:nickName,
                s4_id:s4id
            };
            sql="insert into t_account set ?";
            dao.insertBySql(sql,user,function(err,info){
                if(err){
                    res.write({status:'failed',message:'添加账户失败'});
                }
                var accountId=info.insertId;
                res.wirte({status:'success',accountId:accountId});
            });
        }
        else{
            res.wirte({status:'failed',message:'无法识别的4SOpenId'});
        }
    });

}
//车辆登记
function carEnroll(req,res){
    var params=req.params;
    var openId=params.openId;
    var openId4S=params.sopenId;
    var wx=openId+"-"+openId4S
    var obdCode=params.obdCode;
    var brand=params.brand;
    var series=params.series;
    var modelYear=params.modelYear;
    var license=params.license;
    var mileage=params.mileage;
    var age=parseInt(params.age);
    var ageDate=new Date();
    ageDate.setYear(ageDate.getFullYear()-age);
    var disp=params.disp;
    var engine_type=params.engine_type;
    var user=getUserInfo(wx);
    var s4Id=user.s4_id;
    var sql="select id from t_car where obd_code=?";
    dao.findBySql(sql,[obdCode],function(rows){
        if(rows.length>0){
            var id=rows[0].id;
            var car={
                s4_id:s4Id,
                brand:brand,
                series:series,
                modelYear:modelYear,
                license:license,
                act_type:1,
                disp:disp,
                mileage:mileage,
                age:ageDate,
                engine_type:engine_type,
                created_date:new Date()
            };
            sql="update t_car set ? where id=?";
            dao.executeBySql(sql,[car,id],function(){
                console.log("更新成功");
            });
        }
        else{
            res.write({status:'failed',message:'OBD不存在'});
        }
    });
}
//车辆注销
function carRescind(req,res){
    var params=req.params;
    var accountId=params.accountId;
    var carId=params.carId;
}




/*var postData = req.body;
 var pool = this.db();

 postData.owner_flag = parseInt(postData.owner_flag);
 // console.log(postData);

 pool.query('select id from t_wx_user where openid = ?;',[postData.user], function(err, users){
 if (err) { return res.send(400, err); }
 if (users && users.length === 1) {

 return pool.query('select COUNT(*) totalRows from t_wx_user_obd where wx_user_id = ? and obd_code = ?;', [users[0].id, postData.obd_code], function(err, mappings){
 if (err) { return res.send(400, err); }
 if (mappings && mappings.length === 1) {
 if (mappings[0].totalRows === 0) {

 if (postData.owner_flag === 1) {
 return pool.query('select COUNT(*) totalOwners from t_wx_user_obd where owner_flag = 1 and obd_code = ?;', [postData.obd_code], function(err, owners){
 if (err) { return res.send(400, err); }
 if (owners && owners.length === 1) {
 if (owners[0].totalOwners === 1) {
 return res.send(400, new Error('this obd device has already had an owner.'));
 }
 else {
 var sqlWithParameters = 'insert into t_wx_user_obd (wx_user_id, obd_code, owner_flag, enroll_time) values (?, ?, 1, now());';
 var sql = mysql.format(sqlWithParameters, [ users[0].id, postData.obd_code] );

 // console.log(sql);
 return pool.query(sql, function(err, result) {
 if (err) { return res.send(400, err); }
 return res.send(200, result);
 });
 }
 }
 else {
 return res.send(400, new Error('zero or multiple rows returned for specific wx user openid and obd_code when enrollment.'));
 }
 });
 }
 else {
 var sqlWithParameters = 'insert into t_wx_user_obd (wx_user_id, obd_code, owner_flag, enroll_time) values (?, ?, 0, now());';
 var sql = mysql.format(sqlWithParameters, [ users[0].id, postData.obd_code] );

 // console.log(sql);
 return pool.query(sql, function(err, result) {
 if (err) { return res.send(400, err); }
 return res.send(200, result);
 });
 }
 }
 else {
 return res.send(400, new Error('binding is already existed for specific wx user openid and obd_code when enrollment.'));
 }
 }
 else {
 return res.send(400, new Error('zero or multiple rows returned for specific wx user openid and obd_code when enrollment.'));
 }
 });
 } else {
 return res.send(400, new Error('zero or multiple rows returned for one specific wx user openid when enrollment.'));
 }
 });*/