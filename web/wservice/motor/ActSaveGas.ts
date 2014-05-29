/// <reference path="references.ts" />

module Service{
    export class ActSaveGas extends Activity{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.activity{
            var dto:DTO.activity = super.DTO();

            try{
                var tm = new Date(Date.parse(dto.tm_start.toString()));
                dto["month"] = (tm.getMonth() + 1) + "月";
            }
            catch(ex){
                // ignore any...
            }

            return dto;
        }

        public LoadExtra(cb:(ex:TaskException, act:Activity)=>void){
            var sql = "SELECT * FROM t_activity_save_gas WHERE id = ?";
            var args = [this.dto.id];
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, args, (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "加载节油大赛活动信息失败", ex), this); return; }
                else if(result.length === 0) { cb(new TaskException(-1, "节油大赛活动信息不存在", null), this); return; }
                else if(result.length > 1) { cb(new TaskException(-1, "节油大赛活动信息数据错误", null), this); return; }

                var extra = result[0];
                for (var p in extra) if (p !== "id" && extra.hasOwnProperty(p)) this.dto[p] = extra[p];

                super.LoadExtra(cb);
            });
        }

        public GetMembers(page:Pagination, filter:any, cb:(ex:TaskException, total:number, members:ActivityMember[])=>void){
            var dac = MySqlAccess.RetrievePool();
            var sql = "SELECT %s\n" +
                "FROM t_activity_member M\n" +
                "\tJOIN t_account A ON M.cust_id=A.id and A.s4_id=?\n" +
                "\tLEFT OUTER JOIN t_car C ON M.ref_car_id = C.id and C.s4_id=A.s4_id\n" +
                "\tLEFT OUTER JOIN t_car_dictionary D ON C.brand=D.brandCode and C.series=D.seriesCode\n" +
                "\tLEFT OUTER JOIN t_obd_drive R ON C.obd_code=R.obdCode and R.fireTime >= ? and R.flameOutTime <= ?\n" +
                "WHERE 1=1";
            var args = [this.dto.s4_id, this.dto.tm_start, this.dto.tm_end];
            if(!isNaN(filter.status)){ sql += " and M.status=?"; args.push(filter.status); }
            sql += "\nGROUP BY C.id";

            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "M.*," +
                    "A.name, A.nick, A.phone, A.email, A.wx_oid, A.sex, A.city, A.province, A.country, A.headimgurl," +
                    "C.obd_code, C.license, C.brand, C.series, D.brand AS brand_name, D.series AS series_name," +
                    "sum(R.currentMileage) AS milage, sum(currentAvgOilUsed*currentMileage)/sum(currentMileage) AS avgOil");
                if(page.IsValid()) sqlA += page.sql;
                dac.query(sqlA, args, (ex, result)=>{
                    task.A = {ex:ex, result:result};
                    task.finished++;
                    task.end();
                });

                var sqlB = util.format(sql, "COUNT(*) count");
                dac.query(sqlB, args, (ex, result)=>{
                    task.B = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished < 2) return;
                if(task.A.ex) { cb(new TaskException(-1, "查询活动成员失败", task.A.ex), 0, null); return; }
                var total = 0;
                if(!task.B.ex) total = task.B.result.length;
                var members = [];
                task.A.result.forEach((dto:any)=>{
                    var m = new ActivityMember(dto);
                    members.push(m);
                });
                cb(null, total, members);
            };

            task.begin();
        }

        public GetMember(acc_id:number, cb:(ex:TaskException, member:ActivityMember)=>void) {
            var sql = "SELECT M.status,\n" +
                "\tA.nick,A.phone,C.license,C.obd_code,D.brand AS brand_name,D.series AS series_name,\n" +
                "\tsum(R.currentMileage) AS milage, sum(currentAvgOilUsed*currentMileage)/sum(currentMileage) AS avgOil\n" +
                "FROM t_activity_member M\n" +
                "\tJOIN t_account A ON M.cust_id=A.id and A.s4_id=?" +
                "\tLEFT OUTER JOIN t_car C ON M.ref_car_id=C.id and C.s4_id=A.s4_id" +
                "\tLEFT OUTER JOIN t_car_dictionary D ON C.brand=D.brandCode and C.series=D.seriesCode\n"+
                "\tLEFT OUTER JOIN t_obd_drive R ON C.obd_code=R.obdCode and R.fireTime >= ? and R.flameOutTime <= ?\n" +
                "WHERE M.act_id=? and M.cust_id=?";
            var args = [this.dto.s4_id, this.dto.tm_start, this.dto.tm_end,this.dto.id, acc_id];
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, args, (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "查询活动成员失败", ex), null); return; }
                else if(result.length === 0) { cb(new TaskException(-1, "指定的活动成员不存在", null), null); return; }
                else if(result.length > 1) { cb(new TaskException(-1, "活动成员数据错误", null), null); return; }
                var member = new ActivityMember(result[0]);
                cb(null, member);
            });
        }

        public Create(cb:(ex:TaskException, id:number)=>void){
            super.Create((ex, id)=>{
                if(ex) { cb(ex, id); return; }

                var dac = MySqlAccess.RetrievePool();
                var sql = "INSERT t_activity_save_gas SET ?";
                var dtoActSaveGas = {
                    id:         id,
                    min_milage: this.dto['min_milage']
                };
                dac.query(sql, [dtoActSaveGas], (ex, result)=>{
                    if(ex) {
                        dac.query("DELETE FROM t_activity WHERE id=?", [dtoActSaveGas.id], (ex, result)=>{});
                        cb(new TaskException(-1, "创建节油大赛活动失败", ex), dtoActSaveGas.id);
                        return;
                    }
                    cb(null, dtoActSaveGas.id);
                });
            });
        }

        public Modify(cb:(ex:TaskException)=>void) {
            super.Modify((ex)=>{
                if(ex) { cb(ex); return; }

                var dto :any = { id: this.dto.id };
                if(this.dto['min_milage']) dto.min_milage = this.dto['min_milage'];
                var sql = "UPDATE t_activity_save_gas SET ? WHERE id = ?";
                var dac = MySqlAccess.RetrievePool();
                dac.query(sql, [dto, this.dto.id], (ex, result)=>{
                    if(ex) { cb(new TaskException(-1, "修改节油大赛失败", ex)); return; }
                    else if(result.affectedRows === 0) { cb(new TaskException(-1, "指定的节油大赛活动已不存在", null)); return;}
                    // 修改成功
                    cb(null);
                });
            });
        }

        public Delete(cb:(ex:TaskException)=>void){
            var dac = MySqlAccess.RetrievePool();
            var sql = "DELETE FROM t_activity_save_gas WHERE id = ?";
            dac.query(sql, [this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "删除节油大赛活动失败", ex)); return; }
                super.Delete(cb);
            });
        }

        // 批量加载同种类的活动
        public static LoadActivities(page:Pagination, filter:any, template:Template, s4_id:number, cb:(ex:TaskException, total:number, acts:ActSaveGas[])=>void){
            var sql = "SELECT %s\n" +
                "FROM t_activity A JOIN t_activity_save_gas E ON A.id = E.id\n" +
                "WHERE A.s4_id=? and A.template_id=?";
            var args:Array<Object> = [s4_id, template.dto.id];

            if(filter.status) { sql += " and A.status=?"; args.push(filter.status); }
            if(filter.tm_start_begin) { sql += " and tm_start >= ?"; args.push(filter.bm_start_begin); }
            if(filter.tm_start_end) { sql += " and tm_start <= ?"; args.push(filter.bm_start_end); }
            if(filter.month) { sql += " and MONTH(tm_start) = ?"; args.push(filter.month); }
            if(filter.title) { sql += " and title like ?"; args.push("%"+filter.title+"%"); }

            sql += "\nORDER BY tm_start DESC";

            var dac = MySqlAccess.RetrievePool();
            var task:any = { finished: 0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "A.*, E.*");
                if(page.IsValid()) sqlA += page.sql;
                dac.query(sqlA, args, (ex, result)=>{
                    task.A = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });

                var sqlB = util.format(sql, "COUNT(*) count");
                dac.query(sqlB, args, (ex, result)=>{
                    task.B = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished < 2) return;
                if(task.A.ex) { cb(new TaskException(-1, "查询节油大赛活动失败", task.A.ex), 0, null);  return; }

                var total = 0;
                if(!task.B.ex) total = task.B.result[0].count;

                var acts = [];
                task.A.result.forEach((dto:any)=>{
                    var act = new ActSaveGas(dto);
                    acts.push(act);
                });

                cb(null, total, acts);
            };
            task.begin();
        }
    }
}