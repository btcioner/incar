/// <reference path="references.ts" />

module Service{
    export class ActSaveGas extends Activity{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.activity{
            var dto:DTO.activity = super.DTO();

            if(dto.tm_start){
                dto["month"] = (dto.tm_start.getMonth() + 1) + "月";
            }

            return dto;
        }

        public GetMembers(page:Pagination, filter:any, cb:(ex:TaskException, total:number, members:ActivityMember[])=>void){
            var dac = MySqlAccess.RetrievePool();
            var sql = "SELECT %s\n" +
                "FROM t_activity_member M\n" +
                "\tJOIN t_account A ON M.cust_id=A.id and A.s4_id=?\n" +
                "\tLEFT OUTER JOIN t_car C ON M.ref_car_id = C.id and C.s4_id=A.s4_id\n" +
                "\tLEFT OUTER JOIN t_car_dictionary D ON C.brand=D.brandCode and C.series=D.seriesCode\n" +
                "WHERE 1=1";
            var args = [this.dto.s4_id];

            if(filter.status){ sql += " and M.status=?"; args.push(filter.status); }

            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "M.*," +
                    "A.name, A.nick, A.phone, A.email, A.wx_oid, A.sex, A.city, A.province, A.country, A.headimgurl," +
                    "C.obd_code, C.license, C.brand, C.series, D.brand AS brand_name, D.series AS series_name");
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
                if(!task.B.ex) total = task.B.result[0].count;
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
                "\tA.nick,A.phone,C.license,C.obd_code,D.brand AS brand_name,D.series AS series_name\n" +
                "FROM t_activity_member M\n" +
                "\tJOIN t_account A ON M.cust_id=A.id and A.s4_id=?" +
                "\tLEFT OUTER JOIN t_car C ON M.ref_car_id=C.id and C.s4_id=A.s4_id" +
                "\tLEFT OUTER JOIN t_car_dictionary D ON C.brand=D.brandCode and C.series=D.seriesCode\n"+
                "WHERE M.act_id=? and M.cust_id=?";
            var args = [this.dto.s4_id,this.dto.id, acc_id];
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, args, (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "查询活动成员失败", ex), null); return; }
                else if(result.length === 0) { cb(new TaskException(-1, "指定的活动成员不存在", null), null); return; }
                else if(result.length > 1) { cb(new TaskException(-1, "活动成员数据错误", null), null); return; }
                var member = new ActivityMember(result[0]);
                cb(null, member);
            });
        }
    }
}