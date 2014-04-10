/*与车相关的业务逻辑
* 一、车主首次绑定车辆
* 前提：车主用其微信号关注4S店的时候就在用户表中创建了用户，并关联了对应的4S店
*      OBD卖到客户手中之前就已经在t_obd_device中保存了对应SIM卡信息
* 业务支持信息：
  * OBD编号
  * 微信号(隐式)
  * 用户姓名
  * 电话
  * 品牌系列年款
  * 车牌号
  * 当前行驶里程
* 业务流程：
* 1、将用户姓名、电话更新到用户表中
* 2、建立该用户与obd_device之间的关系，如果该OBD已经与其他用户绑定则整个绑定操作失败，返回错误信息
* 3、创建车辆信息
* 4、建立该车辆与obd_device之间的关系
* */
//获得所有车辆信息
var dao=require('../api/dataAccess/dao');
exports.list = function(req, res){
    var sql="select * from t_car_info";
    dao.findBySql(sql,null,function(rows){
        res.send(rows);
    });
};
//根据Id获得某辆车信息
exports.get = function(req, res){
    var sql="select * from t_car_info where id=?";
    var car_id= req.param('id');
    dao.findBySql(sql,[car_id],function(rows){
        res.send(rows);
    });
};

//删除一辆车
exports.delete = function(req, res){
    var sql="delete from t_car_info where id=?"
    var carId= req.param('id');
    dao.executeBySql(sql,[carId],function(){
        res.send({status:"success"});
    });
};

//更新一辆车信息
exports.update = function(req, res){
    var sql="update t_car_info set ? where id=?";
    var carId= req.param('id');
    var updateJson=req.body;
    dao.executeBySql(sql,[updateJson,carId],function(){
        res.send({status:"success"});
    });
};

//新增一辆车信息
exports.add = function(req, res){
    var sql="insert into t_car_info set ?";
    var updateJson=req.body;
    dao.executeBySql(sql,[updateJson],function(){
        res.send({status:"success"});
    });
};