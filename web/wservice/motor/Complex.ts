/// <reference path="references.ts" />

module Service{
    // 获取4S店以及第1个admin
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

    // 增加一个4S店和一个admin
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

    // 获取车和它的车主
    export function GetCarwithOwner(req, res){
        res.setHeader("Accept-Query", "page,pagesize,org_id,org_city,brand_id,series_id,acc_nick,acc_phone");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT %s " +
            "FROM t_car_user as U " +
            "JOIN t_staff AS A ON U.acc_id = A.id " +
            "JOIN t_car AS C ON U.car_id = C.id " +
            "LEFT OUTER JOIN t_4s AS O ON C.s4_id = O.id " +
            "LEFT OUTER JOIN t_car_dictionary AS S ON C.brand = S.brandCode and C.series = S.seriesCode " +
            "WHERE U.user_type = 1";
        var args = new Array();
        if(req.query.org_id) {sql += " and C.s4_id = ?"; args.push(req.query.org_id);}
        if(req.query.org_city) { sql += " and O.city = ?"; args.push(req.query.org_city); }
        if(req.query.brand_id) { sql += " and C.brand = ?"; args.push(req.query.brand_id); }
        if(req.query.series_id) { sql += " and C.series = ?"; args.push(req.query.series_id); }
        if(req.query.acc_nick) { sql += " and A.nick = ?"; args.push(req.query.acc_nick); }
        if(req.query.acc_phone) { sql += " and A.phone = ?"; args.push(req.query.acc_phone); }

        var sql2 = util.format(sql, "A.id AS acc_id, A.name AS acc_name, A.nick AS acc_nick, A.status AS acc_status, A.phone AS acc_phone, " +
            "O.name AS org_name, O.id AS org_id, " +
            "C.id AS car_id, C.license AS car_license, C.brand AS brand_id, S.brand AS car_brand, C.series AS series_id, S.series AS car_series, C.obd_code");
        if(page.IsValid()) sql2 += page.sql;
        var sql3 = util.format(sql, "COUNT(*) AS count");

        var task:any = { finished: 0 };
        task.begin = ()=>{
            dac.query(sql2, args, (ex, result)=>{
                task.A = {ex:ex, result:result};
                task.finished++;
                task.end();
            });

            dac.query(sql3, args, (ex, result)=>{
                task.B = {ex:ex, result:result};
                task.finished++;
                task.end();
            });
        };

        task.end = ()=>{
            if(task.finished < 2 ) return;
            if(task.A.ex) { res.json(new TaskException(-1, "查询车主失败", task.A.ex)); return; }

            var totalCount = 0;
            if(!task.B.ex) totalCount = task.B.result[0].count;

            res.json({status:"ok", totalCount:totalCount, carowners:task.A.result});
        };

        task.begin();
    }
}