/// <reference path="references.ts" />

module Service {
    // Get all promotion slots of an organization
    export function GetPromotionSlotAllInOrg(req, res):void{
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);
        var sql = "SELECT %s FROM t_promotion_slot WHERE storeId = ?";
        var dac = MySqlAccess.RetrievePool();
        var args = [req.params.org_id];

        var task:any = { finished: 0 };
        task.begin = ()=>{
            // query total count
            var sql2 = util.format(sql, "COUNT(*) count");
            dac.query(sql2, args, (ex, result)=>{
                task.A = {ex:ex, result:result};
                task.finished++;
                task.end();
            });

            // query
            var sql3 = util.format(sql, "*");
            if(page.IsValid()) sql3 += page.sql;
            dac.query(sql3, args, (ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            // continue after 2 query finished both
            if(task.finished < 2) return;
            if(task.B.ex) { res.json(new TaskException(-1, "查询特价工位失败", task.B.ex)); return; }
            var totalCount = 0;
            if(!task.A.ex) totalCount = task.A.result[0].count;
            res.json({status:"ok", totalCount:totalCount, slots: task.B.result});
        };

        task.begin();
    }

    // Get a promotion slot of an organization
    export function GetPromotionSlotInOrg(req, res):void{
        var sql = "SELECT * FROM t_promotion_slot WHERE storeId = ? and id = ?";
        var dac = MySqlAccess.RetrievePool();
        var args = [req.params.org_id, req.params.slot_id];

        dac.query(sql, args, (ex, result)=>{
            if(ex) { res.json(new TaskException(-1, "查询特价工位失败", ex)); return }
            else if (result.length === 0){ res.json(new TaskException(-1, "指定的特价工位不存在", null)); return; }
            else{
                res.json({ status:"ok", slot:result[0]});
                return;
            }
        });
    }

    // 增加特价工位
    export function AddPromotionSlotToOrg(req, res):void{
        if(Object.keys(req.body).length === 0) {
            res.json({
                postData: {
                    slot_location   : "工位信息",
                    slot_time       : "2014-04-05 09:00:00",
                    benefit         : "优惠",
                    description     : "优惠条例描述",
                    promotion_time  : "2014-04-05 09:00:00",
                    promotion_status: 1,
                    tc              : "记录操作用户名",
                    ts              : "2014-04-05 09:00:00"
                },
                remark  : "必填:slot_location,benefit,promotion_status"
            });
            return;
        }

        var slot:any = req.body;
        slot.storeId = req.params.org_id;
        var dac = MySqlAccess.RetrievePool()
        dac.query("INSERT t_promotion_slot SET ?", [slot], (ex, result)=>{
            if(ex) { res.json(new TaskException(-1, "创建特价工位失败", ex)); return; }
            else {
                schedulerPS.start();
                res.json({ status:"ok", id:result.insertId});
                return;
            };
        });
    }

    // 修改特价工位
    export function ModifyPromotionSlotInOrg(req, res):void{
        if(Object.keys(req.body).length === 0) {
            res.json({
                postData: {
                    slot_location   : "工位信息",
                    slot_time       : "2014-04-05 09:00:00",
                    benefit         : "优惠",
                    description     : "优惠条例描述",
                    promotion_time  : "2014-04-05 09:00:00",
                    promotion_status: 1,
                    tc              : "记录操作用户名",
                    ts              : "2014-04-05 09:00:00"
                },
                remark  : "必填:slot_location,benefit,promotion_status"
            });
            return;
        }

        var slot:any = req.body;
        slot.id = req.params.slot_id;
        slot.storeId = req.params.org_id;
        var dac = MySqlAccess.RetrievePool();
        dac.query("UPDATE t_promotion_slot SET ? WHERE id = ? and storeId = ?", [slot, slot.id, slot.storeId], (ex, result)=>{
            if(ex){ res.json(new TaskException(-1, "修改特价工位失败", ex)); return; }
            else if(result.affectedRows === 0) {
                res.json(new TaskException(-1, util.format("组织%d的特价工位%d不存在", slot.storeId, slot.id), null));
                return;
            }
            else{
                schedulerPS.start();
                res.json({status:"ok"});
                return;
            }
        });
    }

    // 删除特价工位
    export function DeletePromotionSlotInOrg(req, res):void{
        var dac = MySqlAccess.RetrievePool();
        dac.query("DELETE FROM t_promotion_slot WHERE storeId = ? and id = ?", [req.params.org_id, req.params.slot_id], (ex, result)=>{
            if(ex) { res.json(new TaskException(-1, "删除特价工位失败", ex)); return; }
            else if(result.affectedRows === 0){
                res.json(new TaskException(-1, util.format("组织%d的特价工位%d不存在", req.params.org_id, req.params.slot_id), null));
                return;
            }
            else{
                res.json({status:"ok"});
                return;
            }
        });
    }

    // 特价工位定时调度器
    export class PromotionSlotScheduler{
        private _jobNext : any = null;

        constructor(){
        }

        // 启动
        public start(){
            this.UpdatePromotionStatus((ex, cP, cS)=>{
                if(ex) { console.error(ex); }
                console.log(util.format("%s:发布%d个特价工位, 结束%d个特价工位", new Date(), cP, cS));
                this.findNextPSTime((ex, tmA)=>{
                    if(ex){
                        this.KeepWatch();
                        console.error(JSON.stringify(ex));
                        return;
                    }
                    if(tmA === null){
                        console.log("没有特价工位需要被调度");
                        this.KeepWatch();
                    }
                    else{
                        var tmNext5sec = new Date((new Date()).getTime() + 5 * 1000);
                        if(tmA <= tmNext5sec){
                            // 有一个微小的概率发生这种情况
                            tmA = tmNext5sec;
                        }

                        console.log(util.format("特价工位下次调度时间:%s",tmA));
                        var cron:any = require('cron');
                        if(this._jobNext) this._jobNext.stop();
                        this._jobNext = new cron.CronJob(tmA, ()=>{
                            schedulerPS.start();
                        });
                        this._jobNext.start();
                    }
                });
            });
        }

        // 查询所有没有结束的特价工位中最早一个需要被调度的
        private findNextPSTime(cb:(ex:TaskException, tmA:Date)=>void):void{
            var dac = MySqlAccess.RetrievePool();
            var sql = "SELECT min(tm) AS tm FROM (\n" +
                "SELECT min(slot_time) AS tm FROM t_promotion_slot WHERE promotion_status not in (0,4)\n" +
                "UNION ALL SELECT min(promotion_time) AS tm FROM t_promotion_slot WHERE promotion_status = 1) T";
            dac.query(sql, null, (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "查询特价工位时间出错", ex), null); return; }
                if(result.length > 0 && result[0].tm !== null){
                    var tm : Date = null;
                    try{
                        tm = new Date(Date.parse(result[0].tm));
                        cb(null, tm);
                    }
                    catch(ex){
                        cb(new TaskException(-2, "解析特价工位时间出错:" + result[0].tm, ex), null);
                    }
                }
                else{
                    cb(null, null);
                }
            });
        }

        // 修改状态
        private UpdatePromotionStatus(cb:(ex:TaskException, countP:number, countS:number)=>void):void{
            var dac = MySqlAccess.RetrievePool();
            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = "UPDATE t_promotion_slot SET promotion_status = 2\n" +
                    "WHERE promotion_time <= CURRENT_TIMESTAMP and slot_time > CURRENT_TIMESTAMP\n" +
                    "\tand promotion_status = 1";
                dac.query(sqlA, null, (ex, result)=>{
                    task.A = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });

                var sqlB = "UPDATE t_promotion_slot SET promotion_status = 4\n" +
                    "WHERE slot_time <= CURRENT_TIMESTAMP and promotion_status not in (0,4)";
                dac.query(sqlB, null, (ex, result)=>{
                    task.B = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished < 2) return;
                var countP = 0, countS = 0;
                if(!task.A.ex){ countP = task.A.result.affectedRows; }
                if(!task.B.ex){ countS = task.B.result.affectedRows; }

                if(task.A.ex && task.B.ex){
                    var err = task.A.ex.toString() + "\n" + task.B.ex.toString();
                    cb(new TaskException(-1, "更新特价工位状态出错:\n"+ err, null), 0, 0);
                }
                else if(task.A.ex){
                    cb(new TaskException(-2, "更新特价工位发布状态出错", task.A.ex), countP, countS);
                }
                else if(task.B.ex){
                    cb(new TaskException(-3, "更新特价工位结束状态出错", task.A.ex), countP, countS);
                }
                else{
                    cb(null, countP, countS);
                }
            };
            task.begin();
        }

        // 保险
        private KeepWatch(){
            var cron:any = require('cron');
            var tmNext = new Date((new Date()).getTime() + 10*60*1000);
            if(this._jobNext) this._jobNext.stop();
            this._jobNext = new cron.CronJob(tmNext, ()=>{
                schedulerPS.start();
            });
            this._jobNext.start();
            console.log(util.format("特价工位进入空闲扫描模式,下次扫描:%s", tmNext));
        }
    }

    // 启动特价工位定时调度
    export var schedulerPS = new PromotionSlotScheduler();
    schedulerPS.start();
}