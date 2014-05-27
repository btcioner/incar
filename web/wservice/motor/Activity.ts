/// <reference path="references.ts" />

module Service{
    export function GetActivities(req, res){
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivities(page, req.query, (ex, total, acts)=>{
                if(ex) {res.json(ex); return;}
                res.json({status:"ok", totalCount:total, acts:acts});
            });
        });
    }

    export class Activity extends DTOBase<DTO.activity>{
        constructor(dto){
            super(dto);
        }
    }
}