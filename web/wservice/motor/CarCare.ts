/// <reference path="references.ts" />

module Service{
    export function GetCareInOrg(req, res){
        res.setHeader("Accept-Query", "page,pagesize");

        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT C.id, C.obd_code, C2.brand, C2.series, A.nick AS owner_nick, A.phone As owner_phone,\n" +
                "\tmax(D.mileage)-ifnull(max(R.care_mileage),0) AS new_mileage, sum(D.runtime)/60-ifnull(max(R.care_hour),0) AS new_runtime\n," +
                "\tmax(R.care_time) AS last_care_time,max(R.care_mileage) last_care_mileage, max(R.care_hour) last_care_hour,\n" +
                "\tC2.care_mileage, C2.care_hour\n" +
            "FROM t_car_info C\n" +
            "\tJOIN t_car_org O ON C.id = O.car_id\n" +
            "\tJOIN t_car C2 ON C.brand = C2.brandCode and C.series = C2.seriesCode\n" +
            "\tJOIN t_obd_drive D ON C.obd_code = D.obdCode\n" +
            "\tLEFT OUTER JOIN t_care_record R ON O.org_id = R.org_id and C.id = R.car_id\n" +
            "\tLEFT OUTER JOIN t_car_user U ON U.car_id = C.id and U.user_type = 1\n" +
            "\tLEFT OUTER JOIN t_staff_account A ON A.id = U.acc_id\n" +
            "WHERE O.org_id = ?\n" +
            "GROUP BY C.id\n" +
            "HAVING new_mileage >= C2.care_mileage OR new_runtime >= C2.care_hour";
        var args = [req.params.org_id];
        var dac = MySqlAccess.RetrievePool();

        var task:any = { finished: 0};
        task.begin = ()=>{
            var sqlA = util.format("SELECT COUNT(*) count FROM (\n%s\n) AS S", sql);
            dac.query(sqlA, args, (ex, result)=>{
                task.A = { ex:ex, result:result };
                task.finished++;
                task.end();
            });

            var sqlB = sql;
            if(page.IsValid()) sqlB += page.sql;
            dac.query(sqlB, args, (ex, result)=>{
                task.B = { ex:ex, result:result };
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 2) return;
            if(task.B.ex) { res.json(new TaskException(-1, "查询待保养车辆失败", task.B.ex)); return; };

            var totalCount = 0;
            if(!task.A.ex) totalCount = task.A.result[0].count;

            res.json({status:"ok", totalCount:totalCount, cars:task.B.result});
        };

        task.begin();
    }

    export function GetCareRecordInOrg(req, res){
        res.setHeader("Accept-Query", "page,pagesize,acc_id,car_id");
        var page = new Pagination(req.query.page, req.query.pagesize);
        var sql = "SELECT R.*, O.name AS org_name, O.class AS org_class, C.license, C.comment,\n" +
            "U.name AS cust_name, U.nick AS cust_nick, U.phone AS cust_phone,\n" +
            "A.name AS acc_name, A.nick AS acc_nick\n" +
            "FROM t_care_record R \n" +
            "\tLEFT OUTER JOIN t_staff_org O ON R.org_id = O.id\n" +
            "\tLEFT OUTER JOIN t_car_info C ON R.car_id = C.id\n" +
            "\tLEFT OUTER JOIN t_staff_account U ON R.cust_id = U.id\n" +
            "\tLEFT OUTER JOIN t_staff_account A ON R.acc_id = A.id\n" +
            "WHERE R.org_id = ?";
        var args = [req.params.org_id];

        if(req.query.acc_id){
            sql += " and R.acc_id = ?";
            args.push(req.query.acc_id);
        }

        if(req.query.car_id){
            sql += " and R.car_id = ?";
            args.push(req.query.car_id);
        }

        var dac = MySqlAccess.RetrievePool();
        var task:any = { finished : 0 };
        task.begin = ()=>{
            var sqlA = sql;
            if(page.IsValid()) sqlA += page.sql;
            dac.query(sqlA, args, (ex, result)=>{
                task.A = {ex:ex, result:result};
                task.finished++;
                task.end();
            });

            var sqlB = util.format("SELECT COUNT(*) count FROM (\n%s\n) AS S", sql);
            dac.query(sqlB, args, (ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 2) return;
            if(task.A.ex) { res.json(new TaskException(-1, "查询关怀记录失败", task.A.ex)); return;}

            var total = 0;
            if(!task.B.ex) total = task.B.result[0].count;

            res.json({status:"ok", totalCount:total, records:task.A.result});
        };

        task.begin();
    }

    export function AddCareRecordInOrg(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                car_id:1,
                cust_id:156,
                work_id:122
            });
            return;
        }

        if(!req.body.car_id) {res.json(new TaskException(-1, "缺少参数car_id", null)); return;}

        var dac = MySqlAccess.RetrievePool();
        var task:any = { finished: 0};
        task.begin = ()=>{
            // 获取操作帐号ID
            Account.CreateFromToken(req.cookies.token, (ex, acc)=>{
                if(ex) {res.json(new TaskException(-1, "获取操作帐号失败", ex)); return; }
                else{
                    task.A = { oper: acc };
                    task.finished++;
                    task.FindCarStatus();
                    return;
                }
            });
        };

        task.FindCarStatus = ()=>{
            var sql = "SELECT max(D.mileage) AS max_mileage, sum(D.runtime) AS sum_runtime\n" +
                "FROM t_car_info C JOIN t_obd_drive D ON C.obd_code = D.obdCode\n" +
                "WHERE C.id = ?";
            dac.query(sql, [req.body.car_id], (ex, result)=>{
                if(ex) {res.json(new TaskException(-1, "查询车辆状态失败", ex)); return;}
                else if(result.length === 0){
                    task.B = {mileage:0, hour:0};
                }
                else{
                    task.B = { mileage: result[0].max_mileage, hour: result[0].sum_runtime/60};
                }
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            var sql = "INSERT t_care_record(org_id,acc_id,car_id,cust_id," +
                "care_time,care_mileage,care_hour,work_id) VALUES(?,?,?,?,?,?,?,?)";
            var args = [
                req.params.org_id,
                task.A.oper.id,
                req.body.car_id,
                req.body.cust_id,
                new Date(),
                task.B.mileage,
                task.B.hour,
                req.body.work_id
            ];
            dac.query(sql, args, (ex, result)=>{
                if(ex) {res.json(new TaskException(-1, "创建关怀记录失败", ex)); return;}
                else{
                    res.json({status:"ok", id:result.insertId});
                }
            });
        };

        task.begin();
    }
}