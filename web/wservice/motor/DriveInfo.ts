/// <reference path="references.ts" />

module Service{
    // 返回所有行车信息
    export function GetDriveInfoAll(req, res):void{
        res.setHeader("Accept-Query", "page,pagesize,city,s4_name,obd_code,brand,series");
        var page = new Pagination(req.query.page, req.query.pagesize);
        var filter = req.query;

        var task :any = { finished:0 };
        var dac =  MySqlAccess.RetrievePool();
        task.begin = ()=>{
            // 1.查询OBD数据
            var sql = "SELECT R.*, D.brand AS brand_name, D.series AS series_name, O.name AS s4_name, O.prov AS s4_prov, O.city AS s4_city\n" +
                "FROM t_obd_drive AS R\n" +
                "\tJOIN t_car as C on C.obd_code = R.obdcode\n" +
                "\tLEFT OUTER JOIN t_4s AS O on C.s4_id = O.id\n" +
                "\tLEFT OUTER JOIN t_car_dictionary AS D on C.brand = D.brandCode and C.series = D.seriesCode\n" +
                "WHERE 1=1";
            var args = [];
            if(filter.city){ sql += " and O.city = ?"; args.push(filter.city); }
            if(filter.s4_name){sql += " and O.name like ?"; args.push("%"+filter.s4_name+"%"); }
            if(filter.obd_code){ sql += " and R.obdcode = ?"; args.push(filter.obd_code); }
            if(filter.brand){ sql += " and C.brand = ?"; args.push(filter.brand);}
            if(filter.series){ sql += " and C.series = ?"; args.push(filter.series);}

            sql += " ORDER BY R.id DESC";
            if(page.IsValid()){
                sql += page.sql;
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
            args = [];
            if(filter.city){ sql += " and O.city = ?"; args.push(filter.city); }
            if(filter.org){sql += " and O.name like ?"; args.push("%"+filter.org+"%"); }
            if(filter.obd_code){ sql += " and R.obdcode = ?"; args.push(filter.obd_code); }
            dac.query(sql, args, (ex, result)=>{
                task.B = {ex:ex ,result:result};
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 2) return;

            // 都完成了
            if(task.A.ex){ res.json(new TaskException(-1, "查询OBD信息出错", task.A.ex)); return;}
            task.A.result.forEach((entry:any)=>{
                try {
                    entry.speedGroup = JSON.parse(entry.speedGroup);
                }
                catch(ex){
                    // ignore any exception....
                }
            });

            var totalCount = 0;
            if(!task.B.ex){
                totalCount = task.B.result[0].TotalCount;
            }

            res.json({status:"ok", totalCount:totalCount, drvInfos:task.A.result});
        };

        task.begin();
    }

    // 返回行车详情
    export function GetDriveDetail(req, res):void{
        // code drive_id
        var page = new Pagination(req.query.page, req.query.pagesize);

        var task :any = {finished:0};
        var dac = MySqlAccess.RetrievePool();
        task.begin = ()=>{
            // 总条数
            dac.query("SELECT COUNT(*) COUNT FROM t_drive_detail WHERE obdCode = ? and obdDriveId = ?",
                [req.params.obd_code, req.params.drive_id], (ex, result)=>{
                    task.A = {ex:ex, result:result};
                    task.finished++;
                    task.end();
                });

            // 主要数据
            var sql = "SELECT *\n" +
                "FROM t_drive_detail\n" +
                "WHERE obdCode = ? and obdDriveId = ?\n";
            if(page.IsValid()) sql += page.sql;
            dac.query(sql, [req.params.obd_code, req.params.drive_id],(ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });

            // 字典表
            dac.query("SELECT code, tip FROM t_drive_dictionary;", null, (ex, result)=>{
                task.C = { ex:ex, result:result };
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 3) return;
            if(task.B.ex) { res.json(new TaskException(-1, "获取行驶详情失败", task.B.ex)); return;};

            task.B.result.forEach((obj:any)=>{
                if(obj.detail){
                    try{
                        obj.detail = JSON.parse(obj.detail);
                    }
                    catch(ex){
                     // ignore any exception
                    }
                }
            });

            var totalCount = 0;
            if(!task.A.ex){
                totalCount = task.A.result[0].COUNT;
            }

            if(!task.C.ex){
                var map:any = {};
                task.C.result.forEach((v:any)=>{
                    map[v.code] = v.tip;
                });

                task.B.result.forEach((detail)=>{
                    if(detail.detail){
                        detail.detail.forEach((obj:any)=>{
                            if(obj && obj.id !== undefined && obj.id !== null){
                                obj.tip = map[obj.id];
                            }
                        });
                    }
                });
            }

            res.json({status:"ok", totalCount:totalCount, details:task.B.result});
        };

        task.begin();
    }
}