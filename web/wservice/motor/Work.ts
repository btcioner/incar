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

            var dac = Service.MySqlAccess.RetrievePool();
            // 创建工作对象
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

        // 批准保养申请
        approve(req, res){
            if(this.step !== "applied") { res.json(new Service.TaskException(-1, "只有处于'已申请'状态才可以被批准", null)); return; }

            var sql = "UPDATE t_work SET step = 'approved' WHERE id = ? and step = 'applied'";
            var dac = Service.MySqlAccess.RetrievePool();
            dac.query(sql, [this.id], (ex, result)=>{
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

        // 拒绝保养申请
        reject(req, res){
            if(this.step !== "applied") { res.json(new Service.TaskException(-1, "只有处于'已申请'状态才可以被拒绝", null)); return; }
            if(!req.body.reason) { res.json(new Service.TaskException(-1, "缺少reason参数", null)); return; }

            this.json_args = JSON.stringify({reason:req.body.reason});

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
    }
}

module Service{
    export function GetWorkAll(req, res):void{
        res.setHeader("Accept-Query", "page,pagesize,step");
        var pagination = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT %s FROM t_work WHERE work = ?";
        var args = new Array<any>();
        args.push(req.params.work);

        if(req.query.step){
            sql += " and step = ?";
            args.push(req.query.step);
        }

        var task:any = { finished: 0 };
        task.begin = ()=>{
            var sql2 = util.format(sql, "COUNT(*) count");
            dac.query(sql2, args, (ex, result)=>{
                task.A = { ex:ex, result:result };
                task.finished++;
                task.end();
            });

            var sql3 = util.format(sql, "*");
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

            res.json({status:"ok", totalCount:totalCount, works: task.B.result});
        };

        task.begin();
    }

    export function GetWork(req, res):void{
        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT * FROM t_work WHERE id = ? and work = ?";
        dac.query(sql, [req.params.work_id, req.params.work], (ex, result)=>{
            if(ex){ res.json(new TaskException(-1, "查询工作失败", ex)); return; }
            else if(result.length > 0){
                res.json({status:"ok", work:result});
            }
            else if(result.length === 0){
                // try to look in history
                sql = "SELECT * FROM t_work_history WHERE id = ? and work = ?"
                dac.query(sql, [req.params.work_id, req.params.work], (ex, result)=>{
                    if(ex){ res.json(new TaskException(-1, "查询历史工作失败", ex)); return; }
                    else if(result.length === 0){ res.json(new TaskException(-1, "指定的工作不存在", null)); return; }
                    else{
                        res.json({status:"ok", work:result});
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
