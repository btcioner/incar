/// <reference path="references.ts" />

module Service{
    export function CheckAuthority(req, res, next){
        Staff.CreateFromToken(req.cookies.token, (ex, staff)=>{
            if(ex) { res.json(new TaskException(-1, "没有登录", ex)); return; }
            if(req.params.s4_id){
                // 访问特定4S店资源
                if(isNaN(staff.dto.s4_id) && staff.dto.s4_id != req.params.s4_id){
                    res.json(new TaskException(-1, "没有访问权限", null));
                    return;
                }
            }
            else{
                // 访问全局资源
                if(staff.dto.s4_id) {
                    res.json(new TaskException(-1, "没有访问权限", null));
                    return;
                }
            }
            next();
        });
    }

    // 登录
    export function Login(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postSample:{
                    name:"admin",
                    pwd:"7d1d8b1504f2bf1da3db3cb8751ec62f197aa124",
                    agent:"InCarWebsite"
                },
                remark:"必填:name,pwd,agent"
            });
            return;
        }

        var data = req.body;
        var err = "";
        if(!data.name) err += "缺少参数name;";
        if(!data.pwd) err += "缺少参数pwd;";
        if(!data.agent) err += "缺少参数agent";
        if(err) { res.json(new TaskException(-1, err, null)); return; }

        data.remoteAddress = req._remoteAddress;

        // 检索匹配的用户帐号
        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT *\n" +
            "FROM t_staff WHERE name = ? and pwd = ? and %s LIMIT 1";
        var args = [data.name, data.pwd];
        if(req.params.s4_id){
            sql = util.format(sql, "s4_id = ?");
            args.push(req.params.s4_id);
        }
        else{
            sql = util.format(sql, "s4_id is null");
        }
        dac.query(sql, args,
            (err, result)=>{
                if(!err){
                    if(result.length === 0){
                        res.json(new TaskException(-1, "用户名或密码错误", null));
                    }
                    else{
                        // 从DTO对象构造用户帐户对象
                        var staff = new Staff(result[0]);
                        if(staff.IsDisabled()) {
                            res.json(new TaskException(-2, "帐号已被禁用", null));
                            return;
                        }
                        // 生成可被解密的token令牌
                        var token = staff.MakeToken(data._remoteAddress, data.agent);
                        // 更新登录时间和IP
                        staff.LoginTouch(data.remoteAddress);
                        res.cookie("token", token);
                        // 密码不应返回,仅供内部使用
                        staff.dto.pwd = undefined;
                        res.json({status:"ok", staff:staff.DTO()});
                    }
                }
                else{
                    res.json(new TaskException(-1, "查询用户失败", err));
                }
            });
    }

    // 用户注销
    export function Logout(req, res){
        res.clearCookie("token");
        res.json({status:"ok"});
    }

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
        if(!data.pwd) err += "缺少参数pwd;";

        var regexName = new RegExp("^[a-z0-9_]{3,32}$", "i");
        if(!regexName.test(data.name)) err += 'name只能由数字或字母组成,最少3字符,最多32字符;';

        if(err) { res.json(new TaskException(-1, err, null)); return; }

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            var dto:any = { name: data.name, pwd: data.pwd, last_login_time:"0000-00-00" };
            if(isStringNotEmpty(data.email)) dto.email = data.email;
            if(isStringNotEmpty(data.phone)) dto.phone = data.phone;
            if(isStringNotEmpty(data.nick)) dto.nick = data.nick;
            else dto.nick = data.name;
            var staff = new Staff(dto);
            s4.AddStaff(staff, (ex:TaskException, staff:Staff)=>{
                if(ex) { res.json(ex); return; }
                staff.dto.pwd = undefined;
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
            if(isStringNotEmpty(data.pwd)) dto.pwd = data.pwd;
            if(isStringNotEmpty(data.email)) dto.email = data.email;
            if(isStringNotEmpty(data.phone)) dto.phone = data.phone;
            if(!isNaN(data.status)) dto.status = data.status;

            var staff = new Staff(dto);
            s4.ModifyStaff(staff, (ex:TaskException)=>{
                if(ex) { res.json(ex); return; }
                res.json({status:"ok"});
            });
        });
    }

    export function GetStaffInCar(req, res){
        var sql = "SELECT * FROM t_staff WHERE s4_id is null";
        var dac = MySqlAccess.RetrievePool();
        dac.query(sql, null, (ex, result)=>{
            if(ex) { res.json(new TaskException(-1, "查询内部员工失败", ex)); return; }
            var staffs : Array<Staff> = [];
            result.forEach((dto:any)=>{
                var staff = new Staff(dto);
                staffs.push(staff);
            });
            var dtos = DTOBase.ExtractDTOs(staffs);
            dtos.forEach((dto:any)=>{
                // 密码不应返回给客户,仅供内部使用
                dto.pwd = undefined;
            });
            res.json({status:"ok", staffs:dtos});
        });
    }

    export class Staff extends DTOBase<DTO.staff>{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.staff{
            var dto:DTO.staff = super.DTO();

            if(dto.status === 0) dto.status_name = "禁用";
            else if(dto.status === 1) dto.status_name = "启用";

            return dto;
        }

        // 用户帐号是否被禁用
        IsDisabled():boolean{
            return (this.dto.status !== 1);
        }

        // 更新最后一次登录IP
        LoginTouch(ip:string){
            var dac = MySqlAccess.RetrievePool();
            if(this.dto.s4_id)
                dac.query("UPDATE t_staff SET last_login_ip = ? WHERE id = ? and s4_id = ?",
                    [ip, this.dto.id, this.dto.s4_id],
                    (err, result)=>{});
            else
                dac.query("UPDATE t_staff SET last_login_ip = ? WHERE id = ? and s4_id is null",
                    [ip, this.dto.id],
                    (err, result)=>{});
        }

        // 生成用户令牌token
        MakeToken(ip:string, agent:string):string{
            var evdData = util.format("%j", {id:this.dto.id, tm:new Date(), ip:ip, agent:agent});
            var cipherAES = Staff.crypto.createCipher("aes128", new Buffer(Staff.GetTokenKey()));
            cipherAES.setAutoPadding(true);
            var token:string = cipherAES.update(evdData, "utf8", "base64");
            token += cipherAES.final("base64");
            return token;
        }

        static crypto:any = require("crypto");
        static CreateFromToken(token:string, cb:(err:TaskException, staff:Staff)=>void):void{
            if(!token){
                cb(new TaskException(-1, "无效token", null), null);
                return;
            }

            // 解密token
            var decipherAES = Staff.crypto.createDecipher("aes128", new Buffer(Staff.GetTokenKey()));
            decipherAES.setAutoPadding(true);
            var userAccept : any;
            try{
                var jsonData = decipherAES.update(token, "base64", "utf8");
                jsonData += decipherAES.final("utf8");
                userAccept = JSON.parse(jsonData);
            }
            catch(e){
                cb(new TaskException(-1, "无效token", null), null);
                return;
            }

            // 校验userAccept
            var staff: Staff;
            var dac = MySqlAccess.RetrievePool();
            dac.query("SELECT * FROM t_staff WHERE id = ? LIMIT 1;", [userAccept.id],
                (err, result)=>{
                    if(!err && result.length === 1){
                        staff = new Staff(result[0]);
                        if(staff.IsDisabled())
                            cb(new TaskException(-1, "用户已被禁用", null), null);
                        else
                            cb(null, staff);
                    }
                    else{
                        cb(new TaskException(-1, "安全校验失败", err), null);
                    }
                });
        }

        static GetTokenKey():string{
            return "2014Mar15";
        }
    }
}