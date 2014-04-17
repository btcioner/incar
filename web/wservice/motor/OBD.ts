/// <reference path="references.ts" />

module Service {
    // 登记OBD设备
    export function AddOBDDevice(req, res):void{
        // 检测用户是否有权限执行
        var data = req.body;
        var token = req.cookies.token;

        if(!token){res.json({status: "用户没有登录"});return;}
        if(!data.code){res.json({status: "缺少code参数"});return;}
        if(data.code.trim().length === 0) { res.json({status: "code不能为空白"}); return;}

        Account.CreateFromToken(token, (err, account)=>{
            if(err){
                res.json(err);
            }
            else{
                // 向OBD设备仓库中添加新设备
                var repo = new DeviceRepository();
                var dev :any = new OBDDevice();
                dev.obd_code = data.code.trim();
                dev.sim_number = data.phone_number;
                dev.comment = data.comment;
                dev.status = 0;

                repo.Add(account, [dev], (err3, devs)=>{
                    if(err3) res.json(err3);
                    else if(devs && devs.length === 1){
                        res.json({
                            status:"ok",
                            dev: devs[0]
                        });
                    }
                    else{
                        res.json({status: "未知错误"});
                    }
                });
           }
        });
    }

    // 返回全部OBD设备
    export function GetAllOBDDevices(req, res):void{
        // 检测用户是否有权限执行
        var data = req.body;
        var token = req.cookies.token;
        var page = new Pagination(req.query.page, req.query.pagesize);

        Account.CreateFromToken(token, (ex, account)=>{
            if(ex){
                res.json(ex);
                return;
            }
            else{
                // 返回全OBD设备
                var repo = new DeviceRepository();
                repo.All(account, page, (ex, totalCount, devs)=>{
                    if(ex) res.json(ex);
                    else res.json({
                        status:"ok",
                        totalCount:totalCount,
                        devs: devs
                    });
                });
            }
        });
    }

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

        if(!token){ res.json({status: "用户没有登录"}); return;}

