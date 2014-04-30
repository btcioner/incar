/// <reference path="references.ts" />

module Service{
    export function GetCareInOrg(req, res){
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var dac = MySqlAccess.RetrievePool();

        var task:any = { finished: 0 };
        task.begin = ()=>{
            var sql = "SELECT C.id, C.obd_code, C2.brand, C2.series,U.acc_id AS owner_id, A.nick AS owner_nick, A.phone As owner_phone,\n" +
                "\tmax(D.mileage) AS max_mileage, sum(D.runtime)/60 AS max_hour,\n"+
                "\tC2.care_mileage, C2.care_hour\n" +
                "FROM t_car_info C\n" +
                "\tJOIN t_car_org O ON C.id = O.car_id\n" +
                "\tJOIN t_car C2 ON C.brand = C2.brandCode and C.series = C2.seriesCode\n" +
                "\tJOIN t_obd_drive D ON C.obd_code = D.obdCode\n" +
                "\tLEFT OUTER JOIN t_car_user U ON U.car_id = C.id and U.user_type = 1\n" +
                "\tLEFT OUTER JOIN t_staff_account A ON A.id = U.acc_id\n" +
                "WHERE O.org_id = ? and C.id NOT IN(SELECT car_id FROM t_work WHERE work='care' and step in ('applied','approved','refused'))\n" +
                "GROUP BY C.id HAVING (max_mileage >= C2.care_mileage or max_hour >= C2.care_hour)";
            var args = [req.params.org_id];

            dac.query(sql, args, (ex, result)=>{
                task.finished++;
                if(ex) { res.json(new TaskException(-1, "检索行车信息失败", ex)); return; }
                task.A = { result: result };
                task.findRecord();
            });
        };

        task.findRecord = ()=>{
            task.B = new Array();
            task.A.result.forEach((entry:any)=>{
                var sql = "SELECT * FROM t_work\n" +
                    "WHERE org_id = ? and car_id = ? and work = 'care' and step = 'done'\n" +
                    "ORDER BY updated_time DESC LIMIT 1";
                dac.query(sql, [req.params.org_id, entry.id], (ex, result)=>{
                    task.finished++;
                    if(ex || result.length === 0){
                        // 无保养纪录,符合条件
                        entry.new_mileage = entry.max_mileage;
                        entry.new_hour = entry.max_hour;
                        entry.last_care_time = null;
                        task.B.push(entry);
                    }
                    else{
                        try{
                            var json_args = JSON.parse(result[0].json_args);
                            if(json_args.care_mileage && json_args.care_hour){
                                if(entry.max_mileage - json_args.care_mileage >= entry.care_mileage || entry.max_hour - json_args.care_hour >= entry.care_hour){
                                    // 扣除最后一次保养,仍然符合条件的
                                    entry.new_mileage = entry.max_mileage - json_args.care_mileage;
                                    entry.new_hour = entry.max_hour - json_args.care_hour;
                                    entry.last_care_time = result[0].updated_time;
                                    task.B.push(entry);
                                }
                            }
                            else{
                                // 解析不出保养里程,也算符合条件
                                entry.new_mileage = entry.max_mileage;
                                entry.new_hour = entry.max_hour;
                                entry.last_care_time = result[0].updated_time;
                                task.B.push(entry);
                            }
                        }
                        catch(e){
                            // 解析不出,也算符合条件
                            entry.new_mileage = entry.max_mileage;
                            entry.new_hour = entry.max_hour;
                            entry.last_care_time = result[0].updated_time;
                            task.B.push(entry);
                            console.log(new TaskException(-1, "解析t_work.json_args失败", e));
                        }
                    }
                    task.end();
                });
            });
            task.end();
        };

        task.end = ()=>{
            if(task.finished < task.A.result.length + 1) return;
            var total = task.B.length;
            if(page.IsValid()) {
                var result = new Array();
                var i = page._offset;
                while(result.length < page._pagesize && i<task.B.length){
                    result.push(task.B[i]);
                    i++;
                }
                res.json({status:"ok", totalCount:total, cars: result });
            }
            else{
                res.json({status:"ok", totalCount:total, cars: task.B });
            }
        };

        task.begin();
    }

    export function GetCareTeleRecordInOrg(req, res){
        res.setHeader("Accept-Query", "page,pagesize,car_id");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT %s\n" +
            "FROM t_work_log L\n" +
            "\tJOIN t_work W ON W.id = L.work_id\n" +
            "\tLEFT OUTER JOIN t_staff_account A ON A.id = W.cust_id\n" +
            "\tLEFT OUTER JOIN t_car_info C ON C.id = W.car_id\n" +
            "\tLEFT OUTER JOIN t_car C2 ON C2.brandCode = C.brand and C2.seriesCode = C.series\n" +
            "WHERE W.work='care' and L.step in('applied', 'refused') and L.json_args LIKE '%\"via\":\"web\"%' and W.org_id = ?";
        var args = [req.params.org_id];

        if(req.query.car_id){
            sql += " and W.car_id = ?";
            args.push(req.query.car_id);
        }

        sql += "\nORDER BY L.log_time DESC"

        var task:any = {finished:0};
        task.begin = ()=>{
            var sqlA = util.format(sql, "COUNT(L.id) count");
            dac.query(sqlA, args, (ex, result)=>{
                task.A = {ex:ex, result:result};
                task.finished++;
                task.end();
            });

            var sqlB = util.format(sql, "L.*," +
                "W.cust_id, A.nick AS cust_nick, A.phone AS cust_phone,W.car_id, C.license, C2.brand, C2.series");
            if(page.IsValid()) sqlB += page.sql;
            dac.query(sqlB, args, (ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 2) return;
            if(task.B.ex) {res.json(new TaskException(-1, "查询电话关怀记录失败", task.B.ex)); return;}

            task.B.result.forEach((entry:any)=>{
                try {
                    entry.json_args = JSON.parse(entry.json_args);
                }
                catch(e){
                    console.log(e);
                }
            });

            var total = 0;
            if(!task.A.ex) total = task.A.result[0].count;
            res.json({status:"ok", totalCount:total, records:task.B.result});
        };

        task.begin();
    }
}