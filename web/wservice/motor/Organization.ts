/// <reference path="references.ts" />

module Service{
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
