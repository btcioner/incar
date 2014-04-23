/// <reference path="references.ts" />

module Work{
    export class WorkBase{
        public id: number; // id
        public work: string; // work
        public step: string; // step
        public org_id: number; // 4s
        public car_id: number; // car
        public cust_id: number; // customer
        public working_time: string; // working time
        public json_args: string; // args
        public created_time: Date; // created time

        constructor(work){
            this.work = work;
            this.created_time = new Date();
        }
    }

    export class WorkLog{
        public id: number; // id
        public work_id: number; // work_id
        public work: string; // work
        public step: string; // step
        public json_args: string; // args
        public log_time: Date; // log time

        constructor(work: WorkBase){
            this.work_id = work.id;
            this.work = work.work;
            this.step = work.step;
            this.json_args = work.json_args;
        }

        Save(cb:(ex, obj)=>void){
            var dac = Service.MySqlAccess.RetrievePool();
            var sql = "INSERT t_work_log SET ?";
            dac.query(sql, [this], (ex, result)=>{
                if(ex) { cb(new Service.TaskException(-1, "创建work_log出错", ex), null); return; }
                else{
                    this.id = result.insertId;
                    cb(null, this);
                }
            });
        }
    }

    // 保养工作
    export class care extends WorkBase {
        constructor(){
            super("care");
        }

