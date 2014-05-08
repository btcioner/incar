/// <reference path="references.ts" />

module Service{
    export function GetStaff(req, res){
        res.setHeader("Accept-Query", "page,pagesize,name,nick,status,email,phone");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetStaff(page, req.query, (ex, total, staffs)=>{
                if(ex) { res.json(ex); return; }
                var arrayStaff = DTOBase.ExtractDTOs<DTO.staff>(staffs);
                arrayStaff.forEach((staff:DTO.staff)=>{
                    // 密码不应返回给客户,仅供内部使用
                    staff.pwd = undefined;
                });
                res.json({status:"ok", totalCount:total, s4s: arrayStaff});
            });
        });
    }

    export class Staff extends DTOBase<DTO.staff>{
        constructor(dto){
            super(dto);
        }
    }
}