/// <reference path="references.ts" />

module Service{
    export function GetCareInOrg(req, res){
        res.setHeader("Accept-Query", "page,pagesize");

        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT C.id, C.obd_code, C2.brand, C2.series,\n" +
                "\tmax(D.mileage) AS max_mileage, sum(D.runtime) AS sum_runtime, max(care_time) AS last_care_time,\n" +
                "\tC2.care_mileage, C2.care_hour\n" +
            "FROM t_car_info C\n" +
            "\tJOIN t_car_org O ON C.id = O.car_id\n" +
            "\tJOIN t_car C2 ON C.brand = C2.brandCode and C.series = C2.seriesCode\n" +
            "\tJOIN t_obd_drive D ON C.obd_code = D.obdCode\n" +
            "\tLEFT OUTER JOIN t_care_record R ON O.org_id = R.org_id and C.id = R.car_id\n" +
            "WHERE O.org_id = ?\n" +
            "GROUP BY C.id\n" +
            "HAVING max_mileage >= C2.care_mileage OR sum_runtime/60 >= C2.care_hour";
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
}