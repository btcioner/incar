/// <reference path="references.ts" />

module Service{
    export function GetAllBrand(req, res){
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT %s FROM t_car_dictionary";

        var task:any = { finished: 0 };
        task.begin = ()=>{
            var sqlA = util.format(sql, "COUNT(DISTINCT brandCode) count");
            dac.query(sqlA, null, (ex, result)=>{
                task.A = { ex:ex, result:result };
                task.finished++;
                task.end();
            });

            var sqlB = util.format(sql, "DISTINCT brandCode, brand");
            if(page.IsValid()) sqlB += page.sql;

            dac.query(sqlB, null, (ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 2) return;
            if(task.B.ex) { res.json(new TaskException(-1, "查询车款失败", task.B.ex)); return; }
            var totalCount = 0;
            if(!task.A.ex) totalCount = task.A.result[0].count;
            res.json({status:"ok", totalCount:totalCount, brands:task.B.result});
            return;
        };

        task.begin();
    }

    export function GetBrandSeries(req, res){
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT %s FROM t_car_dictionary WHERE brandCode = ?";
        var args = [req.params.brand_id];

        var task:any = { finished: 0 };
        task.begin = ()=>{
            var sqlA = util.format(sql, "COUNT(*) count");
            dac.query(sqlA, args, (ex, result)=>{
                task.A = { ex:ex, result:result };
                task.finished++;
                task.end();
            });

            var sqlB = util.format(sql, "*");
            if(page.IsValid()) sqlB += page.sql;

            dac.query(sqlB, args, (ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 2) return;
            if(task.B.ex) { res.json(new TaskException(-1, "查询车款失败", task.B.ex)); return; }
            var totalCount = 0;
            if(!task.A.ex) totalCount = task.A.result[0].count;
            res.json({status:"ok", totalCount:totalCount, series:task.B.result});
            return;
        };

        task.begin();
    }

    export function GetSeries(req, res){
        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT * FROM t_car_dictionary WHERE brandCode = ? and seriesCode = ?";
        var args = [req.params.brand_id, req.params.series_id];
        dac.query(sql, args, (ex, result)=>{
            if(ex) { res.json(new TaskException(-1, "查询车款失败", ex)); return; }
            if(result.length === 0){ res.json(new TaskException(-1, "指定的车款不存在", null)); return; }
            res.json({status:"ok", series:result[0]});
        });
    }
}