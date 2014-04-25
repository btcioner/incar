/// <reference path="references.ts" />

module Service{
    export function GetCareInOrg(req, res){
        res.setHeader("Accept-Query", "page,pagesize");

        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT C.id, C.obd_code, C2.brand, C2.series,\n" +
                "\tmax(D.mileage)-ifnull(max(R.care_mileage),0) AS new_mileage, sum(D.runtime)/60-ifnull(max(R.care_hour),0) AS new_runtime\n," +
                "\tmax(R.care_time) AS last_care_time,max(R.care_mileage) last_care_mileage, max(R.care_hour) last_care_hour,\n" +
                "\tC2.care_mileage, C2.care_hour\n" +
            "FROM t_car_info C\n" +
            "\tJOIN t_car_org O ON C.id = O.car_id\n" +
            "\tJOIN t_car C2 ON C.brand = C2.brandCode and C.series = C2.seriesCode\n" +
            "\tJOIN t_obd_drive D ON C.obd_code = D.obdCode\n" +
            "\tLEFT OUTER JOIN t_care_record R ON O.org_id = R.org_id and C.id = R.car_id\n" +
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
}