        Account.CreateFromToken(token, (ex, account)=>{
            if(ex){
                res.json(ex);
                return;
            }

            var repo = new DeviceRepository();
            repo.AllDriveInfos(filter, new Pagination(page, pagesize),
                (ex:TaskException, drvInfos:DTO.obd_drive[], count:number)=>{
                    if(ex)
                        res.json(ex);
                    else
                        res.json({status:"ok", totalCount:count , drvInfos: drvInfos});
                });
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

        Account.CreateFromToken(token, (ex, account)=>{
            if(ex){
                res.json(ex);
                return;
            }

            var repo = new DeviceRepository();
            repo.GetByCode(account, code,  (error, dev)=>{
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

        Account.CreateFromToken(token, (ex, account)=>{
            if(ex){
                res.json(ex);
                return;
            }
            else{
                var repo = new DeviceRepository();
                repo.GetByCode(account, code, (ex, dev)=>{
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
        });
    }

    // 返回某个ORG的所有OBD
    export function GetOBDByOrg(req, res):void{
        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT C.*" +
            " FROM t_car_info as C" +
            " join t_car_org as R on R.car_id = C.id" +
            " WHERE R.org_id = ?;";
        dac.query(sql, [req.params.org_id], (ex, result)=>{
            if(ex) { res.json(ex); return; }
            else{
                res.json({status:"ok", devs:result});
            }
        });
    }

    // 按obd_code返回OBD相关信息
    export function GetOBDByCode(req, res):void{
        var obdCode = req.params.obd_code;

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT A.name, A.nick, A.phone,\n" +
                         "\tC.obd_code, C.sim_number,C.act_type,\n" +
                         "\tS.brand, S.series,\n" +
                         "\tO.city AS org_city, O.name AS org_name\n" +
            "FROM t_car_info AS C\n" +
                "\tLEFT OUTER JOIN t_car as S on C.brand = S.brandcode and C.series = S.seriescode\n" +
                "\tLEFT OUTER JOIN t_car_user as U on C.id = U.car_id\n" +
                "\tLEFT OUTER JOIN t_staff_account as A on U.acc_id = A.id\n" +
                "\tLEFT OUTER JOIN t_car_org as R2 on R2.car_id = C.id\n" +
                "\tLEFT OUTER JOIN t_staff_org as O on R2.org_id = O.id\n" +
            "WHERE C.obd_code = ?";

        var task :any = {};
        task.begin = ()=>{
            dac.query(sql, [obdCode], (ex, result)=>{
                if(ex) {res.json(new TaskException(-1, "获取OBD信息失败", ex)); return; }
                else if(result.length === 0){ res.json(new TaskException(-1, util.format("OBD设备(%s)不存在!", obdCode), null)); return;}
                else if(result.length > 1){ res.json(new TaskException(-1, "数据无效", null)); return; }
                else{
                    res.json({status:"ok", obd:result[0]});
                }
            });
        };

        task.begin();
    }

    // 修改OBD的
    export function ModifyOBD(req, res):void{
        var data = req.body;
        if(Object.keys(data).length === 0){
            res.json({
                postData:{
                    sim_number:"13912345678"
                }
            });
            return;
        }

        if(data.sim_number !== undefined && data.sim_number !== null && data.sim_number.trim()  > 0){

        }
        else{
            res.json(new TaskException(-1, "缺少sim参数", null));
            return;
        }

        var dac = MySqlAccess.RetrievePool();
        var sql = "UPDATE t_car_info set sim_number = ? WHERE obd_code = ?";
        dac.query(sql, [data.sim_number.trim(), req.params.obd_code], (ex, result)=>{
            if(ex){ res.json(new TaskException(-1, "写入SIM卡号失败", ex)); return;}
            else if(result.affectedRows === 0){ res.json(new TaskException(-1, "OBD设备不存在", null)); return;}
            else{ res.json({status:"ok"}); return;}
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
        All(oper:Account, page:Pagination, cb:(ex:TaskException,totalCount:number, devs:Array<DTO.device_obd>)=>void):void{

            var topOrg = OrgRepository.CreateTopOrg();
            oper.IsGranted(topOrg, "READ", (err2, granted)=>{
                if(err2) { cb (new TaskException(-1, "访问权限许可失败", err2), 0, null); return; }
                else if(!granted){ cb(new TaskException(-1, util.format("用户%s没有查看全部OBD设备的权限", oper.name), null),0, null); return;}
                else{
                    var task:any={ finished : 0};

                    task.begin = ()=> {
                        var sql = "SELECT * FROM t_car_info WHERE obd_code IS NOT NULL"
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
            });
        }

        // 批量增加OBD设备
        Add(oper:Account, devs:Array<OBDDevice>, cb:(ex:TaskException, devs:Array<OBDDevice>)=>void):void{
            var topOrg = OrgRepository.CreateTopOrg();
            oper.IsGranted(topOrg, "WRITE", (ex, granted)=>{
                if(ex){
                    cb(ex, null);
                    return;
                }
                else if(granted){
                    var tmCreate = new Date();
                    var dtos = new Array<DTO.device_obd>();
                    devs.forEach((dev)=>{
                        var dto = OBDDevice.CreateDTO(dev);
                        dto.created_date = tmCreate;
                        dtos.push(dto);
                    });
                    var strV:string = "";
                    var i = 0;
                    dtos.forEach((obj)=>{
                        if(i > 0) strV += ",";
                        strV += util.format("(%s,%s,%s, CURRENT_TIMESTAMP)",
                            this.dac.escape(obj.obd_code),
                            this.dac.escape(obj.sim_number),
                            this.dac.escape(obj.comment));
                        i++;
                    });
                    this.dac.query("INSERT t_car_info (obd_code, sim_number, comment, created_date) VALUES " + strV, null, (err, result)=>{
                        if(err) cb(new TaskException(-1, "插入数据失败", err), null);
                        else cb(null, devs);
                    });
                }
                else{
                    var buf = util.format("用户%s没有登记OBD设备的权限", oper.name);
                    cb(new TaskException(-1, buf, null), null);
                }
            });


        }

        // 获取指定的OBD设备
        GetByCode(oper:Account, code:string, cb:(error:TaskException, dev:OBDDevice)=>void):void{
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
                var sql = "SELECT R.*" +
                         " FROM t_obd_drive AS R" +
                              " JOIN t_car_info as C on C.obd_code = R.obdcode" +
                              " LEFT OUTER JOIN t_car_org as R2 on R2.car_id = C.id" +
                              " LEFT OUTER JOIN t_staff_org as O on R2.org_id = O.id" +
                         " WHERE 1=1";
                var args = new Array();
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
                    " JOIN t_car_info as C on C.obd_code = R.obdcode" +
                    " LEFT OUTER JOIN t_car_org as R2 on R2.car_id = C.id" +
                    " LEFT OUTER JOIN t_staff_org as O on R2.org_id = O.id" +
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
                "FROM t_car", null, (ex, result)=>{
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