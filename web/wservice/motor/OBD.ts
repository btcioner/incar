/// <reference path="references.ts" />

module Service {
    // 返回所有行车信息
    export function GetDriveInfoAll(req, res):void{
        var data = req.body;
        var token = req.cookies.token;
        var page = req.query.page;
        var pagesize = req.query.pagesize;
        var filter = {
            city: req.query.city,
            org: req.query.org,
            brand: req.query.brand,
            series: req.query.series,
            obd_code:req.query.obd_code
        };



        var repo = new DeviceRepository();
        repo.AllDriveInfos(filter, new Pagination(page, pagesize),
            (ex:TaskException, drvInfos:DTO.obd_drive[], count:number)=>{
                if(ex)
                    res.json(ex);
                else
                    res.json({status:"ok", totalCount:count , drvInfos: drvInfos});
            });
    }

    // 返回指定OBD关联的行车信息
    export function GetDriveInfo(req, res):void{
        var data = req.body;
        var token = req.cookies.token;
        var code : string = data.code;
        var page = new Pagination(req.query.page, req.query.pagesize);

        if(!token){ res.json({status: "用户没有登录"}); return;}
        if(!code){ res.json({status: "缺少code参数"}); return; }

        var repo = new DeviceRepository();
        repo.GetByCode(code,  (error, dev)=>{
            if(error){
                res.json({status:error.status});
                return;
            }
            else{
                dev.RetrieveDriveInfo(page, (ex, tc, drvInfos)=>{
                    if(ex){
                        res.json({status: ex.status});
                    }
                    else{
                        res.json({status:"ok",totalCount:tc, drvInfos: drvInfos});
                    }
                });
            }
        });
    }

    // OBD详细行车数据
    export function GetDriveDetail(req, res):void{
        var data = req.body;
        var token = req.cookies.token;
        var code : string = data.code;
        var drive_id: number = data.drive_id;

        if(!token){ res.json({status:"用户没有登录"}); return;}
        if(!code){ res.json({status:"缺少code参数"}); return; }
        if(!drive_id){ res.json({status:"缺少drive_id参数"}); return; }

        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo = new DeviceRepository();
        repo.GetByCode(code, (ex, dev)=>{
            if(ex){ res.json(ex); return; }
            else{
                dev.RetrieveDriveDetail(drive_id, page, (ex, count, drvDetails)=>{
                    if(ex) { res.json(ex); return; }
                    else{
                        res.json({
                            status:"ok",
                            totalCount:count,
                            details:drvDetails
                        });
                    }
                });
            }
        });
    }

    // OBD设备仓库
    export class DeviceRepository{
        // 数据库连接对象
        dac: any;

        constructor(){
            this.dac =  MySqlAccess.RetrievePool();
        }

        // 返回全部OBD设备
        All(oper:Staff, page:Pagination, cb:(ex:TaskException,totalCount:number, devs:Array<DTO.device_obd>)=>void):void{

            var task:any={ finished : 0};

            task.begin = ()=> {
                var sql = "SELECT * FROM t_car_info WHERE obd_code IS NOT NULL";
                if (page.IsValid()) sql += page.sql;
                this.dac.query(sql, null, (ex, result)=> {
                    task.A = {ex:ex, result:result};
                    task.finished++;
                    task.end();
                });

                var sql = "SELECT COUNT(*) COUNT FROM t_car_info WHERE obd_code IS NOT NULL";
                this.dac.query(sql, null, (ex, result)=>{
                    task.B = {ex:ex, result:result};
                    task.finished++;
                    task.end();
                });
            }

            task.end = () =>{
                if(task.finished === 2){
                    if (task.A.ex) { cb(new TaskException(-1, "查询OBD设备失败", task.A.ex),0, null); return; }

                    var devs : Array<DTO.device_obd> = task.A.result;

                    var totalCount = 0;
                    if(!task.B.ex) totalCount = task.B.result[0].COUNT;
                    cb(null, totalCount, devs);
                }
            }

            task.begin();
        }

