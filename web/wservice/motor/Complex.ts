/// <reference path="references.ts" />

module Service{
    export function Get4SwithAdmin(req, res){
        res.setHeader("Accept-Query", "page,pagesize,name,status,prov,city");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4S(page, req.query, (ex:TaskException, total:number, s4s:S4[])=>{
            if(ex) { res.json(ex); return; }

            var task:any = { finished:0 };
            task.begin = ()=>{
                var p1 = new Pagination(1, 1);
                s4s.forEach((s4:S4)=>{
                    s4.GetStaff(p1, {}, (ex, total, staffs)=>{
                        if(total > 0){
                            var cmpx:any = s4.dto;
                            var admin = staffs[0].dto;
                            cmpx.admin_id = admin.id;
                            cmpx.admin_name = admin.name;
                            cmpx.admin_nick = admin.nick;
                            cmpx.admin_phone = admin.phone;
                        }
                        task.finished++;
                        task.end();
                    });
                });
            }

            task.end = ()=>{
                if(task.finished < s4s.length) return;
                var array4SAdmin = DTOBase.ExtractDTOs<DTO.S4>(s4s);
                array4SAdmin.forEach((s4:DTO.S4)=>{
                    // 微信的帐号资料不应返回给客户,仅供内部使用
                    s4.wx_login = undefined;
                    s4.wx_pwd = undefined;
                });
                res.json({status:"ok", totalCount:total, s4s: array4SAdmin});
            };
            task.begin();
        });
    }
}