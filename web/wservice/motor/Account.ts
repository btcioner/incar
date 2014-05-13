/// <reference path="references.ts" />

var util = require("util");
var crypto = require("crypto");

module Service{
    // 用户注册
    export function RegisterAccount(req, res){
        // 输入检查
        var data = req.body;

        var error = '';
        var regexName = new RegExp("^[a-z0-9_]{3,32}$", "i");
        if((!data.name) || data.name.trim() === '') error += 'name不能为空白;';
        else if(!regexName.test(data.name.trim())) error += 'name只能由数字或字母组成,最少3字符,最多32字符;';
        if((!data.pwd) ||data. pwd.length === 0) error +=  'pwd不能为空白;';
        if(error.length > 0) {
            res.json({status:error});
            return;
        }

        // 从输入构造DTO对象
        var accDTO = new DTO.staff_account();
        accDTO.name = data.name.trim();
        accDTO.pwd = data.pwd;
        if(data.nick && data.nick.trim() !== '') accDTO.nick = data.nick.trim();
        else accDTO.nick = accDTO.name;
        if(data.email) accDTO.email = data.email.trim();
        else accDTO.email = null;
        if(data.phone && data.phone.trim() !== '') accDTO.phone = data.phone.trim();
        else data.phone = null;
        accDTO.last_login_ip = null;
        accDTO.last_login_time = new Date(0);

        // 写入数据库
        var dac = MySqlAccess.RetrievePool();
        dac.query('INSERT ?? SET ?',['t_staff_account', accDTO], (err, result)=>{
            if(!err){
                accDTO.id = result.insertId;
                var acc =  Account.CreateFromDTO(accDTO);
                res.json({ status:"ok", account:acc });
            }
            else if(err.code === 'ER_DUP_ENTRY'){
                var errOut = util.format('用户名{%s}已存在.', accDTO.name);
                res.json({status:errOut});
            }
            else{
                console.log(err);
                res.json(500, {status:"未知错误,请查看日志"});
            }
        });
    }