        // 获取指定的OBD设备
        GetByCode(code:string, cb:(error:TaskException, dev:OBDDevice)=>void):void{
            this.dac.query("SELECT * FROM t_car_info WHERE obd_code = ?",
                [code], (error, result)=>{
                    if(error) cb(new TaskException(-1, error.toString(), null), null);
                    else if(result.length === 0) cb(new TaskException(-1, util.format("OBD设备(%s)不存在", code), null), null);
                    else{
                        var dev = OBDDevice.CreateFromDTO(result[0]);
                        cb(null, dev);
                    }
                });
        }

        // 返回所有的行车基本数据
        AllDriveInfos(filter: any, page:Pagination, cb:(ex:TaskException, devInfos:DTO.obd_drive[], totalCount:number)=>void):void{
            var task :any = { finished:0 };
            var dac =  MySqlAccess.RetrievePool();
            task.begin = ()=>{
                // 1.查询OBD数据
                var sql = "SELECT R.*\n" +
                          "FROM t_obd_drive AS R\n" +
                              "\tJOIN t_car as C on C.obd_code = R.obdcode\n" +
                              "\tLEFT OUTER JOIN t_4s AS O on C.s4_id = O.id\n" +
                          "WHERE 1=1";
                var args = [];
                if(filter.city){ sql += " and O.city = ?"; args.push(filter.city); }
                if(filter.org){sql += " and O.name like ?"; args.push("%"+filter.org+"%"); }
                if(filter.obd_code){ sql += " and R.obdcode = ?"; args.push(filter.obd_code); }

                sql += " ORDER BY R.id DESC";
                if(page._offset >= 0 && page._pagesize > 0){
                    sql += util.format(" LIMIT %s, %s", page._offset, page._pagesize);
                }

                dac.query(sql, args, (ex, result)=>{
                    task.A = { ex:ex, result:result};
                    task.finished++;
                    task.end();
                });

                // 2.查询OBD数据总条数

                sql = "SELECT COUNT(*) TotalCount" +
                    " FROM t_obd_drive AS R" +
                    " JOIN t_car as C on C.obd_code = R.obdcode" +
                    " LEFT OUTER JOIN t_4s as O on O.id = C.s4_id" +
                    " WHERE 1=1";
                args = new Array();
                if(filter.city){ sql += " and O.city = ?"; args.push(filter.city); }
                if(filter.org){sql += " and O.name like ?"; args.push("%"+filter.org+"%"); }
                if(filter.obd_code){ sql += " and R.obdcode = ?"; args.push(filter.obd_code); }
                dac.query(sql, args, (ex, result)=>{
                    task.B = {ex:ex ,result:result};
                    task.finished++;
                    task.end();
                });

                // 3.Car series字典数据
                DeviceRepository.GetCarSeries((ex, series)=>{
                    task.C = {ex:ex, series:series};
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished === 3){
                    // 都完成了
                    if(task.A.ex){ cb(new TaskException(-1, "查询OBD信息出错", task.A.ex), null, 0); return;}

                    var totalCount = 0;
                    if(!task.B.ex){
                        totalCount = task.B.result[0].TotalCount;
                    }

                    var drvInfos = new Array<DTO.obd_drive>();
                    if(!task.C.ex){
                        task.A.result.forEach((obj)=>{
                            var dev:any = obj;
                            drvInfos.push(dev);
                            // 解析brand
                            if(task.C.series
                                && dev.brand !== undefined && dev.brand !== null
                                && dev.series !== undefined && dev.series !== null){
                                var dict : CarSeriesMap = task.C.series;
                                if(dict){
                                    var dictInner = dict[dev.brand];
                                    if(dictInner){
                                        var bs = dictInner[dev.series];
                                        if(bs){
                                            dev.brand_name = bs.brand;
                                            dev.series_name = bs.series;
                                        }
                                    }
                                }
                            }
                        });
                    }

                    cb(null, drvInfos, totalCount);
                }
            };

            task.begin();
        }

        // 加载车品牌表
        static dictCarSeries : CarSeriesMap;
        static GetCarSeries(cb:(ex:TaskException, series: CarSeriesMap)=>void):void{
            if(DeviceRepository.dictCarSeries){
                cb(null, DeviceRepository.dictCarSeries);
                return;
            }

            var dac = MySqlAccess.RetrievePool();
            dac.query("SELECT brandCode, seriesCode, brand, series, manufacturer " +
                "FROM t_car_dictionary", null, (ex, result)=>{
                if(ex){
                    cb(new TaskException(-1, "数据库错误", ex), null);
                    return;
                }
                else{
                    DeviceRepository.dictCarSeries = {};
                    result.forEach((dto:any)=>{
                        var brandCode = dto.brandCode;
                        var seriesCode = dto.seriesCode;
                        if(brandCode !== undefined && seriesCode !== undefined){
                            if(!DeviceRepository.dictCarSeries) DeviceRepository.dictCarSeries = {};
                            if(!DeviceRepository.dictCarSeries[brandCode])
                                DeviceRepository.dictCarSeries[brandCode] = {};
                            if(!DeviceRepository.dictCarSeries[brandCode][seriesCode])
                                DeviceRepository.dictCarSeries[brandCode][seriesCode] = new CarSeries();

                            var value = DeviceRepository.dictCarSeries[brandCode][seriesCode];
                            value.brand = dto.brand;
                            value.series = dto.series;
                            value.manufacturer = dto.manufacturer;
                        }
                    });
                    cb(null, DeviceRepository.dictCarSeries);
                }
            });
        }
    }

