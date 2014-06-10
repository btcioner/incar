/// <reference path="references.ts" />

module Service {
    export function GetTryIn4S(req, res){
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();

        var task:any = { finished: 0 };
        task.begin = ()=>{
            var sql = "SELECT %s\n" +
                "FROM t_work W\n" +
                "\tLEFT OUTER JOIN t_account U ON W.cust_id = U.id\n" +
                "WHERE W.work='drivetry' and W.org_id=? ORDER BY W.id DESC";
            var args = [req.params.s4_id];

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
                    this.json_args = JSON.stringify({oper:userLogin.dto.nick, brand: this.json_args['brand'], series: this.json_args['series']});
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
                    this.json_args = JSON.stringify({reason:req.body.reason, oper:userLogin.dto.nick, brand: this.json_args['brand'], series: this.json_args['series']});

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
