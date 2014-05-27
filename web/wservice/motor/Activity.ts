/// <reference path="references.ts" />

module Service{
    export function GetTemplates(req, res){
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetTemplates(page, req.query, (ex, total, templates)=>{
                if(ex) {res.json(ex); return;}
                var tmps = DTOBase.ExtractDTOs(templates);
                res.json({status:"ok", totalCount:total, templates:tmps});
            });
        });
    }

    export function GetActivities(req, res){
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivities(page, req.query, (ex, total, acts)=>{
                if(ex) {res.json(ex); return;}
                var activities = DTOBase.ExtractDTOs(acts);
                res.json({status:"ok", totalCount:total, activities:activities});
            });
        });
    }

    export function GetActivitiesByTemplate(req, res){
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetTemplate(req.params.tpl_id, (ex, template)=>{
                if(ex) { res.json(-2, "查询活动模版失败", ex); return; }
                var fnActX = Service[template.dto.template];
                if(!fnActX) { res.json(new TaskException(-3, util.format("活动模版参数template类型%s无效", template.dto.template), null)); return;}
                s4.GetTemplatedActivities(page,req.query,template, fnActX, (ex,total, acts)=>{
                    if(ex) { res.json(ex); return; }
                    var activities = DTOBase.ExtractDTOs(acts);
                    res.json({status:"ok", totalCount:total, activities:activities});
                });
            });
        });
    }

    export function GetActivity(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivity(req.params.act_id, (ex, act)=>{
                if(ex) { res.json(ex); return;}
                res.json({status:"ok", activity:act.DTO()});
            });
        });
    }

    export class Activity extends DTOBase<DTO.activity>{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.activity{
            var dto:DTO.activity = super.DTO();

            if(dto.status === 1) dto.status_name = "已创建";
            else if(dto.status === 2) dto.status_name = "已发布";
            else if(dto.status === 3) dto.status_name = "已开始";
            else if(dto.status === 4) dto.status_name = "已结束";
            else if(dto.status === 5) dto.status_name = "已公布";
            else if(dto.status === 6) dto.status_name = "已取消";

            return dto;
        }
    }

    export class Template extends DTOBase<DTO.activity_template>{
        constructor(dto){
            super(dto);
        }
    }
}