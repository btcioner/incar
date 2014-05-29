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
                if(ex) { res.json(new TaskException(-2, "查询活动模版失败", ex)); return; }
                var fnLoadActs = Service[template.dto.template].LoadActivities;
                if(!fnLoadActs) { res.json(new TaskException(-3, util.format("活动模版参数template类型%s无效", template.dto.template), null)); return;}
                fnLoadActs(page, req.query, template, s4.dto.id, (ex, total, acts)=>{
                    if(ex) { res.json(ex); return; }
                    var dtos = DTOBase.ExtractDTOs(acts);
                    res.json({status:"ok", totalCount:total, activities:dtos});
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

    export function GetActivityMember(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivity(req.params.act_id, (ex, act)=>{
                if(ex) { res.json(ex); return;}
                act.GetMember(req.params.acc_id, (ex, member)=>{
                    if(ex) { res.json(ex); return;}
                    var dto = member.DTO();
                    res.json({status:"ok", member:dto});
                });
            });
        });
    }

    export function CreateActivity(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    title:"节油大赛2014年第3期(6月)",
                    brief:"活动规则:...",
                    tm_announce:'2014-05-20 9:00',
                    tm_start:'2014-06-01 9:00',
                    tm_end:'2014-06-20 18:00',
                    min_milage:200,
                    logo_url:'/upload/img/1.jpg',
                    tags:'23,75,234,112'
                },
                remark:"必填:title"
            });
            return;
        }

        var data = req.body;
        var err = "";
        if(!data.title) { err += "缺少参数title"; }
        if(err.length > 0){
            res.json(new TaskException(-1, err, null));
            return;
        }

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetTemplate(req.params.tpl_id, (ex, template)=>{
                if(ex) { res.json(-2, "查询活动模版失败", ex); return; }
                var fnActX = Service[template.dto.template];
                if(!fnActX) { res.json(new TaskException(-3, util.format("活动模版参数template类型%s无效", template.dto.template), null)); return;}
                var act = new fnActX(req.body);
                act.dto.s4_id = s4.dto.id;
                act.dto.template_id = template.dto.id;
                act.Create((ex, id)=>{
                    if(ex) { res.json(ex); return; }
                    res.json({status:"ok", id:id});
                });
            });
        });
    }

    export function ModifyActivity(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                putSample:{
                    title:"节油大赛2014年第3期(6月)",
                    brief:"活动规则:...",
                    tm_announce:'2014-05-20 9:00',
                    tm_start:'2014-06-01 9:00',
                    tm_end:'2014-06-20 18:00',
                    min_milage:200,
                    logo_url:'/upload/img/1.jpg',
                    tags:'23,75,234,112'
                },
                remark:"必填:无"
            });
            return;
        }

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivity(req.params.act_id, (ex, act)=>{
                if(ex) { res.json(ex); return;}
                act.dto = req.body;
                // 强制ID不变
                act.dto.id = req.params.act_id;
                act.Modify((ex)=>{
                    if(ex) { res.json(new TaskException(-1, "修改活动失败", ex)); return; }
                    res.json({status:"ok"});
                });
            });
        });
    }

    export function DeleteActivity(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetActivity(req.params.act_id, (ex, act)=>{
                if(ex) { res.json(ex); return;}

                act.Delete((ex)=>{
                    if(ex) { res.json(new TaskException(-1, "删除活动失败", ex)); return; }
                    res.json({status:"ok"});
                });
            });
        });
    }

    export class Activity extends DTOBase<DTO.activity>{
        constructor(dto){
            super(dto);
        }

        public LoadExtra(cb:(ex:TaskException, act:Activity)=>void){
            cb(null, this);
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
                "WHERE M.act_id=?";
            var args = [this.dto.id];

            if(filter.status){ sql += " and M.status=?"; args.push(filter.status); }

            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "M.*,");
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
            var sql = "SELECT * FROM t_activity_member WHERE act_id=? and cust_id=?";
            var args = [this.dto.id, acc_id];
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
            var dac = MySqlAccess.RetrievePool();
            var dto:any = this.dto;

            var sql = "INSERT t_activity SET tm_created=CURRENT_TIMESTAMP, ?";
            var dtoAct = {
                s4_id:      dto.s4_id,
                template_id:dto.template_id,
                title:      dto.title,
                brief:      dto.brief,
                status:     1,
                tm_announce:dto.tm_announce,
                tm_start:   dto.tm_start,
                tm_end:     dto.tm_end,
                logo_url:   dto.logo_url,
                tags:       dto.tags
            };
            dac.query(sql, [dtoAct], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "创建活动失败", ex), null); return; }
                this.dto.id = result.insertId;
                this.ResolveMembers(cb);
            });
        }

        public Modify(cb:(ex:TaskException)=>void){
            var dto : any = { id:this.dto.id };
            if(this.dto.title) dto.title = this.dto.title;
            if(this.dto.brief) dto.brief = this.dto.brief;
            if(this.dto.awards) dto.awards = this.dto.awards;
            if(!isNaN(this.dto.status)) dto.status = this.dto.status;
            if(this.dto.tm_announce) dto.tm_announce = this.dto.tm_announce;
            if(this.dto.tm_start) dto.tm_start = this.dto.tm_start;
            if(this.dto.tm_end) dto.tm_end = this.dto.tm_end;
            if(this.dto.tm_publish) dto.tm_publish = this.dto.tm_publish;
            if(this.dto.logo_url) dto.logo_url = this.dto.logo_url;
            if(this.dto.tags) dto.tags = this.dto.tags;

            var sql = "UPDATE t_activity SET ? WHERE id = ?";
            var dac = MySqlAccess.RetrievePool();
            dac.query(sql, [dto, this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "修改活动失败", ex)); return; }
                else if(result.affectedRows === 0) { cb(new TaskException(-1, "指定的活动已不存在", null)); return; }
                // TODO: 修改活动的成员 this.dto.tags
                cb(null);
            });
        }

        public Delete(cb:(ex:TaskException)=>void){
            var dac = MySqlAccess.RetrievePool();
            var sql = "DELETE FROM t_activity_member WHERE act_id=?";
            dac.query(sql, [this.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "删除活动成员失败", ex)); return;}
                var sql = "DELETE FROM t_activity WHERE id = ?";
                dac.query(sql, [this.dto.id], (ex, result)=>{
                    if(ex) {cb(new TaskException(-2, "删除活动失败", ex)); return;}
                    cb(null);
                });
            });
        }

        public ResolveMembers(cb:(ex:TaskException, id:number)=>void){
            // TODO: 解析活动的成员 this.dto.tags;
            cb(null, this.dto.id);
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