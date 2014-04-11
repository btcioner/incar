/// <reference path="references.ts" />

module Service{
    // 返回所有车主
    export function GetCarOwnerAll(req, res):void{
        res.setHeader("Accept-Query", "page,pagesize,org_id,org_city,brand_id,series_id,acc_nick,acc_phone");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT %s " +
            "FROM t_car_user as U " +
                "JOIN t_staff_account AS A ON U.acc_id = A.id " +
                "JOIN t_car_info AS C ON U.car_id = C.id " +
                "LEFT OUTER JOIN t_car_org AS CO ON CO.car_id = C.id " +
                "LEFT OUTER JOIN t_staff_org AS O ON CO.org_id = O.id " +
                "LEFT OUTER JOIN t_car AS S ON C.brand = S.brandCode and C.series = S.seriesCode " +
            "WHERE U.user_type = 1";
        var args = new Array();
        if(req.query.org_id) {sql += " and CO.org_id = ?"; args.push(req.query.org_id);}
        if(req.query.org_city) { sql += " and O.city = ?"; args.push(req.query.org_city); }
        if(req.query.brand_id) { sql += " and C.brand = ?"; args.push(req.query.brand_id); }
        if(req.query.series_id) { sql += " and C.series = ?"; args.push(req.query.series_id); }
        if(req.query.acc_nick) { sql += " and A.nick = ?"; args.push(req.query.acc_nick); }
        if(req.query.acc_phone) { sql += " and A.phone = ?"; args.push(req.query.acc_phone); }

        var sql2 = util.format(sql, "A.id AS acc_id, A.name AS acc_name, A.nick AS acc_nick, A.status AS acc_status, A.phone AS acc_phone, " +
            "O.name AS org_name, O.id AS org_id, " +
            "C.id AS car_id, C.license AS car_license, C.brand AS brand_id, S.brand AS car_brand, C.series AS series_id, S.series AS car_series, C.obd_code");
        if(page.IsValid()) sql2 += page.sql;
        var sql3 = util.format(sql, "COUNT(*) AS count");

        var task:any = { finished: 0 };
        task.begin = ()=>{
            dac.query(sql2, args, (ex, result)=>{
                task.A = {ex:ex, result:result};
                task.finished++;
                task.end();
            });

            dac.query(sql3, args, (ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 2 ) return;
            if(task.A.ex) { res.json(new TaskException(-1, "查询车主失败", task.A.ex)); return; }

            var totalCount = 0;
            if(!task.B.ex) totalCount = task.B.result[0].count;

            res.json({status:"ok", totalCount:totalCount, carowners:task.A.result});
            return;
        };

        task.begin();
    }

    // 返回某一个车主
    export function GetCarOwner(req, res):void{
        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT %s " +
            "FROM t_car_user as U " +
            "JOIN t_staff_account AS A ON U.acc_id = A.id " +
            "JOIN t_car_info AS C ON U.car_id = C.id " +
            "LEFT OUTER JOIN t_car_org AS CO ON CO.car_id = C.id " +
            "LEFT OUTER JOIN t_staff_org AS O ON CO.org_id = O.id " +
            "LEFT OUTER JOIN t_car AS S ON C.brand = S.brandCode and C.series = S.seriesCode " +
            "WHERE U.user_type = 1 and U.acc_id = ?";

        var sql2 = util.format(sql, "A.id AS acc_id, A.name AS acc_name, A.nick AS acc_nick, A.status AS acc_status, A.phone AS acc_phone, " +
            "O.name AS org_name, O.id AS org_id, " +
            "C.id AS car_id, C.license AS car_license, C.brand AS brand_id, S.brand AS car_brand, C.series AS series_id, S.series AS car_series, C.obd_code ");

        dac.query(sql2, [req.params.acc_id], (ex, result)=>{
            if(ex) {res.json(new TaskException(-1, "无法获取车主", ex)); return;}
            if(result.length === 0){ res.json(new TaskException(-1, "车主不存在", ex)); return;}
            else{
                res.json({ status:"ok", carowners: result });
                return;
            }
        });
    }

    // 增加车和车主
    export function AddCarOwner(req, res):void{
        if(Object.keys(req.body).length === 0){
            res.json({
                postData:{
                    org_id:4,
                    acc_name:"user99",
                    acc_pwd:"7d1d8b1504f2bf1da3db3cb8751ec62f197aa124",
                    acc_nick:"文章",
                    acc_phone:"13912345678",
                    brand_id:0,
                    series_id:1,
                    car_license:"京A45678",
                    obd_code:"WF12345"
                },
                remark:"必填:org_id,acc_name,acc_pwd,acc_nick"
            });
            return;
        }

        // 输入检查
        var data = req.body;
        if(!data.acc_name || data.acc_name.trim() === 0) { res.json(new TaskException(-1, "缺少acc_name参数", null)); return; }

        var dac = MySqlAccess.RetrievePool();
        var task:any = { finished : 0 };
        task.begin = ()=>{
            // 增加用户
            var sql = "INSERT t_staff_account(name,pwd,nick,last_login_time,phone) " +
                "(SELECT ?,?,?,'0000-0-0',? FROM t_staff_org WHERE EXISTS(SELECT * FROM t_staff_org WHERE id = ?) LIMIT 1)";
            dac.query(sql, [data.acc_name.trim(), data.acc_pwd, data.acc_nick, data.acc_phone, data.org_id], (ex,result)=>{
                if(ex){ res.json(new TaskException(-1, "创建用户失败", ex)); return; }
                else if(result.affectedRows === 0){ res.json(new TaskException(-1, util.format("组织(%d)不存在", data.org_id), ex)); return; }
                else{
                    task.createCar(result.insertId, data.org_id);
                    return;
                }
            });
        };

        task.createCar = (acc_id, org_id)=>{
            // 创建车
            dac.query("INSERT t_car_info(brand,series,license,obd_code) VALUES(?,?,?,?)", [data.brand_id, data.series_id, data.car_license,data.obd_code], (ex, result)=>{
                if(ex) { res.json(-1, "创建车失败", ex); return; }
                else{
                    var car_id = result.insertId;
                    // Create link between account and car
                    dac.query("INSERT t_car_user(car_id, acc_id, user_type) VALUES(?,?,?)", [car_id, acc_id, 1], (ex, result)=>{
                        task.A = {ex:ex, result:result};
                        task.finished++;
                        task.end();
                    });
                    // Create link between org and car
                    dac.query("INSERT t_car_org(car_id, org_id) VALUES(?,?)", [car_id, org_id], (ex, result)=>{
                        task.B = {ex:ex, result:result};
                        task.finished ++;
                        task.end();
                    });
                }
            });
        };

        task.end = ()=>{
            if(task.finished < 2) return;
            if(task.A.ex) { res.json(new TaskException(-1, "创建车主失败", task.A.ex)); return; }
            if(task.B.ex) { res.json(new TaskException(-1, "链接组织和车辆失败", task.B.ex)); return; }
            res.json({status:"ok"});
            return;
        };

        task.begin();
    }

    // 修改车主
    export function ModifyCarOwner(req, res):void{
        if(Object.keys(req.body).length === 0){
            res.json({
                putData:{
                    acc_nick:"文章",
                    acc_phone:"13912345678"
                },
                remark:"必填:无"
            });
            return;
        }

        var data = req.body;
        var task : any = { finished: 0 };
        var dac = MySqlAccess.RetrievePool();
        task.begin = ()=>{
            var sql = "SELECT * FROM t_staff_account WHERE id = ?";
            dac.query(sql, [req.params.acc_id], (ex, result)=>{
                if(ex){res.json(new TaskException(-1, "查询车主失败", ex)); return;}
                else if(result.length === 0){ res.json(new TaskException(-1, "车主不存在", null)); return; }
                else{
                    var acc : DTO.staff_account = result[0];
                    if(data.acc_nick && data.acc_nick.trim().length > 0) acc.nick = data.acc_nick.trim();
                    if(data.acc_phone && data.acc_phone.trim().length > 0) acc.phone = data.acc_phone.trim();
                    task.updateAccount(acc);
                    return;
                }
            });
        };

        task.updateAccount = (acc:DTO.staff_account)=>{
            dac.query("UPDATE t_staff_account SET ? WHERE id = ?", [acc, acc.id], (ex, result)=>{
                if(ex){res.json(new TaskException(-1, "修改车主信息失败", ex)); return;}
                else{ res.json({status:"ok"}); return; }
            });
        };

        task.begin();
    }

    // 删除车主
    export function DeleteCarOwner(req, res):void{
        var dac = MySqlAccess.RetrievePool();
        var sql = "DELETE FROM t_car_user WHERE acc_id = ? and user_type = 1";
        dac.query(sql, [req.params.acc_id], (ex, result)=>{
            if(ex) { res.json(new TaskException(-1, "删除车主失败", null)); return; }
            else if(result.affectedRows === 0) { res.json(new TaskException(-1, "车主不存在", null)); return; }
            else {
                res.json({ status:"ok", extra: util.format("%d条车主记录已被删除", result.affectedRows) });
                return;
            }
        });
    }
}