    // 返回ORG内所有用户信息
    export function GetAccountByOrg(req, res){
        res.setHeader("Accept-Query", "page,pagesize");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var task:any = { finished: 0 };

        task.begin = ()=>{
            // 主查询
            var sql = "SELECT A.*, M.role " +
                "FROM t_staff_account AS A, t_staff_org_member AS M " +
                "WHERE A.id = M.account_id " +
                "and M.org_id = ?";
            if(page.IsValid()) sql += page.sql;
            dac.query(sql, [req.params.org_id], (ex, result)=>{
                task.A = {ex:ex, result:result};
                task.finished++;
                task.end();
            });

            // 总数
            sql = "SELECT COUNT(*) COUNT " +
                "FROM t_staff_account AS A, t_staff_org_member AS M " +
                "WHERE A.id = M.account_id " +
                "and M.org_id = ?";
            dac.query(sql, [req.params.org_id], (ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished === 2){
                if(task.A.ex) {res.json(new TaskException(-1, "查询用户失败", task.A.ex)); return;}
                else{
                    var totalCount = 0;
                    if(!task.B.ex) totalCount = task.B.result[0].COUNT;

                    task.A.result.forEach((obj:DTO.staff_account)=>{
                        obj.pwd = undefined;
                    });

                    res.json({status:"ok", totalCount:totalCount, accounts: task.A.result});
                }
            }
        };

        task.begin();
    }

    // 在一个组织中创建新用户
    export function AddAccountToOrg(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postData: {
                    name:"user007",
                    pwd:"123456789d431abd6a053a56625ec088bfb88912",
                    nick:"文章",
                    email:"wz@movie.com",
                    phone:"13912345678",
                    role:"ADMIN"
                },
                remark:"必填项:name, pwd, nick"
            });
            return;
        }

        // 输入检查
        var data = req.body;
        if(!data.name || data.name.trim().length === 0) {res.json(new TaskException(-1, "缺少参数name", null)); return;}
        if(!data.pwd || data.pwd.trim().length === 0) {res.json(new TaskException(-1, "缺少参数pwd", null)); return;}
        if(!data.nick || data.nick.trim().length === 0) {res.json(new TaskException(-1, "缺少参数nick", null)); return;}

        var task : any = { };
        var dac = MySqlAccess.RetrievePool();
        task.begin = ()=>{
            var sql = "INSERT t_staff_account(name,pwd,nick,email,phone,last_login_time) VALUES(?,?,?,?,?,'0000-00-00')";
            dac.query(sql, [data.name.trim(), data.pwd, data.nick.trim(), data.email, data.phone], (ex, result)=>{
                if(ex) {res.json(new TaskException(-1, "创建用户失败", ex)); return;}
                else{
                    task.Link(result.insertId, req.params.org_id);
                }
            });
        };

        task.Link = (idAcc:number, idOrg:number)=>{
            var role:string = null;
            if(data.role) role = data.role.trim();

            var sql = "INSERT t_staff_org_member(org_id, account_id, role) VALUES(?,?,?)";
            dac.query(sql, [idOrg, idAcc, role], (ex, result)=>{
                if(ex){ res.json(new TaskException(-1, util.format("用户(%d)加入组织(%d)失败", idAcc, idOrg), ex)); return;}
                else{
                    res.json({status:"ok"});
                }
            });
        };

        task.begin();
    }

    // 返回ORG内
    export function GetAccountByIdInOrg(req, res){
        var dac = MySqlAccess.RetrievePool();

            // 主查询
            var sql = "SELECT A.*, M.role " +
                "FROM t_staff_account AS A, t_staff_org_member AS M " +
                "WHERE A.id = M.account_id " +
                "and M.org_id = ? and A.id = ? ";
            dac.query(sql, [req.params.org_id, req.params.acc_id], (ex, result)=>{
                if(ex) {res.json(new TaskException(-1, "查询用户失败", ex)); return;}
                else if(result.length === 0){ res.json(new TaskException(-1, "用户不存在", null)); return;}
                else{
                    var acc : DTO.staff_account = result[0];
                    acc.pwd = undefined;
                    res.json({status:"ok", account:acc});
                }
            });
    }

    // 修改组织中的用户
    export function ModifyAccountByIdInOrg(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                putData: {
                    name:"user007",
                    pwd:"123456789d431abd6a053a56625ec088bfb88912",
                    nick:"文章",
                    email:"wz@movie.com",
                    phone:"13912345678",
                    status:1
                },
                remark:"必填项:无"
            });
            return;
        }

        var task:any = { };
        var dac = MySqlAccess.RetrievePool();
        task.begin = ()=>{
            var sql = "SELECT A.* FROM t_staff_account AS A, t_staff_org_member AS M " +
                "WHERE A.id = ? and M.org_id = ? LIMIT 1";
            dac.query(sql, [req.params.acc_id, req.params.org_id], (ex, result)=>{
                if(ex){ res.json(new TaskException(-1, "查询用户失败", ex)); return; }
                else if(result.length === 0 ){ res.json(new TaskException(-1, "组织中用户不存在", null)); return; }
                else{ task.modify(result[0]);return; }
            });
        };

        task.modify = (target : DTO.staff_account)=>{
            var data = req.body;

            if(data.name && data.name.trim().length > 0) target.name = data.name.trim();
            if(data.pwd && data.pwd.trim().length > 0) target.pwd = data.pwd.trim();
            if(data.nick && data.nick.trim().length > 0) target.nick = data.nick.trim();
            if(data.email && data.email.trim().length > 0) target.email = data.email.trim();
            if(data.phone && data.phone.trim().length > 0) target.phone = data.phone.trim();
            if(data.status !== undefined && data.status !== null) target.status = Number(data.status);

            var sql = "UPDATE t_staff_account SET ? WHERE id = ?";
            dac.query(sql, [target, target.id], (ex, result)=>{
                if(ex) {res.json(new TaskException(-1, "修改用户信息失败", ex)); return; }
                else{ res.json({status:"ok"}); return; }
            });
        };

        task.begin();
    }

    export function DeleteAccountByIdInOrg(req, res){
        var task:any = {};
        var dac = MySqlAccess.RetrievePool();

        if(req.params.org_id == 1 && req.params.acc_id == 1){
            res.json(new TaskException(-1, "系统内置帐号不允许被删除", null));
            return;
        }

        task.begin = ()=>{
            var sql = "DELETE FROM t_staff_org_member WHERE org_id = ? and account_Id = ?";
            dac.query(sql, [req.params.org_id, req.params.acc_id],(ex, result)=>{
                if(ex){ res.json(new TaskException(-1, "删除组织中的用户失败", ex)); return; }
                else{ task.checkMore(); return; }
            });
        };

        task.checkMore = ()=>{
            res.json({status:"ok"}); return;
            // 如果此用户不在任何组织中了,那么删除用户
            dac.query("DELETE FROM t_staff_account WHERE id = ? and " +
                "NOT EXISTS (SELECT * FROM t_staff_org_member WHERE account_id = ?)",
                [req.params.acc_id, req.params.acc_id], (ex, result)=>{
                    if(ex) {res.json(new TaskException(-1, "删除用户失败", null)); return;}
                    else{ res.json({status:"ok"}); return; }
                });
        };

        task.begin();
    }

    export function GetRole(req, res){
        var dac = MySqlAccess.RetrievePool();
        dac.query("SELECT DISTINCT role FROM t_staff_org_member WHERE org_id = ? and account_id = ?",
            [req.params.org_id, req.params.acc_id], (ex, result)=>{
                if(ex){res.json(new TaskException(-1, "查询角色失败", null)); return; }
                else{
                    var roles = new Array();
                    result.forEach((obj)=>{ roles.push(obj.role)});
                    res.json({status:"ok", roles: roles});
                    return;
                }
            });
    }

    export function HasRole(req, res){
        var dac = MySqlAccess.RetrievePool();
        dac.query("SELECT COUNT(*) COUNT FROM t_staff_org_member WHERE org_id = ? and account_id = ? and role = ?",
            [req.params.org_id, req.params.acc_id, req.params.role], (ex, result)=>{
                if(ex){res.json(new TaskException(-1, "查询角色失败", null)); return; }
                else{
                    res.json({status:"ok", role: result[0].COUNT > 0});
                    return;
                }
            });
    }

    export function AddRole(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                postData:{ role: "ADMIN"},
                remark:"必填:role"
            });
            return;
        }

        if(!req.body.role || req.body.role.trim().length === 0){res.json(new TaskException(-1, "缺少role参数", null)); return;}

        var dac = MySqlAccess.RetrievePool();
        var task:any = {};
        task.begin = ()=>{
            var sql = "SELECT 1 FROM t_staff_account AS A, t_staff_org AS O " +
                "WHERE A.id = ? and O.id = ? LIMIT 1";
            dac.query(sql, [req.params.acc_id, req.params.org_id], (ex, result)=>{
                if(ex){res.json(new TaskException(-1, "访问用户和组织失败", null)); return;}
                else if(result.length === 0){res.json(new TaskException(-1, "用户或组织不存在", null)); return;}
                else{task.createRole(); return; }
            });
        };

        task.createRole = ()=>{
            var sql = "INSERT t_staff_org_member(org_id, account_id, role) " +
                "(SELECT ?, ?, ? FROM t_staff_org_member " +
                "WHERE NOT EXISTS(SELECT * FROM t_staff_org_member WHERE org_id = ? and account_id = ? and role = ?) LIMIT 1)";
            var args = new Array();
            args.push(req.params.org_id);
            args.push(req.params.acc_id);
            args.push(req.body.role);
            args.push(req.params.org_id);
            args.push(req.params.acc_id);
            args.push(req.body.role);
            dac.query(sql, args, (ex, result)=>{
                if(ex){res.json(new TaskException(-1, "创建角色失败", ex)); return;}
                else if(result.affectedRows === 0){res.json({status:"ok", extra:"角色已存在" }); return;}
                else {res.json({status:"ok"}); return;}
            });
        };

        task.begin();
    }

    export function DeleteRole(req, res){
        var dac = MySqlAccess.RetrievePool();

        var sql = "DELETE FROM t_staff_org_member " +
            "WHERE org_id = ? and account_id = ? and role = ?";
        dac.query(sql, [req.params.org_id, req.params.acc_id, req.params.role], (ex, result)=>{
            if(ex){res.json(new TaskException(-1, "创建角色失败", ex)); return;}
            else if(result.affectedRows === 0){res.json({status:"ok", extra:"角色不存在"}); return;}
            else {res.json({status:"ok"}); return;}
        });
    }

    export function ModifyRole(req, res){
        if(Object.keys(req.body).length === 0){
            res.json({
                putData:{ role: "ADMIN"},
                remark:"必填:role"
            });
            return;
        }

        if(req.params.org_id == 1 && req.params.acc_id == 1){res.json(new TaskException(-1, "不允许修改系统内置ADMIN", null)); return; }
        if(!req.body.role || req.body.role.trim().length === 0) {res.json(new TaskException(-1, "缺少role参数", null)); return; }
        if(req.body.role && req.body.role.trim() == req.params.role){res.json({status:"ok", extra:"没有可以修改的内容"}); return;}

        var dac = MySqlAccess.RetrievePool();
        var sql = "UPDATE t_staff_org_member SET role = ? " +
            "WHERE org_id = ? and account_id = ? and role = ?";
        dac.query(sql, [req.body.role, req.params.org_id, req.params.acc_id, req.params.role], (ex, result)=>{
            if(ex){res.json(new TaskException(-1, "修改角色失败", ex)); return; }
            else if(result.affectedRows === 0){ res.json(new TaskException(-1, "角色不存在", null)); return; }
            else{
                res.json({status:"ok"});
                return;
            }
        });
    }

    export class AccountRepository{
        BatchLoadAccount(ids:number[], cb:(ex, accs:Account[])=>void):void{
            var dac = MySqlAccess.RetrievePool();
            MySqlAccess.StoreIds("tmp_ids", ids, (ex, result)=>{
                if(ex){ cb(new TaskException(-1, "读取用户数据失败", ex), null); return; }
                else{
                    dac.query("SELECT id, name, nick, status, email, phone, last_login_time, last_login_ip" +
                        " FROM t_staff_account WHERE id in (" +
                            "SELECT id FROM tmp_ids)", null, (ex, result)=>{
                        if(ex) { cb(new TaskException(-1, "读取用户数据失败", ex), null); return; }
                        else{
                            dac.query("DROP TABLE tmp_ids", null, (ex, r)=>{});
                            var accs = new Array<Account>();
                            result.forEach((dto)=>{
                                accs.push(Account.CreateFromDTO(dto));
                            });
                            cb(null, accs);
                            return;
                        }
                    });
                }
            });
        }

        LoadAccountById(id:number, cb:(ex, acc)=>void):void{
            this.BatchLoadAccount([id], (ex, accs)=>{
                if(ex) { cb(ex, null); return; }
                else{
                    cb(null, accs[0]);
                    return;
                }
            });
        }

        Update(acc:Account, cb:(ex, acc)=>void):void{
            var dac = MySqlAccess.RetrievePool();
            var sql = "UPDATE t_staff_account SET ? WHERE id = ?";
            dac.query(sql, [acc, acc.id], (ex, result)=>{
                if(ex){ cb(new TaskException(-1, "修改帐户失败", ex), null); return; }
                else{
                    cb(null, acc);
                }
            });
        }
    }

    export class Account extends DTO.staff_account{
        token: string;

        get Status():string{
            switch(this.status){
                case 0: return "禁用";
                case 1: return "启用";
                default: return "禁用";
            }
        }

        // 用户帐号是否被禁用
        IsDisabled():boolean{
            return (this.status !== 1);
        }

        // 生成用户令牌token
        MakeToken(name:string, tm:Date, ip:string, agent:string):void{
            var evdData = util.format("%j", {name:name, tm:tm, ip:ip, agent:agent});
            var cipherAES = crypto.createCipher("aes128", new Buffer(Account.GetTokenKey()));
            cipherAES.setAutoPadding(true);
            this.token = cipherAES.update(evdData, "utf8", "base64");
            this.token += cipherAES.final("base64");
        }

        // 权限检查
        IsGranted(org:DTO.staff_org, role:string, cb:(err:TaskException, granted:boolean)=>void):void{
            var dac = MySqlAccess.RetrievePool();
            dac.query("SELECT role FROM t_staff_org_member WHERE org_id = ? AND account_id = ?",
                [org.id, this.id], (err, result)=>{
                    if(err){
                        cb(new TaskException(-1, "数据访问错误", null), false);
                        return;
                    }
                    else{
                        if(role === "WRITE")
                            cb(null, result.length > 0 && result.some((value)=>{ return value.role === "ADMIN" || value.role === "WRITE"; }));
                        else if(role === "READ")
                            cb(null, result.length > 0 && result.some((value)=>{ return value.role === "ADMIN" || value.role === "READ"; }));
                        else
                            cb(null, result.length > 0 && result.some((value)=>{ return value.role === role; }));
                    }
                });
        }

        static CreateFromDTO(dto:DTO.staff_account):Account{
            var target = new Account();
            target.id = dto.id;
            target.name = dto.name;
            // target.pwd = dto.pwd 屏掉pwd
            target.nick = dto.nick;
            target.email = dto.email;
            target.phone = dto.phone;
            target.last_login_ip = dto.last_login_ip;
            target.last_login_time = dto.last_login_time;
            target.status =  dto.status;
            return target;
        }

        static CreateFromToken(token:string, cb:(err:TaskException, account:Account)=>void):void{
            if(!token){
                cb(new TaskException(-1, "无效token", null), null);
                return;
            }

            // 解密token
            var decipherAES = crypto.createDecipher("aes128", new Buffer(Account.GetTokenKey()));
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
            var account: Account;
            var dac = MySqlAccess.RetrievePool();
            dac.query("SELECT id, name, nick, status, email, phone, last_login_time, last_login_ip FROM t_staff_account WHERE name = ? LIMIT 1;", [userAccept.name],
                (err, result)=>{
                    if(!err && result.length === 1){
                        account = Account.CreateFromDTO(result[0]);
                        if(account.IsDisabled()){
                            cb(new TaskException(-1, "用户已被禁用", null), null);
                            return;
                        }
                        else{
                            cb(null, account);
                            return;
                        }
                    }
                    else{
                        cb(new TaskException(-1, "安全校验失败", err), null);
                        return;
                    }
                });
        }

        static GetTokenKey():string{
            return "2014Mar15";
        }
    }
}