/// <reference path="references.ts" />

module Service{
    // 增加组织
    export function AddOrganization(req:any, res:any):void{
        if(Object.keys(req.body).length === 0){
            res.json({
                postData:{
                    name:"奥体中心4S店",
                    class:"4S",
                    prov:"北京",
                    city:"北京",
                    admin_name:"user9",
                    admin_nick:"全智贤",
                    admin_pwd:"7d1d8b1504f2bf1da3db3cb8751ec62f197aa124",
                    admin_phone:"13912345678",
                    admin_email:"qzx@movie.kr"
                },
                remark:"必填项:name, admin_name, admin_pwd"
            });
            return;
        }
        var data = req.body;
        if(!data.name || data.name.trim().length === 0) { res.json({status:"缺少name"}); return; }

        var error = '';
        var regexName = new RegExp("^[a-z0-9_]{3,32}$", "i");
        if((!data.admin_name) || data.admin_name.trim() === '') error += 'name不能为空白;';
        else if(!regexName.test(data.admin_name.trim())) error += 'name只能由数字或字母组成,最少3字符,最多32字符;';
        if((!data.admin_pwd) ||data.admin_pwd.length === 0) error +=  'pwd不能为空白;';
        if(error.length > 0) {
            res.json({status:error});
            return;
        }

        var org = new DTO.staff_org();
        org.name = data.name.trim();
        if(data.class) org.class = data.class.trim();
        if(data.prov) org.prov = data.prov.trim();
        if(data.city) org.city = data.city.trim();
        org.status = 1;

        var repo = new OrgRepository();
        repo.Add(org, (ex, org)=>{
            if(ex) { res.json(ex); return;}
            else{
                var accDTO = new DTO.staff_account();
                accDTO.name = data.admin_name;
                accDTO.pwd = data.admin_pwd;
                accDTO.nick = data.admin_nick;
                accDTO.phone = data.admin_phone;
                accDTO.email = data.admin_email;

                var dac = MySqlAccess.RetrievePool();
                dac.query('INSERT ?? SET ?',['t_staff_account', accDTO], (err, result)=>{
                    if(!err){
                        accDTO.id = result.insertId;
                        var acc =  Account.CreateFromDTO(accDTO);
                        org.admin_id = acc.id;
                        org.admin_name = acc.name;
                        org.admin_nick = acc.nick;
                        org.admin_phone = acc.phone;
                        org.admin_email = acc.email;
                        //设置ADMIN
                        dac.query("INSERT t_staff_org_member(org_id, account_id, role) VALUES (?, ?, 'ADMIN')",
                            [org.id, result.insertId], (ex, result)=>{
                                if(ex){ res.json(new TaskException(-1, "创建ADMIN关系失败", ex)); return; }
                                else{
                                    res.json({status:"ok", organization:org});
                                }
                            });
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
        });
    }

    // 修改组织
    export function ModifyOrganization(req:any, res:any):void{
        if(Object.keys(req.body).length === 0) {
            res.json({
                putData:{
                    name:"4S店C",
                    class:"4S",
                    status:0,
                    prov:"湖北",
                    city:"武汉",
                    admin_nick:"都敏俊",
                    admin_phone:"13912345678"
                }
            });
        }
        else{
            // 获得需要修改的ORG
            var repoOrg = new OrgRepository();
            repoOrg.GetOrgById(req.params.org_id, (ex, org)=>{
                if(ex){ res.json(ex); return; }
                else{
                    var data = req.body;
                    if(data.name && data.name.trim() !== "")
                        org.name = data.name.trim();
                    if(data.class && data.class.trim() !== "")
                        org.class = data.class.trim();
                    if(data.status && Number(data.status) >= 0 )
                        org.status = Number(data.status);
                    if(data.prov && data.prov.trim() !== "")
                        org.prov = data.prov.trim();
                    if(data.city && data.city.trim() !== "")
                        org.city = data.city.trim();

                    repoOrg.UpdateOrg(org, (ex, org)=>{
                        if(ex) {res.json(ex); return; }
                        else {
                            var dac = MySqlAccess.RetrievePool();
                            var sql = "SELECT account_id FROM t_staff_org_member" +
                                " WHERE org_id = ? and role = 'ADMIN'";
                            dac.query(sql, [org.id], (ex, accids)=>{
                                if(ex) {res.json(new TaskException(-1, "无法获取组织管理员", ex)); return; }
                                else{
                                    if(accids.length > 1){
                                        res.json(new TaskException(-1, "组织的管理员不唯一", null));
                                        return;
                                    }
                                    else if(accids.length === 0){
                                        res.json(new TaskException(-1, "组织没有管理员", null));
                                        return;
                                    }
                                    else{
                                        var accRepo = new AccountRepository();
                                        accRepo.LoadAccountById(accids[0].account_id, (ex, acc)=> {
                                            if (ex) {
                                                res.json(ex);
                                                return;
                                            }
                                            else {
                                                if (data.admin_nick && data.admin_nick.trim() !== "")
                                                    acc.nick = data.admin_nick.trim();
                                                if (data.admin_phone && data.admin_phone.trim() !== "")
                                                    acc.phone = data.admin_phone.trim();

                                                accRepo.Update(acc, (ex, acc)=> {
                                                    if (ex) {
                                                        res.json(ex);
                                                        return;
                                                    }
                                                    else {
                                                        org.admin_id = acc.id;
                                                        org.admin_name = acc.name;
                                                        org.admin_nick = acc.nick;
                                                        org.admin_phone = acc.phone;
                                                        res.json({status: "ok", organization: org});
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    }

    export class OrgRepository {
        // 创建顶级组织
        static CreateTopOrg():DTO.staff_org{
            var target = new DTO.staff_org();
            target.id = 1;
            target.name = "英卡科技";
            target.class = "TOP";
            target.status = 1;
            target.prov = "北京";
            target.city = "北京";
            return target;
        }

        // 全部组织
        All(page:Pagination,filter:any, cb:(ex : TaskException, totalCount:number, orgs : DTO.staff_org[])=>void):void{
            var dac = MySqlAccess.RetrievePool();

            var task:any = { finished : 0 };
            task.begin = ()=>{
                var sql = "SELECT %s FROM t_staff_org WHERE (1=1)";
                var args = new Array();
                if(filter.city && filter.city.trim().length > 0){
                    sql += " and city = ?";
                    args.push(filter.city.trim());
                }
                if(filter.name && filter.name.trim().length > 0){
                    sql += " and name = ?";
                    args.push(filter.name.trim());
                }

                // 主查询
                var sql2 = util.format(sql, "*");
                if(page.IsValid()) sql2 += page.sql;
                dac.query(sql2, args, (ex, result)=>{
                    task.A = {ex:ex, result:result};
                    task.finished++;
                    task.end();
                });

                // 数目
                var sql3 = util.format(sql, "COUNT(*) COUNT");
                dac.query(sql3, args, (ex, result)=>{
                    task.B = {ex:ex, result:result};
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished < 2) return;
                if(task.A.ex){ cb(new TaskException(-1, "无法获取组织", task.A.ex), 0,  null); return;}
                else{
                    var totalCount = 0;
                    if(!task.B.ex) totalCount = task.B.result[0].COUNT;
                    var orgs :Array<DTO.staff_org> = task.A.result;
                    cb(null, totalCount, orgs);
                }
            };

            task.begin();
        }

        // 组织的administrator
        GetOrgAdmin(ids:number[], cb:(ex, accs)=>void):void{
            var dac = MySqlAccess.RetrievePool();
            dac.query("SELECT accout_id FROM t_staff_org_member WHERE role = 'ADMIN' and ");
        }

        // 增加Organization
        Add(org:DTO.staff_org, cb:(ex, org)=>void):void{
            var dac = MySqlAccess.RetrievePool();
            dac.query("INSERT t_staff_org(name, class, status, prov, city) VALUES (?,?,?,?,?)",
                    [org.name, org.class, org.status, org.prov, org.city], (ex, result)=>{
                if(ex){ cb(new TaskException(-1, "创建组织出错", ex), null); return; }
                else{
                    org.id = result.insertId;
                    cb(null, org);
                }
            });
        }

        // 查询某个特定的ORG
        GetOrgById(id:number, cb:(ex, org)=>void):void{
            var dac = MySqlAccess.RetrievePool();
            var sql = "SELECT * FROM t_staff_org WHERE id = ? ";
            dac.query(sql, [id], (ex, result)=>{
                if(ex){ cb(new TaskException(-1, "数据库出错", null), null); return; }
                else if(result.length === 1){
                    var org : DTO.staff_org = result[0];
                    cb(null, org);
                }
                else{
                    var err = util.format("组织%s不存在", id);
                    cb(new TaskException(-1, err, null), null);
                }
            });
        }

        // 修改组织
        UpdateOrg(org:DTO.staff_org, cb:(ex, org)=>void):void{
            var dac = MySqlAccess.RetrievePool();
            dac.query("UPDATE t_staff_org SET ? WHERE id = ?", [org, org.id], (ex, result)=>{
                if(ex){ cb(new TaskException(-1, "更新组织失败", ex), null); return; }
                else{
                    this.GetOrgById(org.id, (ex, org)=>{
                        cb(ex, org);
                    });
                }
            });
        }
    }
}
