/// <reference path="references.ts" />

module Service{
    export function Get4S(req, res){
        res.setHeader("Accept-Query", "page,pagesize,name,status,prov,city");
        var page = new Pagination(req.query.page, req.query.pagesize);
        var filter = "";
        var repo = S4Repository.GetRepo();
        repo.Get4S(page, req.query, (ex, total, result)=>{
            if(ex){ res.json(ex); return; }
            var array4s = DTOBase.ExtractDTOs<DTO.S4>(result);
            array4s.forEach((s4:DTO.S4)=>{
                // 微信的帐号资料不应返回给客户,仅供内部使用
                s4.wx_login = undefined;
                s4.wx_pwd = undefined;
            });
            res.json({status:"ok", totalCount:total, s4s: array4s});
        });
    }

    export class S4Repository{
        static GetRepo():S4Repository{
            var repo = new S4Repository();
            return repo;
        }

        private dac:any;

        constructor(){
            this.dac = MySqlAccess.RetrievePool();
        }

        Get4S(page:Pagination, filter:any, cb:(ex:TaskException, total:number, result:S4[])=>void){
            var sql = "SELECT %s FROM t_4s WHERE 1=1";
            var args = [];

            if(filter.name) { sql += " and name = ?"; args.push(filter.name); }
            if(filter.status) { sql += " and status = ?"; args.push(filter.status); }
            if(filter.prov) { sql += " and prov = ?"; args.push(filter.prov); }
            if(filter.city) { sql += " and city = ?"; args.push(filter.city); }

            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "*");
                if(page.IsValid()) sqlA += page.sql;
                this.dac.query(sqlA, args, (ex, result)=>{
                    task.A = { ex: ex, result: result };
                    task.finished++;
                    task.end();
                });

                var sqlB = util.format(sql, "COUNT(*) count");
                this.dac.query(sqlB, args, (ex, result)=>{
                    task.B = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished < 2) return;
                if(task.A.ex){ cb(new TaskException(task.A.ex.errno, "查询4S店失败", task.A.ex), 0, null); return; }
                var objs = new Array<S4>();
                task.A.result.forEach((dto)=>{
                    objs.push(new S4(dto));
                });
                var total = 0;
                if(!task.B.ex) total = task.B.result[0].count;

                cb(null, total, objs);
            };

            task.begin();
        }
    }

    export class S4 extends DTOBase<DTO.S4>{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.S4{
            var dto:DTO.S4 = super.DTO();

            if(dto.status === 0) dto.status_name = "禁用";
            else if(dto.status === 1) dto.status_name = "启用";

            return dto;
        }
    }
}