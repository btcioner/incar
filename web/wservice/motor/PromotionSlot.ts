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
}