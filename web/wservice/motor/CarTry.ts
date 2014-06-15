/// <reference path="references.ts" />

module Service {
    export function GetTryIn4S(req, res){
        res.setHeader("Accept-Query", "page,pagesize,step");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();

        var task:any = { finished: 0 };
        task.begin = ()=>{
            var sql = "SELECT %s\n" +
                "FROM t_work W\n" +
                "\tLEFT OUTER JOIN t_account U ON W.cust_id = U.id\n" +
                "WHERE W.work = 'drivetry' and W.org_id = ?";
            var args = [req.params.s4_id];
            if(req.query.step){ sql += " and W.step = ?"; args.push(req.query.step); }
            sql += " ORDER BY W.id DESC";

            var sqlA = util.format(sql, "count(*) count");
            dac.query(sqlA, args, (ex, result)=>{
                task.A = { ex:ex, result: result };
                task.finished++;
                task.end();
            });

            var sqlB = util.format(sql, "W.*, U.nick, U.phone");
            if(page.IsValid()) sqlB += page.sql;
            dac.query(sqlB, args, (ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });

            var sqlC = "SELECT * FROM t_car_dictionary";
            dac.query(sqlC, null, (ex, result)=>{
                task.C = { ex:ex, result:result };
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 3) return;
            if(task.B.ex) { res.json(new TaskException(-1, "查询试乘信息失败", task.B.ex)); return; }

            task.B.result.forEach((obj:any)=>{
                try {
                    obj.json_args = JSON.parse(obj.json_args);
                    task.C.result.forEach((d:any)=>{
                        if(obj.json_args.brand == d.brandCode && obj.json_args.series == d.seriesCode){
                            obj.json_args.brand_name = d.brand;
                            obj.json_args.series_name = d.series;
                        }
                    });
                }
                catch(e){ /*ignore any exception*/ }
            });

            var total = 0;
            if(!task.A.ex) total = task.A.result[0].count;
            res.json({status:"ok", totalCount:total, tries:task.B.result});
        };

        task.begin();
    }

    export function Get4SDriveTry(req, res):void{
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
                var filter = { work:"drivetry", step:"applied" };
                var page = new Pagination(req.body.page, req.body.pagesize);
                s4.GetWork(filter, page, (ex, total, works)=>{
                    if(ex) { res.json(new TaskException(-3, "查询试驾信息失败", ex)); return; }
                    var brandCodes:Array<number> = [];
                    // 去掉一些不需要的信息
                    works.forEach((work:any)=>{
                        work.work = undefined;
                        work.step = undefined;
                        work.work_ref_id = undefined;
                        try{
                            var args:any = JSON.parse(work.json_args);
                            work.brand = args.brand;
                            work.series = args.series;
                            if(!isNaN(args.brand)) brandCodes.push(args.brand);
                        }
                        catch(ex){}
                        work.json_args = undefined;
                        work.license = undefined;
                    });
                    // 查询车型车款
                    if(brandCodes.length > 0) {
                        var dac = MySqlAccess.RetrievePool();
                        var sql = "SELECT * FROM t_car_dictionary WHERE brandCode in (%s)";
                        sql = util.format(sql, brandCodes.join(','));
                        dac.query(sql, null, (ex, result)=> {
                            if (!ex && result.length > 0) {
                                works.forEach((work:any)=> {
                                    result.forEach((dict:any)=> {
                                        if (work.brand == dict.brandCode && work.series == dict.seriesCode) {
                                            work.brand_name = dict.brand;
                                            work.series_name = dict.series;
                                        }
                                    });
                                });
                            }
                            res.json({status: "ok", total: total, list: works});
                        });
                    }
                    else{ // 不必查询车型车款
                        res.json({status: "ok", total: total, list: works});
                    }
                });
            });
        });
    }

    export function Action4SDriveTry(req, res):void{
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
                // 查询试驾工作
                var workTry = new Work.drivetry();
                var actionOP = workTry[req.params.action];
                if(!actionOP){
                    res.json(new TaskException(-3, util.format("无效请求:%s", req.params.action), null));
                    return;
                }
                // 查询保养工作
                var sql = "SELECT * FROM t_work WHERE id = ? and work = ? and org_id = ?";
                var dac = MySqlAccess.RetrievePool();
                dac.query(sql, [req.params.id, 'drivetry', staff.dto.s4_id], (ex, result)=>{
                    if(ex){ res.json(new TaskException(-4, "查询试驾工作失败", ex)); return; }
                    else if(result.length === 0){ res.json(new TaskException(-5, util.format("指定的工作无效(id=%s)", req.params.id), null)); return; }

                    for(var x in result[0]){
                        workTry[x] = result[0][x];
                    }

                    try {
                        req.cookies.token = req.body.token;
                        actionOP.call(workTry, req, res);
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
    export class drivetry extends WorkBase{
        constructor(){
            super("drivetry");
        }

        // 批准试驾申请
        approve(req, res){
            if(this.step !== "applied") { res.json(new Service.TaskException(-1, "只有处于'已申请'状态才可以被批准", null)); return; }

            Service.Staff.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return; }
                else{
                    var rawArgs:any = {};
                    try { rawArgs = JSON.parse(this.json_args); } catch(e){ rawArgs = {}; }
                    this.json_args = JSON.stringify({oper:userLogin.dto.nick, brand: rawArgs.brand, series: rawArgs.series});
                    var sql = "UPDATE t_work SET step = 'approved', json_args = ? WHERE id = ? and step = 'applied'";
                    var dac = Service.MySqlAccess.RetrievePool();
                    dac.query(sql, [this.json_args, this.id], (ex, result)=>{
                        if(ex) {res.json(new Service.TaskException(-1, "批准试驾申请失败", ex)); return; }
                        else if(result.affectedRows === 0){ {res.json(new Service.TaskException(-1, "批准试驾申请失败,请刷新重试", null)); return; } }
                        else{
                            this.step = "approved";
                            sql = "INSERT t_work_log(work_id, work, step, json_args) VALUES(?,?,?,?)";
                            dac.query(sql, [this.id, this.work, this.step, this.json_args], (ex ,result)=>{
                                if(ex) {res.json(new Service.TaskException(-1, "试驾申请成功,但记录日志失败", ex)); return; }
                                else{
                                    res.json({status:"ok"});
                                }
                            });
                        }
                    });
                }
            });
        }

        // 拒绝试驾申请
        reject(req, res){
            if(this.step !== "applied") { res.json(new Service.TaskException(-1, "只有处于'已申请'状态才可以被拒绝", null)); return; }
            if(!req.body.reason) { res.json(new Service.TaskException(-1, "缺少reason参数", null)); return; }

            Service.Staff.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) { res.json(ex); return; }
                else{
                    var rawArgs:any = {};
                    try { rawArgs = JSON.parse(this.json_args); } catch(e){ rawArgs = {}; }

                    this.json_args = JSON.stringify({reason:req.body.reason, oper:userLogin.dto.nick, brand: rawArgs.brand, series: rawArgs.series});

                    var sql = "UPDATE t_work SET step = 'rejected', json_args = ? WHERE id = ? and step = 'applied'";
                    var dac = Service.MySqlAccess.RetrievePool();
                    dac.query(sql, [this.json_args, this.id], (ex, result)=>{
                        if(ex) {res.json(new Service.TaskException(-1, "拒绝试驾申请失败", ex)); return; }
                        else if(result.affectedRows === 0){ {res.json(new Service.TaskException(-1, "拒绝试驾申请失败,请刷新重试", null)); return; } }
                        else{
                            this.step = "rejected";
                            sql = "INSERT t_work_log(work_id, work, step, json_args) VALUES(?,?,?,?)";
                            dac.query(sql, [this.id, this.work, this.step, this.json_args], (ex ,result)=>{
                                if(ex) {res.json(new Service.TaskException(-1, "拒绝申请成功,但记录日志失败", ex)); return; }
                                else{
                                    res.json({status:"ok"});
                                }
                            });
                        }
                    });
                }
            });
        }

        // 完成试驾
        done(req, res){
            if(this.step !== "approved") { res.json(new Service.TaskException(-1, "只有处于'已批准'状态才可以完成", null)); return; }

            Service.Staff.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return; }
                else{
                    var dac = Service.MySqlAccess.RetrievePool();


                        var data:any = req.body;
                        this.json_args = JSON.stringify({
                            oper: userLogin.dto.nick,
                            begin_time: data.begin_time,
                            end_time: data.end_time,
                            brand: this.json_args['brand'],
                            series: this.json_args['series']
                        });

                        var sql = "UPDATE t_work SET step = 'done', json_args = ? WHERE id = ? and step = 'approved'";
                        dac.query(sql, [this.json_args, this.id], (ex, result)=>{
                            if(ex) {res.json(new Service.TaskException(-1, "完成试驾失败", ex)); return; }
                            else if(result.affectedRows === 0){ {res.json(new Service.TaskException(-1, "完成试驾失败,请刷新重试", null)); return; } }
                            else{
                                this.step = "done";
                                sql = "INSERT t_work_log(work_id, work, step, json_args) VALUES(?,?,?,?)";
                                dac.query(sql, [this.id, this.work, this.step, this.json_args], (ex ,result)=>{
                                    if(ex) {res.json(new Service.TaskException(-1, "完成试驾成功,但记录日志失败", ex)); return; }
                                    else{
                                        res.json({status:"ok"});
                                    }
                                });
                            }
                        });
                }
            });
        }
    }
}
