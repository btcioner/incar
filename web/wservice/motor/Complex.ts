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

    export function Add4SwithAdmin(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    name:"北五环4S店",
                    status:1,
                    openid:"Uu6t4FYMrAq3xJP0zs",
                    prov:"北京",
                    city:"北京",
                    description:"示范样例",
                    wx_login:"incar",
                    wx_pwd:"4rS&mta",
                    wx_en_name:"InCarTech",
                    wx_status:1,
                    admin_name:"user9",
                    admin_nick:"全智贤",
                    admin_pwd:"7d1d8b1504f2bf1da3db3cb8751ec62f197aa124",
                    admin_phone:"13912345678",
                    admin_email:"qzx@movie.kr"
                },
                remark:"必填:name,admin_name,admin_pwd"
            });
            return;
        }

        var data = req.body;
        var err = "";
        if(!data.name) err += "缺少参数name;";
        if(!data.admin_name) err += "缺少参数admin_name";
        if(!data.admin_pwd) err += "缺少参数admin_pwd";
        if(err) { res.json(new TaskException(-1, err, null)); return; }

        var dto:any = { name: data.name };
        if(!isNaN(data.status)) dto.status = data.status;
        else dto.status = 1;
        if(isStringNotEmpty(data.openid)) dto.openid = data.openid;
        if(isStringNotEmpty(data.prov)) dto.prov = data.prov;
        if(isStringNotEmpty(data.city)) dto.city = data.city;
        if(isStringNotEmpty(data.description)) dto.description = data.description;
        if(isStringNotEmpty(data.wx_login)) dto.wx_login = data.wx_login;
        if(isStringNotEmpty(data.wx_pwd)) dto.wx_pwd = data.wx_pwd;
        if(isStringNotEmpty(data.wx_en_name)) dto.wx_en_name = data.wx_en_name;
        if(!isNaN(data.wx_status)) dto.wx_status = data.wx_status;
        var s4 = new S4(dto);

        var repo = S4Repository.GetRepo();
        repo.Add4S(s4, (ex:TaskException, s4:S4)=>{
            if(ex) { res.json(ex); return; }
            var dto2:any = { name: data.admin_name, pwd: data.admin_pwd, last_login_time:"0000-00-00" };
            if(isStringNotEmpty(data.admin_email)) dto2.nick = data.admin_email;
            if(isStringNotEmpty(data.admin_phone)) dto2.nick = data.admin_phone;
            if(isStringNotEmpty(data.admin_nick)) dto2.nick = data.admin_nick;
            else dto2.nick = data.admin_name;
            var staff = new Staff(dto2);
            s4.AddStaff(staff, (ex:TaskException, staff:Staff)=>{
                if(ex) { res.json(new TaskException(-2, "创建4S店成功,但创建4S店管理员失败", ex)); return; }
                var cmpx:any = s4.DTO();
                cmpx.admin_id = staff.dto.id;
                cmpx.admin_name = staff.dto.name;
                cmpx.admin_nick = staff.dto.nick;
                cmpx.admin_phone = staff.dto.phone;
                cmpx.admin_email = staff.dto.email;
                res.json({status:"ok", s4:cmpx});
            });
        });
    }
}