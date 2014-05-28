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

    export function GetActivityMembers(req, res){
        res.setHeader("Accept-Query", "page,pagesize,status");
        var page = new Pagination(req.query.page,req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivity(req.params.act_id, (ex, act)=>{
                if(ex) { res.json(ex); return;}
                act.GetMembers(page, req.query, (ex, total, members)=>{
                    if(ex) { res.json(ex); return;}
                    var dtos = DTOBase.ExtractDTOs(members);
                    res.json({status:"ok", totalCount:total, members:dtos});
                });
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
    }

    export class Template extends DTOBase<DTO.activity_template>{
        constructor(dto){
            super(dto);
        }
    }

    export class ActivityMember extends DTOBase<DTO.activity_member>{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.activity_member{
            var dto:DTO.activity_member = super.DTO();

            if(dto.status === 0) dto.status_name = "邀请";
            else if(dto.status === 1) dto.status_name = "报名";
            else if(dto.status === 2) dto.status_name = "参加";
            else if(dto.status === 3) dto.status_name = "退出";
            else if(dto.status === 4) dto.status_name = "被拒";

            return dto;
        }
    }
}