    export class OBDDevice extends DTO.device_obd {
        constructor(){
            super();
        }

        // 行车信息
        RetrieveDriveInfo(page:Pagination, cb:(error:TaskException,totalCount:number, drvInfos: DTO.obd_drive[])=>void):void{
            var task : any = { finished : 0 };
            var dac =  MySqlAccess.RetrievePool();
            task.begin = ()=>{
                // 主要数据
                var sql = "SELECT * " +
                    "FROM t_obd_drive WHERE obdCode = ? " +
                    "ORDER BY id DESC";
                if(page.IsValid()) sql += page.sql;
                dac.query(sql, [this.obd_code], (ex, result)=>{
                    task.A = {ex:ex, result:result};
                    task.finished++;
                    task.end();
                });

                // 字典数据
                DeviceRepository.GetCarSeries((ex, series)=>{
                    task.B = {ex:ex, series:series};
                    task.finished++;
                    task.end();
                });

                dac.query("SELECT COUNT(*) count FROM t_obd_drive WHERE obdCode = ?", [this.obd_code], (ex, result)=>{
                    task.C = {ex:ex, result:result};
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished < 3) return;
                // 所有任务已完成
                if(task.A.ex) {cb(new TaskException(-1, "", task.A.ex), 0, null); return; }

                var totalCount = 0;
                if(!task.C.ex) totalCount = task.C.result[0].count;

                var drvInfos = new Array<DTO.obd_drive>();
                task.A.result.forEach((obj)=>{
                    var dev:any = obj;
                    drvInfos.push(dev);
                    // 解析brand
                    if((!task.B.ex)
                        && dev.brand !== undefined && dev.brand !== null
                        && dev.series !== undefined && dev.series !== null){
                        var dict : CarSeriesMap = task.B.series;
                        if(dict){
                            var dictInner = dict[dev.brand];
                            if(dictInner){
                                var bs = dictInner[dev.series];
                                if(bs){
                                    dev.brand_name = bs.brand;
                                    dev.series_name = bs.series;
                                }
                            }
                        }
                    }
                });
                cb(null, totalCount, drvInfos);
            };

            task.begin();
        }

        // 行车详细信息
        RetrieveDriveDetail(detailId:number,page:Pagination,cb:(error:TaskException, totalCount:number, drvDetails: OBDDriveDetial[])=>void):void{
            var task :any = {finished:0};
            var dac = MySqlAccess.RetrievePool();
            task.begin = ()=>{
                // 总条数
                dac.query("SELECT COUNT(*) COUNT FROM t_drive_detail WHERE obdCode = ? and obdDriveId = ?",
                    [this.obd_code, detailId], (ex, result)=>{
                        task.A = {ex:ex, result:result};
                        task.finished++;
                        task.end();
                    });

                // 主要数据
                var sql = "SELECT id, obdCode, obdDriveId, faultCode, avgOilUsed, mileage, carCondition, createTime \n" +
                    "FROM t_drive_detail \n" +
                    "WHERE obdCode = ? and obdDriveId = ? \n";
                if(page.IsValid()) sql += page.sql;
                dac.query(sql, [this.obd_code, detailId],(ex, result)=>{
                    task.B = {ex:ex, result:result};
                    task.finished++;
                    task.end();
                });

                // 字典表
                OBDDriveDetial.GetDictDrive((ex, dictMap)=>{
                    task.C = {ex:ex, result:dictMap };
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished !== 3) return;
                if(task.B.ex) { cb(new TaskException(-1, "获取行驶详情失败", task.B.ex), 0, null); return;};
                var details = new Array<OBDDriveDetial>();
                task.B.result.forEach((obj)=>{
                    var detail = OBDDriveDetial.CreateFromDTO(obj);
                    details.push(detail);
                });

                var totalCount = 0;
                if(!task.A.ex){
                    totalCount = task.A.result[0].COUNT;
                }

                if(!task.C.ex){
                    var map : DictMap = task.C.result;
                    details.forEach((detail)=>{
                        if(detail.CarCondition.detail){
                            detail.CarCondition.detail.forEach((obj:any)=>{
                                if(obj && obj.id !== undefined && obj.id !== null){
                                    obj.tip = map[obj.id];
                                }
                            });
                        }
                    });
                }

                cb(null, totalCount, details);
            };

            task.begin();
        }

        static CreateFromDTO(dto:DTO.device_obd):OBDDevice{
            var target = new OBDDevice();
            target.obd_code = dto.obd_code;
            target.sim_number = dto.sim_number;
            target.comment = dto.comment;
            target.created_date = dto.created_date;

            return target;
        }

        static CreateDTO(dev: OBDDevice):DTO.device_obd{
            var target = new DTO.device_obd();

            target.obd_code = dev.obd_code;
            target.sim_number = dev.sim_number;
            target.comment = dev.comment;
            target.created_date = dev.created_date;

            return target;
        }
    }

    export class OBDDriveDetial extends DTO.drive_detial{
        CarCondition:any;

        static CreateFromDTO(dto : DTO.drive_detial):OBDDriveDetial{
            var target = new OBDDriveDetial();
            target.id           = dto.id          ;
            target.obdCode      = dto.obdCode     ;
            target.obdDriveId   = dto.obdDriveId  ;
            target.avgOilUsed   = dto.avgOilUsed  ;
            target.mileage      = dto.mileage     ;
            target.createTime   = dto.createTime  ;


            if(dto.faultCode){
                try{ target.faultCode = JSON.parse(dto.faultCode); }
                catch(ex){ target.faultCode = ex.toString(); }
            }

            if(dto.carCondition){
                try{
                    target.CarCondition = JSON.parse(dto.carCondition);
                }
                catch(ex){ target.CarCondition = ex.toString(); }
            }
            else
                target.CarCondition = {};

            return target;
        }

        // 名称行车字典
        static dictDrive : DictMap;
        // 加载行车字典
        static GetDictDrive(cb:(ex:TaskException, dict: DictMap)=>void):void{
            if(this.dictDrive){
                cb(null, this.dictDrive);
                return;
            }

            var dac = MySqlAccess.RetrievePool();
            dac.query("SELECT code, tip FROM t_drive_condition;", null, (ex, result)=>{
                if(ex){
                    cb(new TaskException(-1, "加载字典数据失败", ex), null);
                    return;
                }
                else{
                    OBDDriveDetial.dictDrive = {};
                    result.forEach((obj)=>{
                        OBDDriveDetial.dictDrive[obj.code] = obj.tip;
                    });
                    cb(null, OBDDriveDetial.dictDrive);
                }
            });
        }
    }

    export interface DictMap{
        [key:number] : string;
    }

    export class CarSeries{
        brand:string;
        series:string;
        manufacturer:string;
    }

    export interface CarSeriesMapL1{
        [key:number] : CarSeries;
    }

    export interface CarSeriesMap{
        [key:number] : CarSeriesMapL1;
    }
}