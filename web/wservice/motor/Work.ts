/// <reference path="references.ts" />

module Work{
    export class WorkBase{
        public id: number; // id
        public work: string; // work
        public step: string; // step
        public work_ref_id: number; // ref
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
}

module Service{
    export function GetWorkAll(req, res):void{
        res.setHeader("Accept-Query", "page,pagesize,step,car_id,cust_nick,license,working_time_begin,working_time_end");
        var pagination = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT %s" +
            "\nFROM t_work W" +
            "\n\tLEFT OUTER JOIN t_account A ON W.cust_id = A.id and W.org_id = A.s4_id" +
            "\n\tLEFT OUTER JOIN t_car C ON W.car_id = C.id" +
            "\n\tLEFT OUTER JOIN t_car_dictionary C2 ON C.brand = C2.brandCode and C.series = C2.seriesCode" +
            "\nWHERE W.work = ? and W.org_id = ?";
        var args = new Array<any>();
        args.push(req.params.work);
        args.push(req.params.org_id);

        if(req.query.step){
            sql += " and W.step = ?";
            args.push(req.query.step);
        }
        if(req.query.cust_nick){
            sql += " and A.nick = ?";
            args.push(req.query.cust_nick);
        }
        if(req.query.car_id){
            sql += " and W.car_id = ?";
            args.push(req.query.car_id);
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
            "\n\tLEFT OUTER JOIN t_account A ON W.cust_id = A.id and W.org_id = A.s4_id" +
            "\n\tLEFT OUTER JOIN t_car C ON W.car_id = C.id" +
            "\n\tLEFT OUTER JOIN t_car_dictionary C2 ON C.brand = C2.brandCode and C.series = C2.seriesCode" +
            "\nWHERE W.id = ? and W.work = ? and W.org_id = ?";
        dac.query(sql, [req.params.work_id, req.params.work, req.params.org_id], (ex, result)=>{
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

        var sql = "SELECT * FROM t_work WHERE id = ? and work = ? and org_id = ?";
        var dac = MySqlAccess.RetrievePool();
        dac.query(sql, [req.params.work_id, req.params.work, req.params.org_id], (ex, result)=>{
            if(ex){ res.json(new TaskException(-1, "查询工作失败", ex)); return; }
            else if(result.length === 0){ res.json(new TaskException(-1, "指定的工作无效", ex)); return; }
            else{
                for(var x in result[0]){
                    objWork[x] = result[0][x];
                }

                try {
                    objWork[req.body.op].call(objWork, req, res);
                }
                catch(ex){
                    res.json(new TaskException(-1, "创建工作失败", ex.toString()));
                }
            }
        });
    }

    export function Get4SSummary(req, res):void{
        if(Object.keys(req.body).length == 0){
            res.json({
                postSample:{
                    token:"This=is=a=fake=token===demo=onlyeJUAPmtjgU9e77pOULn1Z75oWFVh6Tm19iVrUVBxZkGg=="
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
                // 过滤掉一些不需要返回的字段
                var dto4S:any = s4.DTO();
                dto4S.openid = undefined;
                dto4S.wx_login = undefined;
                dto4S.wx_pwd = undefined;
                dto4S.wx_app_name = undefined;
                dto4S.wx_app_id = undefined;
                dto4S.wx_app_secret = undefined;
                dto4S.wx_status = undefined;

                // 查询待保养和待试乘的数目
                var dac = MySqlAccess.RetrievePool();
                var sql = "SELECT W.work,count(*) AS count FROM t_work W\n" +
                    "WHERE W.org_id = ? and W.work in ('care','drivetry') and step = 'applied'\n" +
                    "GROUP BY W.work";
                var args = [dto4S.id];
                dac.query(sql, args, (ex, result)=>{
                    if(ex) { res.json(new TaskException(-3, "查询待保养和待试乘信息失败", ex)); return;}
                    var countCare = 0;
                    var countDriveTry = 0;
                    result.forEach((entry:any)=>{
                        if(entry.work === 'care') countCare = entry.count;
                        else if(entry.work === 'drivetry') countDriveTry = entry.count;
                    });
                    res.json({status:"ok", care:countCare, drivetry:countDriveTry, s4:dto4S });
                });
            });
        });
    }
}
