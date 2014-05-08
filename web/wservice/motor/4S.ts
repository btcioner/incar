/// <reference path="references.ts" />

module Service{
    export function Get4S(req, res){
        res.setHeader("Accept-Query", "page,pagesize,name,status,prov,city");
        var page = new Pagination(req.query.page, req.query.pagesize);
        var repo = S4Repository.GetRepo();
        repo.Get4S(page, req.query, (ex, total, result)=>{
            if(ex){ res.json(ex); return; }
            var array4s = DTOBase.ExtractDTOs<DTO.S4>(result);
            array4s.forEach((s4:DTO.S4)=>{
                // 微信的帐号资料不应返回给客户,仅供内部使用
                s4.wx_login = undefined;
                s4.wx_pwd = undefined;
            });
            res.json({status:"ok", totalCount:total, s4s: array4s});
        });
    }

    export function Get4SById(req, res){
        var repo = S4Repository.GetRepo();
        repo.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(ex); return; }
            var target = s4.DTO();
            // 微信的帐号资料不应返回给客户,仅供内部使用
            target.wx_login = undefined;
            target.wx_pwd = undefined;
            res.json({status:"ok", s4:target});
        });
    }

    export function Add4S(req, res){
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
                    wx_status:1
                },
                remark:"必填:name"
            });
            return;
        }

        var data = req.body;
        var err = "";
        if(!data.name) err += "缺少参数name";
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
            res.json({status:"ok", s4:s4.DTO() });
        });
    }

    export function Modify4S(req, res){
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
                    wx_status:1
                },
                remark:"必填:无"
            });
            return;
        }

        var data = req.body;
        //////////////////////////
        var dto:any = { id: req.params.s4_id };
        if(isStringNotEmpty(data.name)) dto.name = data.name;
        if(!isNaN(data.status)) dto.status = data.status;
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
        repo.Modify4S(s4, (ex:TaskException)=>{
            if(ex) { res.json(ex); return; }
            res.json({status:"ok"});
        });
    }

    export class S4Repository{
        static GetRepo():S4Repository{
            var repo = new S4Repository();
            return repo;
        }

        private dac:any;

        constructor(){
            this.dac = MySqlAccess.RetrievePool();
        }

        Get4S(page:Pagination, filter:any, cb:(ex:TaskException, total:number, result:S4[])=>void){
            var sql = "SELECT %s FROM t_4s WHERE 1=1";
            var args = [];

            if(filter.name) { sql += " and name = ?"; args.push(filter.name); }
            if(filter.status) { sql += " and status = ?"; args.push(filter.status); }
            if(filter.prov) { sql += " and prov = ?"; args.push(filter.prov); }
            if(filter.city) { sql += " and city = ?"; args.push(filter.city); }

            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "*");
                if(page.IsValid()) sqlA += page.sql;
                this.dac.query(sqlA, args, (ex, result)=>{
                    task.A = { ex: ex, result: result };
                    task.finished++;
                    task.end();
                });

                var sqlB = util.format(sql, "COUNT(*) count");
                this.dac.query(sqlB, args, (ex, result)=>{
                    task.B = { ex:ex, result:result };
                    task.finished++;
                    task.end();
                });
            };

            task.end = ()=>{
                if(task.finished < 2) return;
                if(task.A.ex){ cb(new TaskException(-1, "查询4S店失败", task.A.ex), 0, null); return; }
                var objs = new Array<S4>();
                task.A.result.forEach((dto)=>{
                    objs.push(new S4(dto));
                });
                var total = 0;
                if(!task.B.ex) total = task.B.result[0].count;

                cb(null, total, objs);
            };

            task.begin();
        }

        Get4SById(id:number, cb:(ex:TaskException, result:S4)=>void){
            var sql = "SELECT * FROM t_4s WHERE id = ?";
            this.dac.query(sql, [id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "查询4S店失败", ex), null); return; }
                else if(result.length === 0) { cb(new TaskException(-2, util.format("指定的4S店不存在(id=%s)", id), null), null); return; }
                else if(result.length > 1) { cb(new TaskException(-3, util.format("4S店数据异常(id=%s)", id), null), null); return; }
                cb(null, new S4(result[0]));
            });
        }

        Add4S(s4:S4, cb:(ex:TaskException, s4:S4)=>void){
            var sql = "INSERT t_4s SET ?";
            this.dac.query(sql, [s4.dto], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "增加4S店失败", ex), null); return; }
                s4.dto.id = result.insertId;
                cb(null, s4);
            });
        }

        Modify4S(s4:S4, cb:(ex:TaskException)=>void){
            var sql = "UPDATE t_4s SET ? WHERE id = ?";
            this.dac.query(sql, [s4.dto, s4.dto.id], (ex, result)=>{
                if(ex) { cb(new TaskException(-1, "修改4S店失败", ex)); return; }
                if(result.affectedRows === 0){ cb(new TaskException(-2, util.format("指定的4S店(id=%s)不存在", s4.dto.id), null)); return; }
                cb(null);
            });
        }
    }

    export class S4 extends DTOBase<DTO.S4>{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.S4{
            var dto:DTO.S4 = super.DTO();

            if(dto.status === 0) dto.status_name = "禁用";
            else if(dto.status === 1) dto.status_name = "启用";

            return dto;
        }

        public GetStaff(page:Pagination, filter:any, cb:(ex:TaskException, total:number, staffs:Staff[])=>void){
            var sql = "SELECT %s FROM t_staff WHERE s4_id = ?";
            var args = [this.dto.id];

            if(filter.name) { sql += " and name = ?"; args.push(filter.name); }
            if(filter.nick) { sql += " and nick = ?"; args.push(filter.nick); }
            if(filter.email) { sql += " and email = ?"; args.push(filter.email); }
            if(filter.phone) { sql += " and phone = ?"; args.push(filter.phone); }
            if(!isNaN(filter.status)) { sql += " and status = ?"; args.push(filter.status); }

            var dac = MySqlAccess.RetrievePool();
            var task:any = { finished:0 };
            task.begin = ()=>{
                var sqlA = util.format(sql, "*");
                if(page.IsValid()) sqlA += page.sql;
                dac.query(sqlA, args, (ex, result)=>{
                    task.A = { ex: ex, result: result };
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
                if(task.A.ex){ cb(new TaskException(-1, "查询4S店员失败", task.A.ex), 0, null); return; }
                var objs = [];
                task.A.result.forEach((dto)=>{
                    objs.push(new Staff(dto));
                });
                var total = 0;
                if(!task.B.ex) total = task.B.result[0].count;

                cb(null, total, objs);
            };

            task.begin();
        }
    }
}