/// <reference path="references.ts" />

module Service{
    export function GetCar(req, res){
        res.setHeader("Accept-Query", "page,pagesize,has_obd,license,obd_code,act_type,sim_number,brand,series");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetCar(page, req.query, (ex, total, cars)=>{
                if(ex) { res.json(ex); return; }
                var arrayCars = DTOBase.ExtractDTOs<DTO.car>(cars);
                res.json({status:"ok", totalCount:total, cars: arrayCars});
            });
        });
    }

    export function GetCarByOBD(req, res){
        var sql = "SELECT * FROM t_car WHERE obd_code = ?";
        var args = [req.params.obd_code];

        var dac = MySqlAccess.RetrievePool();
        dac.query(sql, args, (ex, result)=>{
            if(ex) {res.json(new TaskException(-1, "查询OBD失败", ex)); return;}
            if(result.length === 0) {res.json(new TaskException(-1, "查询的OBD不存在", ex)); return;}
            if(result.length > 1) {res.json(new TaskException(-1, "OBD数据错误", ex)); return;}
            var car:Car = new Car(result[0]);
            res.json({status:"ok", car:car.DTO()});
        });
    }

    export function AddCarAsOBDOnly(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    obd_code:'WF7743331',
                    sim_number:'1396543210',
                    comment:'示例'
                },
                remark:"必填:obd_code"
            });
            return;
        }

        var data = req.body;
        if(!data.obd_code) { res.json(new TaskException(-1, "缺少参数obd_code", null)); return; }

        var dto:DTO.car = {};
        dto.obd_code = data.obd_code;
        if(isStringNotEmpty(data.sim_number)) dto.sim_number = data.sim_number;
        if(isStringNotEmpty(data.comment)) dto.comment = data.comment;
        dto.created_date = new Date();

        var dac = MySqlAccess.RetrievePool();
        var sql = "INSERT t_car SET ?";
        dac.query(sql, [dto], (ex, result)=>{
            if(ex) { res.json(new TaskException(-1, "增加OBD失败", ex), null); return; }
            dto.id = result.insertId;
            var car = new Car(dto);
            res.json(null, car.DTO());
        });
    }

    export function ModifyCarByOBD(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    sim_number:'1396543210',
                    comment:'示例'
                },
                remark:"必填:无"
            });
            return;
        }

        var data = req.body;

        var dto:any = {};
        var args = [];
        if(isStringNotEmpty(data.sim_number)) dto.sim_number = data.sim_number;
        if(isStringNotEmpty(data.comment)) dto.sim_number = data.comment;

        var dac = MySqlAccess.RetrievePool();
        var sql = "UPDATE t_car SET ? WHERE obd_code = ?";
        dac.query(sql, [dto, req.params.obd_code], (ex, result)=>{
            if(ex) { res.json(new TaskException(-1, "修改OBD失败", ex), null); return; }
            if(result.affectedRows === 0) { res.json(new TaskException(-1, "OBD不存在", null)); return; }
            res.json({status:"ok"});
        });
    }

    export function DeleteCarByOBD(req, res){
        var sql = "DELETE FROM t_car WHERE obd_code = ?";
        var dac = MySqlAccess.RetrievePool();
        dac.query(sql, [req.params.obd_code], (ex, result)=>{
            if(ex) {res.json(new TaskException(-1, "删除OBD失败", ex)); return;}
            if(result.affectedRows === 0) {res.json(new TaskException(-1, "OBD不存在", null)); return;}
            res.json({status:"ok"});
        });
    }

    export function GetCarById(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetCarById(req.params.car_id, (ex, car)=>{
                if(ex) { res.json(ex); return; }
                res.json({status:"ok", car:car.DTO() });
            });
        });
    }

    export function AddCar(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    license:'京A12345',
                    obd_code:'WF7743331',
                    act_type:1,
                    sim_number:'1396543210',
                    brand:3,
                    series:6,
                    modelYear:2012,
                    disp:1800,
                    mileage:7762,
                    age:2,
                    comment:'样例示范'
                },
                remark:"必填:无"
            });
            return;
        }

        var data = req.body;

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            var dto:any = {};
            if(isStringNotEmpty(data.license)) dto.license = data.license;
            if(isStringNotEmpty(data.obd_code)) dto.obd_code = data.obd_code;
            if(!isNaN(data.act_type)) dto.act_type = data.act_type;
            if(isStringNotEmpty(data.sim_number)) dto.sim_number = data.sim_number;
            if(!isNaN(data.brand)) dto.brand = data.brand;
            if(!isNaN(data.series)) dto.series = data.series;
            if(!isNaN(data.modelYear)) dto.modelYear = data.modelYear;
            if(!isNaN(data.disp)) dto.disp = data.disp;
            if(!isNaN(data.mileage)) dto.mileage = data.mileage;
            if(!isNaN(data.age)) dto.age = data.age;
            if(isStringNotEmpty(data.comment)) dto.comment = data.comment;
            if(isStringNotEmpty(data.obd_code)) dto.obd_code = data.obd_code;

            var car = new Car(dto);
            s4.AddCar(car, (ex:TaskException, car:Car)=>{
                if(ex) { res.json(ex); return; }
                res.json({status:"ok", car:car.DTO()});
            });
        });
    }

    export function ModifyCar(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    license:'京A12345',
                    obd_code:'WF7743331',
                    act_type:0,
                    sim_number:'1396543210',
                    brand:3,
                    series:6,
                    modelYear:2012,
                    disp:1800,
                    mileage:7762,
                    age:2,
                    comment:'样例示范'
                },
                remark:"必填:无"
            });
            return;
        }

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            var dto:any = { id:req.params.car_id };
            var data = req.body;
            if(isStringNotEmpty(data.license)) dto.license = data.license;
            if(isStringNotEmpty(data.obd_code)) dto.obd_code = data.obd_code;
            if(isStringNotEmpty(data.sim_number)) dto.sim_number = data.sim_number;
            if(isStringNotEmpty(data.comment)) dto.comment = data.comment;
            if(!isNaN(data.act_type)) dto.act_type = data.act_type;
            if(!isNaN(data.brand)) dto.brand = data.brand;
            if(!isNaN(data.series)) dto.series = data.series;
            if(!isNaN(data.modelYear)) dto.modelYear = data.modelYear;
            if(!isNaN(data.disp)) dto.disp = data.disp;
            if(!isNaN(data.mileage)) dto.mileage = data.mileage;
            if(!isNaN(data.age)) dto.age = data.age;

            var car = new Car(dto);
            s4.ModifyCar(car, (ex:TaskException)=>{
                if(ex) { res.json(ex); return; }
                res.json({status:"ok"});
            });
        });
    }

    export function DeleteCar(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }

            s4.DeleteCar(req.params.car_id, (ex:TaskException)=>{
                if(ex) { res.json(ex); return; }
                res.json({status:"ok"});
            });
        });
    }

    export function GetCustomerByCarId(req, res){
        // 通常一个车不会有很用户,因此该函数不必支持分页
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetCarById(req.params.car_id, (ex, car)=>{
                if(ex) { res.json(new TaskException(-1, "查询4S店车辆失败", ex)); return; }
                car.GetUser((ex, users)=>{
                    if(ex) { res.json(new TaskException(-1, "查询车辆使用者失败", ex)); return; }
                    var dtos = DTOBase.ExtractDTOs(users);
                    // pwd不返回给客户
                    dtos.forEach((dto)=>{
                        dto.pwd = undefined;
                        dto.tel_pwd = undefined;
                    })
                    res.json({status:"ok", custs:dtos});
                });
            });
        });
    }

    export class Car extends DTOBase<DTO.car> {
        constructor(dto) {
            super(dto);
        }

        public DTO():DTO.car{
            var dto:DTO.car = super.DTO();

            if(dto.act_type === 0) dto.act_type_name = "未激活";
            else if(dto.act_type === 1) dto.act_type_name = "已激活";
            else if(dto.act_type === 2) dto.act_type_name = "故障";

            if(dto.user_type === 0) dto.user_type_name = "无效";
            else if(dto.user_type === 1) dto.user_type_name = "车主";
            else if(dto.user_type === 2) dto.user_type_name = "使用者(非车主)";

            return dto;
        }

        public GetUser(cb:(ex:TaskException, custs:Customer[])=>void){
            var sql = "SELECT A.*, U.user_type\n" +
                "FROM t_account A JOIN t_car_user U ON A.id = U.acc_id and A.s4_id = U.s4_id\n" +
                "WHERE A.s4_id = ? and U.car_id = ?";
            var dac = MySqlAccess.RetrievePool();
            var args = [this.dto.s4_id, this.dto.id];
            dac.query(sql, args, (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "查询车辆失败", ex), null); return; }
                var custs:Customer[] = [];
                result.forEach((dto)=>{
                    var cust = new Customer(dto);
                    custs.push(cust);
                });
                cb(null, custs);
            });
        }
    }
}