        // 客户提交保养申请
        apply(req, res){
            var error = "";
            var data = req.body;
            if(!data.org_id) { error += "缺少参数org_id\n"; }
            if(!data.car_id) { error += "缺少car_id\n"; }
            if(!data.cust_id) { error += "缺少cust_id\n"; }
            if(!data.working_time) { error += "缺少working_time\n"; }
            if(error){
                res.json(new Service.TaskException(-1, error, null));
                return;
            }

            this.step = "applied";
            this.org_id = data.org_id;
            this.car_id = data.car_id;
            this.cust_id = data.cust_id;
            this.working_time = data.working_time;

            Service.Account.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return;}
                else{
                    // 创建工作对象
                    this.json_args = JSON.stringify({oper:userLogin});
                    var dac = Service.MySqlAccess.RetrievePool();
                    var sql = "INSERT t_work SET ?";
                    dac.query(sql, [this], (ex, result)=>{
                        if(error){ res.json(new Service.TaskException(-1, "创建工作对象失败", ex)); return;}
                        // 日志
                        this.id = result.insertId;
                        var log = new WorkLog(this);
                        log.Save((ex, objLog)=>{
                            if(ex){ res.json(ex); }
                            else{
                                res.json({status:"ok"});
                            }
                        });
                    });
                }
            });
        }

        // 批准保养申请
        approve(req, res){
            if(this.step !== "applied") { res.json(new Service.TaskException(-1, "只有处于'已申请'状态才可以被批准", null)); return; }

            Service.Account.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return; }
                else{
                    this.json_args = JSON.stringify({oper:userLogin});
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
                                    res.json({status:"ok"});
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

            Service.Account.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) { res.json(ex); return; }
                else{
                    this.json_args = JSON.stringify({reason:req.body.reason, oper:userLogin});

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
                                    res.json({status:"ok"});
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

            Service.Account.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return; }
                else{
                    var args:any = { oper:userLogin };
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
                                    res.json({status:"ok"});
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
            if(!req.body.reason) { res.json(new Service.TaskException(-1, "缺少reason参数", null)); return; }

            Service.Account.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return;}
                else{
                    this.json_args = JSON.stringify({oper:userLogin, reason:req.body.reason});

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
                                    res.json({status:"ok"});
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

            Service.Account.CreateFromToken(req.cookies.token, (ex, userLogin)=>{
                if(ex) {res.json(ex); return; }
                else{
                    var data:any = req.body;
                    this.json_args = JSON.stringify({
                        oper: userLogin,
                        care_items: data.care_items,
                        care_cost: data.care_cost,
                        begin_time: data.begin_time,
                        end_time: data.end_time
                    });

                    var sql = "UPDATE t_work SET step = 'done', json_args = ? WHERE id = ? and step = 'approved'";
                    var dac = Service.MySqlAccess.RetrievePool();
                    dac.query(sql, [this.json_args, this.id], (ex, result)=>{
                        if(ex) {res.json(new Service.TaskException(-1, "完成保养失败", ex)); return; }
                        else if(result.affectedRows === 0){ {res.json(new Service.TaskException(-1, "完成保养失败,请刷新重试", null)); return; } }
                        else{
                            this.step = "done";
                            sql = "INSERT t_work_log(work_id, work, step, json_args) VALUES(?,?,?,?)";
                            dac.query(sql, [this.id, this.work, this.step, this.json_args], (ex ,result)=>{
                                if(ex) {res.json(new Service.TaskException(-1, "完成保养成功,但记录日志失败", ex)); return; }
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

module Service{
    export function GetWorkAll(req, res):void{
        res.setHeader("Accept-Query", "page,pagesize,step,cust_nick,license,working_time_begin,working_time_end");
        var pagination = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT %s" +
            "\nFROM t_work W" +
            "\n\tLEFT OUTER JOIN t_staff_account A ON W.cust_id = A.id" +
            "\n\tLEFT OUTER JOIN t_car_info C ON W.car_id = C.id" +
            "\n\tLEFT OUTER JOIN t_car C2 ON C.brand = C2.brandCode and C.series = C2.seriesCode" +
            "\nWHERE W.work = ?";
        var args = new Array<any>();
        args.push(req.params.work);

        if(req.query.step){
            sql += " and W.step = ?";
            args.push(req.query.step);
        }
        if(req.query.cust_nick){
            sql += " and A.nick = ?";
            args.push(req.query.cust_nick);
        }
        if(req.query.license){
            sql += " and C.license = ?";
            args.push(req.query.license);
        }
        if(req.query.working_time_begin){
            sql += " and W.working_time >= ?";
            args.push(req.query.working_time_begin);
        }
        if(req.query.working_time_end){
            sql += " and W.working_time <= ?";
            args.push(req.query.working_time_end);
        }

        var task:any = { finished: 0 };
        task.begin = ()=>{
            var sql2 = util.format(sql, "COUNT(*) count");
            dac.query(sql2, args, (ex, result)=>{
                task.A = { ex:ex, result:result };
                task.finished++;
                task.end();
            });

            var sql3 = util.format(sql, "W.*, A.nick AS cust_nick, A.phone AS cust_phone, C.license, C2.brand, C2.series");
            if(pagination.IsValid()) sql3 += pagination.sql;
            dac.query(sql3, args, (ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 2) return;
            if(task.B.ex) { res.json(new TaskException(-1, "查询工作失败", task.B.ex)); return; }

            var totalCount = 0;
            if(!task.A.ex) totalCount = task.A.result[0].count;

            task.B.result.forEach((entry:Work.WorkBase)=>{
                if(entry.json_args) entry.json_args = JSON.parse(entry.json_args);
            });
            res.json({status:"ok", totalCount:totalCount, works: task.B.result});
        };

        task.begin();
    }

    export function GetWork(req, res):void{
        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT W.*, A.nick AS cust_nick, A.phone AS cust_phone, C.license, C2.brand, C2.series" +
            "\nFROM t_work W" +
            "\n\tLEFT OUTER JOIN t_staff_account A ON W.cust_id = A.id" +
            "\n\tLEFT OUTER JOIN t_car_info C ON W.car_id = C.id" +
            "\n\tLEFT OUTER JOIN t_car C2 ON C.brand = C2.brandCode and C.series = C2.seriesCode" +
            "\nWHERE W.id = ? and W.work = ?";
        dac.query(sql, [req.params.work_id, req.params.work], (ex, result)=>{
            if(ex){ res.json(new TaskException(-1, "查询工作失败", ex)); return; }
            else if(result.length > 0){
                var entry:Work.WorkBase = result[0];
                if(entry.json_args) entry.json_args = JSON.parse(entry.json_args);
                res.json({status:"ok", work:entry});
            }
            else if(result.length === 0){
                // try to look in history
                sql = "SELECT * FROM t_work_history WHERE id = ? and work = ?";
                dac.query(sql, [req.params.work_id, req.params.work], (ex, result)=>{
                    if(ex){ res.json(new TaskException(-1, "查询历史工作失败", ex)); return; }
                    else if(result.length === 0){ res.json(new TaskException(-1, "指定的工作不存在", null)); return; }
                    else{
                        var entry = result[0];
                        if(entry.json_args) entry.json_args = JSON.parse(entry.json_args);
                        res.json({status:"ok", work:entry});
                    }
                });
            }
        });
    }

    export function CreateWork(req, res):void{
        if(Object.keys(req.body).length === 0){
            res.json({
                op: "apply",
                org_id: 4,
                car_id: 13,
                cust_id: 83,
                working_time: "2014-04-21 09:00:00"
            });
            return;
        }

        if(!req.body.op){
            res.json(new TaskException(-1, util.format("缺少op参数"), null));
            return;
        }

        var activator = Work[req.params.work];
        if(!activator){
            res.json(new TaskException(-1, util.format("无法识别的work:%s", req.params.work), null));
            return;
        }

        var objWork : Work.WorkBase = new activator();
        if(!(objWork instanceof Work.WorkBase)){
            res.json(new TaskException(-1, util.format("无效的work:%s", req.params.work), null));
            return;
        }

        var fnOP = objWork[req.body.op];
        if(!fnOP){
            res.json(new TaskException(-1, util.format("无法识别的操作:%s", req.body.op), null));
            return;
        }

        try {
            objWork[req.body.op](req, res);
        }
        catch(ex){
            res.json(new TaskException(-1, "创建工作失败", ex.toString()));
        }
    }

    export function UpdateWork(req, res):void{
        if(Object.keys(req.body).length === 0){
            res.json({
                op: "reject",
                reason: "工作位已被其它车辆抢先预定"
            });
            return;
        }

        if(!req.body.op){
            res.json(new TaskException(-1, util.format("缺少op参数"), null));
            return;
        }

        var activator = Work[req.params.work];
        if(!activator){
            res.json(new TaskException(-1, util.format("无法识别的work:%s", req.params.work), null));
            return;
        }

        var objWork : Work.WorkBase = new activator();
        if(!(objWork instanceof Work.WorkBase)){
            res.json(new TaskException(-1, util.format("无效的work:%s", req.params.work), null));
            return;
        }

        var fnOP = objWork[req.body.op];
        if(!fnOP){
            res.json(new TaskException(-1, util.format("无法识别的操作:%s", req.body.op), null));
            return;
        }

        var sql = "SELECT * FROM t_work WHERE id = ? and work = ?";
        var dac = MySqlAccess.RetrievePool();
        dac.query(sql, [req.params.work_id, req.params.work], (ex, result)=>{
            if(ex){ res.json(new TaskException(-1, "查询工作失败", ex)); return; }
            else if(result.length === 0){ res.json(new TaskException(-1, "指定的工作无效", ex)); return; }
            else{
                for(var x in result[0]){
                    objWork[x] = result[0][x];
                }

                try {
                    objWork[req.body.op](req, res);
                }
                catch(ex){
                    res.json(new TaskException(-1, "创建工作失败", ex.toString()));
                }
            }
        });
    }
}
