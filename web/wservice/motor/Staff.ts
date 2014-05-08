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

    export function GetStaffById(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetStaffById(req.params.staff_id, (ex, staff)=>{
                if(ex) { res.json(ex); return; }
                // 密码不应返回给客户,仅供内部使用
                staff.dto.pwd = undefined;
                res.json({status:"ok", staff:staff.DTO() });
            });
        });
    }

    export function AddStaff(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    name:"user9",
                    nick:"全智贤",
                    pwd:"7d1d8b1504f2bf1da3db3cb8751ec62f197aa124",
                    phone:"13912345678",
                    email:"qzx@movie.kr"
                },
                remark:"必填:name,pwd"
            });
            return;
        }

        var data = req.body;
        var err = "";
        if(!data.name) err += "缺少参数name;";
        if(!data.pwd) err += "缺少参数pwd";
        if(err) { res.json(new TaskException(-1, err, null)); return; }

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            var dto:any = { name: data.name, pwd: data.pwd, last_login_time:"0000-00-00" };
            if(isStringNotEmpty(data.email)) dto.nick = data.email;
            if(isStringNotEmpty(data.phone)) dto.nick = data.phone;
            if(isStringNotEmpty(data.nick)) dto.nick = data.nick;
            else dto.nick = data.name;
            var staff = new Staff(dto);
            s4.AddStaff(staff, (ex:TaskException, staff:Staff)=>{
                if(ex) { res.json(ex); return; }
                res.json({status:"ok", staff:staff.DTO()});
            });
        });
    }

    export function ModifyStaff(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    name:"user9",
                    nick:"全智贤",
                    pwd:"7d1d8b1504f2bf1da3db3cb8751ec62f197aa124",
                    phone:"13912345678",
                    email:"qzx@movie.kr"
                },
                remark:"必填:无"
            });
            return;
        }

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            var dto:any = { id:req.params.staff_id };
            var data = req.body;
            if(isStringNotEmpty(data.name)) dto.name = data.name;
            if(isStringNotEmpty(data.nick)) dto.nick = data.nick;
            if(isStringNotEmpty(data.pwd)) dto.name = data.pwd;
            if(isStringNotEmpty(data.email)) dto.nick = data.email;
            if(isStringNotEmpty(data.phone)) dto.nick = data.phone;
            if(!isNaN(data.status)) dto.status = data.status;

            var staff = new Staff(dto);
            s4.ModifyStaff(staff, (ex:TaskException)=>{
                if(ex) { res.json(ex); return; }
                res.json({status:"ok"});
            });
        });
    }

    export class Staff extends DTOBase<DTO.staff>{
        constructor(dto){
            super(dto);
        }
    }
}