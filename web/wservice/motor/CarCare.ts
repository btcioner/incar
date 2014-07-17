/// <reference path="references.ts" />

module Service{
    export function GetCareInOrg(req, res){
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();

        var task:any = { finished: 0 };
        task.begin = ()=>{
            var sql = "SELECT C.id, C.obd_code, C2.brand, C2.series, C.age, U.acc_id AS owner_id, A.nick AS owner_nick, A.phone As owner_phone,\n" +
                "\tmax(D.mileage) AS max_mileage,\n" +
                "\tdatediff(now(),ifnull(max(W.working_time),C.age))*24 AS care_since_hours,\n"+
                "\tC2.care_mileage, C2.care_hour\n" +
                "FROM t_car C\n" +
                "\tJOIN t_car_dictionary C2 ON C.brand = C2.brandCode and C.series = C2.seriesCode\n" +
                "\tJOIN t_obd_drive D ON C.obd_code = D.obdCode\n" +
                "\tLEFT OUTER JOIN t_car_user U ON U.car_id = C.id and U.user_type = 1\n" +
                "\tLEFT OUTER JOIN t_account A ON A.id = U.acc_id and A.s4_id = U.s4_id\n" +
                "\tLEFT OUTER JOIN t_work W ON W.work = 'care' and W.step = 'step' and W.car_id = C.id\n" +
                "WHERE C.s4_id = ? -- and C.id NOT IN(SELECT car_id FROM t_work WHERE work='care' and step in ('applied','approved','refused'))\n" +
                "GROUP BY C.id HAVING (max_mileage >= C2.care_mileage) or care_since_hours >= C2.care_hour";
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
                    "ORDER BY working_time DESC LIMIT 1";
                dac.query(sql, [req.params.org_id, entry.id], (ex, result)=>{
                    task.finished++;
                    if(ex || result.length === 0){
                        // 无保养纪录,符合条件
                        entry.new_mileage = entry.max_mileage;
                        entry.new_hour = entry.care_since_hours;
                        entry.last_care_time = null;
                        task.B.push(entry);
                    }
                    else{
                        try{
                            var json_args = JSON.parse(result[0].json_args);
                            if(json_args.care_mileage && json_args.care_hour){
                                if(entry.max_mileage - json_args.care_mileage >= entry.care_mileage || entry.care_since_hours >= entry.care_hour){
                                    // 扣除最后一次保养,仍然符合条件的
                                    entry.new_mileage = entry.max_mileage - json_args.care_mileage;
                                    entry.new_hour = entry.care_since_hours;
                                    entry.last_care_time = result[0].updated_time;
                                    task.B.push(entry);
                                }
                            }
                            else{
                                // 解析不出保养里程,也算符合条件
                                entry.new_mileage = entry.max_mileage;
                                entry.new_hour = entry.care_since_hours;
                                entry.last_care_time = result[0].updated_time;
                                task.B.push(entry);
                            }
                        }
                        catch(e){
                            // 解析不出,也算符合条件
                            entry.new_mileage = entry.max_mileage;
                            entry.new_hour = entry.care_since_hours;
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
            "\tLEFT OUTER JOIN t_account A ON A.id = W.cust_id and A.s4_id = W.org_id\n" +
            "\tLEFT OUTER JOIN t_car C ON C.id = W.car_id\n" +
            "\tLEFT OUTER JOIN t_car_dictionary C2 ON C2.brandCode = C.brand and C2.seriesCode = C.series\n" +
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

    export function Get4SCare(req, res):void{
        if(Object.keys(req.body).length == 0){
            res.json({
                postSample:{
                    token:"This=is=a=fake=token===demo=onlyeJUAPmtjgU9e77pOULn1Z75oWFVh6Tm19iVrUVBxZkGg==",
                    page:1,
                    pagesize:20
                },
                remark:"必填:token"
            });
            return;
        }
        // 校验token
        Staff.CreateFromToken(req.body.token, (ex, staff)=>{
            if(ex){ res.json(new TaskException(-1, "校验token失败", ex)); return; }
            // 查询4S店基本信息
            var repo4S = new S4Repository();
            repo4S.Get4SById(staff.dto.s4_id, (ex, s4)=>{
                if(ex){ res.json(new TaskException(-2, util.format("无效4S店(%s)", staff.dto.s4_id), ex)); return; }
                var filter = { work:"care", step:"applied" };
                var page = new Pagination(req.body.page, req.body.pagesize);
                s4.GetWork(filter, page, (ex, total, works)=>{
                    if(ex) { res.json(new TaskException(-3, "查询待保养信息失败", ex)); return; }
                    // 去掉一些不需要的信息
                    works.forEach((work:any)=>{
                        work.work = undefined;
                        work.step = undefined;
                        work.work_ref_id = undefined;
                        work.json_args = undefined;
                    });
                    res.json({status:"ok", total:total, list:works});
                });
            });
        });
    }

    export function Action4SCare(req, res):void{
        if(Object.keys(req.body).length == 0){
            res.json({
                postSample:{
                    token:"This=is=a=fake=token===demo=onlyeJUAPmtjgU9e77pOULn1Z75oWFVh6Tm19iVrUVBxZkGg==",
                    reason:"Why do you reject it?"
                },
                remark:"必填:token"
            });
            return;
        }
        // 校验token
        Staff.CreateFromToken(req.body.token, (ex, staff)=>{
            if(ex){ res.json(new TaskException(-1, "校验token失败", ex)); return; }
            // 查询4S店基本信息
            var repo4S = new S4Repository();
            repo4S.Get4SById(staff.dto.s4_id, (ex, s4)=>{
                if(ex){ res.json(new TaskException(-2, util.format("无效4S店(%s)", staff.dto.s4_id), ex)); return; }
                // 查询保养工作
                var workCare = new Work.care();
                var actionOP = workCare[req.params.action];
                if(!actionOP){
                    res.json(new TaskException(-3, util.format("无效请求:%s", req.params.action), null));
                    return;
                }
                // 查询保养工作
                var sql = "SELECT * FROM t_work WHERE id = ? and work = ? and org_id = ?";
                var dac = MySqlAccess.RetrievePool();
                dac.query(sql, [req.params.id, 'care', staff.dto.s4_id], (ex, result)=>{
                    if(ex){ res.json(new TaskException(-4, "查询保养工作失败", ex)); return; }
                    else if(result.length === 0){ res.json(new TaskException(-5, util.format("指定的工作无效(id=%s)", req.params.id), null)); return; }

                    for(var x in result[0]){
                        workCare[x] = result[0][x];
                    }

                    try {
                        req.cookies.token = req.body.token;
                        actionOP.call(workCare, req, res);
                    }
                    catch(ex){
                        res.json(new TaskException(-6, "执行请求失败", ex.toString()));
                    }

                });
            });
        });
    }
}

module Work{
    // 保养工作
    export class care extends WorkBase {
        constructor(){
            super("care");
        }

        // 客户提交保养申请
        apply(req, res){
            var error = "";
            var data = req.body;
            if(!data.car_id) { error += "缺少car_id\n"; }
            if(!data.cust_id) { error += "缺少cust_id\n"; }
            if(!data.working_time) { error += "缺少working_time\n"; }
            if(error){
                res.json(new Service.TaskException(-1, error, null));
                return;
            }

            this.step = "done";
            this.org_id = req.params.org_id;
            this.car_id = data.car_id;
            this.cust_id = data.cust_id;
            this.working_time = data.working_time;


            Service.Staff.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return;}
                else{
                    var task:any = { finished: 0 };
                    var dac = Service.MySqlAccess.RetrievePool();
                    task.begin = ()=>{
                        // 向t_slot_booking中登记
                        var sql = "INSERT t_slot_booking(storeId,slot_location,slot_time,promotion_id," +
                            "channel,channel_specific,booking_time,booking_status,tc,ts)" +
                            "\nVALUES(?,?,?,?,?,?,?,?,?,?)";
                        var tmNow = new Date();
                        var args = [this.org_id,
                            data.slot,
                            this.working_time,
                            data.promotion_id,
                            "website",
                            util.format("id:%s,name:%s,nick:%s", userLogin.dto.id, userLogin.dto.name, userLogin.dto.nick),
                            tmNow,
                            "3",
                            userLogin.dto.name,
                            tmNow
                        ];
                        dac.query(sql, args, (ex, result)=>{
                            task.finished++;
                            if(ex) { res.json(new Service.TaskException(-1,"登记工位失败",ex)); return; }

                            task.RegistWork(result.insertId);
                        });
                    };

                    task.RegistWork = (booking_id:number)=>{
                        // 向t_work中登记
                        this.json_args = JSON.stringify({
                            oper:userLogin.dto.nick,
                            via:"web",
                            begin_time:data.begin_time,
                            care_mileage:data.care_mileage,
                            care_items:data.care_items,
                            care_cost:data.care_cost
                        });
                        this.work_ref_id = booking_id;

                        var sql2 = "INSERT t_work SET ?";
                        dac.query(sql2, [this], (ex, result)=>{
                            task.finished++;
                            if(ex) { res.json(new Service.TaskException(-1, "创建工作对象失败", ex)); return; }

                            this.id =result.insertId;
                            var log = new WorkLog(this);
                            log.Save((ex, objLog)=>{
                                if(ex){ res.json(new Service.TaskException(-1, "创建工作对象成功,但记录日志失败", ex)); return; }
                                else{
                                    res.json({status:"ok"});
                                }
                            });
                        });
                    };

                    task.begin();
                }
            });
        }

        // 批准保养申请
        approve(req, res){
            if(this.step !== "applied") { res.json(new Service.TaskException(-1, "只有处于'已申请'状态才可以被批准", null)); return; }

            Service.Staff.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return; }
                else{
                    var data:any = req.body;
                    this.json_args = JSON.stringify({
                        oper: userLogin.dto.nick,
                        brand:data.brand,
                        series:data.series,
                        license:data.license
                    });
                    console.log(this.json_args);
//                  this.json_args = JSON.stringify({oper:userLogin.dto.nick});
                    var sql = "UPDATE t_work SET step = 'approved', json_args = ? WHERE id = ? and step = 'applied'";
                    var dac = Service.MySqlAccess.RetrievePool();
                    dac.query(sql, [this.json_args, this.id], (ex, result)=>{
                        if(ex) {res.json(new Service.TaskException(-1, "批准保养申请失败", ex)); return; }
                        else if(result.affectedRows === 0){ {res.json(new Service.TaskException(-1, "批准保养申请失败,请刷新重试", null)); return; } }
                        else{
                            this.step = "approved";
                            sql = "INSERT t_work_log(work_id, work, step, json_args) VALUES(?,?,?,?)";
                            dac.query(sql, [this.id, this.work, this.step, this.json_args], (ex ,result)=>{
                                if(ex) {res.json(new Service.TaskException(-1, "保养申请成功,但记录日志失败", ex)); return; }
                                else{
                                    sql = "UPDATE t_slot_booking SET booking_status = 3, tc = ? WHERE id = ?";
                                    dac.query(sql, [userLogin.dto.nick, this.work_ref_id], (ex, result)=>{
                                        if(ex){ res.json(new Service.TaskException(-1, "修改预约状态失败", ex)); return; }
                                        else{
                                            res.json({status:"ok"});
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        // 拒绝保养申请
        reject(req, res){
            if(this.step !== "applied") { res.json(new Service.TaskException(-1, "只有处于'已申请'状态才可以被拒绝", null)); return; }
            if(!req.body.reason) { res.json(new Service.TaskException(-1, "缺少reason参数", null)); return; }

            Service.Staff.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) { res.json(ex); return; }
                else{
//                    this.json_args = JSON.stringify({reason:req.body.reason, oper:userLogin.dto.nick});

                    this.json_args = JSON.stringify({
                        oper: userLogin.dto.nick,
                        brand:req.body.brand,
                        series:req.body.series,
                        reason:req.body.reason,
                        license:req.body.license
                    });

                    var sql = "UPDATE t_work SET step = 'rejected', json_args = ? WHERE id = ? and step = 'applied'";
                    var dac = Service.MySqlAccess.RetrievePool();
                    dac.query(sql, [this.json_args, this.id], (ex, result)=>{
                        if(ex) {res.json(new Service.TaskException(-1, "拒绝保养申请失败", ex)); return; }
                        else if(result.affectedRows === 0){ {res.json(new Service.TaskException(-1, "拒绝保养申请失败,请刷新重试", null)); return; } }
                        else{
                            this.step = "rejected";
                            sql = "INSERT t_work_log(work_id, work, step, json_args) VALUES(?,?,?,?)";
                            dac.query(sql, [this.id, this.work, this.step, this.json_args], (ex ,result)=>{
                                if(ex) {res.json(new Service.TaskException(-1, "拒绝申请成功,但记录日志失败", ex)); return; }
                                else{
                                    sql = "UPDATE t_slot_booking SET booking_status = 2, tc = ? WHERE id = ?";
                                    dac.query(sql, [userLogin.dto.nick, this.work_ref_id], (ex, result)=>{
                                        if(ex){ res.json(new Service.TaskException(-1, "修改预约状态失败", ex)); return; }
                                        else{
                                            res.json({status:"ok"});
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        // 取消保保养申请
        cancel(req, res){
            if(this.step !== "applied" && this.step !== "approved") { res.json(new Service.TaskException(-1, "保养工作已不可被取消", null)); return; }

            Service.Staff.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return; }
                else{
                    var args:any = { oper:userLogin.dto.nick,brand:req.body.brand,series:req.body.series,license:req.body.license};

                    if(req.body.reason) args.reason = req.body.reason;

                    this.json_args = JSON.stringify(args);

                    var sql = "UPDATE t_work SET step = 'cancelled', json_args = ? WHERE id = ? and step in ('applied', 'approved')";
                    var dac = Service.MySqlAccess.RetrievePool();
                    dac.query(sql, [this.json_args, this.id], (ex, result)=>{
                        if(ex) {res.json(new Service.TaskException(-1, "取消保养申请失败", ex)); return; }
                        else if(result.affectedRows === 0){ {res.json(new Service.TaskException(-1, "取消保养申请失败,请刷新重试", null)); return; } }
                        else{
                            this.step = "cancelled";
                            sql = "INSERT t_work_log(work_id, work, step, json_args) VALUES(?,?,?,?)";
                            dac.query(sql, [this.id, this.work, this.step, this.json_args], (ex ,result)=>{
                                if(ex) {res.json(new Service.TaskException(-1, "取消申请成功,但记录日志失败", ex)); return; }
                                else{
                                    sql = "UPDATE t_slot_booking SET booking_status = 4, tc = ? WHERE id = ?";
                                    dac.query(sql, [userLogin.dto.nick, this.work_ref_id], (ex, result)=>{
                                        if(ex){ res.json(new Service.TaskException(-1, "修改预约状态失败", ex)); return; }
                                        else{
                                            res.json({status:"ok"});
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        //  中止保养申请
        abort(req, res){
            if(this.step !== "approved") { res.json(new Service.TaskException(-1, "只有处于'已批准'状态才可以被中止", null)); return; }
          //  if(!req.body.reason) { res.json(new Service.TaskException(-1, "缺少reason参数", null)); return; }

            Service.Staff.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return;}
                else{
                    this.json_args = JSON.stringify({oper:userLogin.dto.nick, reason:req.body.reason,brand:req.body.brand,series:req.body.series,license:req.body.license});

                    var sql = "UPDATE t_work SET step = 'aborted', json_args = ? WHERE id = ? and step = 'approved'";
                    var dac = Service.MySqlAccess.RetrievePool();
                    dac.query(sql, [this.json_args, this.id], (ex, result)=>{
                        if(ex) {res.json(new Service.TaskException(-1, "中止保养申请失败", ex)); return; }
                        else if(result.affectedRows === 0){ {res.json(new Service.TaskException(-1, "中止保养申请失败,请刷新重试", null)); return; } }
                        else{
                            this.step = "aborted";
                            sql = "INSERT t_work_log(work_id, work, step, json_args) VALUES(?,?,?,?)";
                            dac.query(sql, [this.id, this.work, this.step, this.json_args], (ex ,result)=>{
                                if(ex) {res.json(new Service.TaskException(-1, "中止申请成功,但记录日志失败", ex)); return; }
                                else{
                                    sql = "UPDATE t_slot_booking SET booking_status = 6 WHERE id = ?";
                                    dac.query(sql, [this.work_ref_id], (ex, result)=>{
                                        if(ex) { res.json(new Service.TaskException(-1, "微信状态修改失败", ex)); return;}
                                        res.json({status:"ok"});
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        // 完成保养
        done(req, res){
            if(this.step !== "approved") { res.json(new Service.TaskException(-1, "只有处于'已批准'状态才可以完成", null)); return; }

            Service.Staff.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return; }
                else{
                    var dac = Service.MySqlAccess.RetrievePool();
                    var sql = "SELECT max(D.mileage) AS max_mileage, sum(D.runtime)/60 AS sum_hour\n" +
                        "FROM t_obd_drive D, t_car C WHERE C.obd_code = D.obdCode and C.id = ?\n" +
                        "GROUP BY C.id";
                    dac.query(sql, [this.car_id], (ex, result)=>{
                        var mileage = 0, hour = 0;
                        if(!ex && result.length > 0){
                            mileage = result[0].max_mileage;
                            hour = result[0].sum_hour;
                        }

                        var data:any = req.body;
                        this.json_args = JSON.stringify({
                            oper: userLogin.dto.nick,
                            care_items: data.care_items,
                            care_cost: data.care_cost,
                            care_mileage: mileage,
                            care_hour: hour,
                            begin_time: data.begin_time,
                            end_time: data.end_time,
                            brand:data.brand,
                            series:data.series,
                            license:data.license
                        });

                        var sql = "UPDATE t_work SET step = 'done', json_args = ? WHERE id = ? and step = 'approved'";
                        dac.query(sql, [this.json_args, this.id], (ex, result)=>{
                            if(ex) {res.json(new Service.TaskException(-1, "完成保养失败", ex)); return; }
                            else if(result.affectedRows === 0){ {res.json(new Service.TaskException(-1, "完成保养失败,请刷新重试", null)); return; } }
                            else{
                                this.step = "done";
                                sql = "INSERT t_work_log(work_id, work, step, json_args) VALUES(?,?,?,?)";
                                dac.query(sql, [this.id, this.work, this.step, this.json_args], (ex ,result)=>{
                                    if(ex) {res.json(new Service.TaskException(-1, "完成保养成功,但记录日志失败", ex)); return; }
                                    else{
                                        sql = "UPDATE t_slot_booking SET booking_status = 5 WHERE id=?";
                                        dac.query(sql, [this.work_ref_id], (ex, result)=>{
                                            if(ex) { res.json(new Service.TaskException(-2, '微信状态修改失败', ex)); return; }
                                            else res.json({status:"ok"});
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }

        // 客户拒绝了保养
        refuse(req, res){
            if(!req.body.car_id){res.json(new Service.TaskException(-1, "缺少参数car_id", null)); return; }
            if(!req.body.cust_id){res.json(new Service.TaskException(-1, "缺少参数cust_id", null)); return; }
            if(!req.body.reason){res.json(new Service.TaskException(-1, "缺少参数reason", null)); return; }

            this.step = 'refused';
            this.car_id = req.body.car_id;
            this.cust_id = req.body.cust_id;
            this.org_id = req.params.org_id;

            var dac = Service.MySqlAccess.RetrievePool();
            Service.Staff.CreateFromToken(req.cookies.token, (ex, userLogin)=> {
                if (ex) { res.json(new Service.TaskException(-1, "获取操作员失败", ex)); return; }
                else {
                    var sql = "SELECT max(D.mileage) AS max_mileage, sum(D.runtime)/60 AS sum_hour\n" +
                        "FROM t_obd_drive D, t_car C WHERE C.obd_code = D.obdCode and C.id = ?\n" +
                        "GROUP BY C.id";
                    dac.query(sql, [this.car_id], (ex, result)=>{
                        var json_args = {via:"web", reason: req.body.reason, oper: userLogin.dto.nick, care_mileage:0, care_hour:0 };
                        if(!ex && result.length > 0){
                            json_args.care_mileage = result[0].max_mileage;
                            json_args.care_hour = result[0].sum_hour;
                        }
                        this.json_args = JSON.stringify(json_args);

                        var sql = "INSERT t_work SET ?";
                        dac.query(sql, [this], (ex, result)=>{
                            if(ex) { res.json(new Service.TaskException(-1, "创建工作败", ex)); return; }
                            else{
                                this.id =result.insertId;
                                var log = new WorkLog(this);
                                log.Save((ex, objLog)=>{
                                    if(ex){ res.json(new Service.TaskException(-1, "创建工作对象成功,但记录日志失败", ex)); return; }
                                    else{
                                        res.json({status:"ok", work:this});
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
    }
}