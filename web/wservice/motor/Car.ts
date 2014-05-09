/// <reference path="references.ts" />

module Service{
    export function GetCar(req, res){
        res.setHeader("Accept-Query", "page,pagesize,license,obd_code,act_type,sim_number,brand,series");
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

    export class Car extends DTOBase<DTO.car> {
        constructor(dto) {
            super(dto);
        }

        public DTO():DTO.car{
            var dto:DTO.car = super.DTO();

            if(dto.act_type === 0) dto.act_type_name = "未激活";
            else if(dto.act_type === 1) dto.act_type_name = "已激活";
            else if(dto.act_type === 2) dto.act_type_name = "故障";

            return dto;
        }
    }
}