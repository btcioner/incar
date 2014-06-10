/// <reference path="references.ts" />

module Service{
    export class ActAd extends Activity{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.activity{
            var dto:DTO.activity = super.DTO();

            return dto;
        }

        // 批量加载同种类的活动
        public static LoadActivities(res:any, page:Pagination, filter:any, template:Template, s4_id:number, cb:(ex:TaskException, total:number, acts:ActSaveGas[])=>void){
            res.setHeader("Accept-Query", "page,pagesize,status,title");
            var sql = "SELECT %s\n" +
                "FROM t_activity A\n" +
                "WHERE A.s4_id=? and A.template_id=?";
            var args:Array<Object> = [s4_id, template.dto.id];

            if(filter.status) { sql += " and A.status=?"; args.push(filter.status); }
            if(filter.title) { sql += " and title like ?"; args.push("%"+filter.title+"%"); }

            sql += "\nORDER BY A.id DESC";

            var dac = MySqlAccess.RetrievePool();
            var task:any = { finished: 0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "A.*");
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
                if(task.A.ex) { cb(new TaskException(-1, "查询资讯信息失败", task.A.ex), 0, null);  return; }

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