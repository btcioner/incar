/// <reference path="references.ts" />

module Service {
    export function GetManualAll(req, res):void{
        res.setHeader("Accept-Query", "page,pagesize,keyword");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT %s FROM t_manual_content WHERE (1=1)";
        var args = new Array();
        if(req.query.keyword && req.query.keyword.trim().length > 0){
            sql += " and keyword LIKE ?";
            args.push("%" + req.query.keyword.trim() + "%");
        }

        var sql2 = util.format(sql, "*");
        if(page.IsValid()) sql2 += page.sql;
        var sql3 = util.format(sql, "COUNT(*) count");

        var task :any = { finished: 0 };
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
            if(task.finished < 2) return;
            if(task.A.ex) { res.json(new TaskException(-1, "查询行车手册失败", task.A.ex)); return; }

            var totalCount = 0;
            if(!task.B.ex) totalCount = task.B.result[0].count;
            task.A.result.forEach((obj:any)=>{
                if(obj.filename) {
                    obj.filename = "/data/manual/" + obj.filename;
                }
            });

            res.json({status:"ok", totalCount:totalCount, manual:task.A.result});
        };

        task.begin();

    }

    export function GetManual(req, res):void{
        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT * FROM t_manual_content WHERE id = ?";
        dac.query(sql, [req.params.id], (ex, result)=>{
            if(ex) { res.json(new TaskException(-1, "查询行车手册失败", ex)); return; }
            else if(result.length === 0){ res.json(new TaskException(-1, util.format("行车手册%d不存在", req.params.id), null)); return; }
            else{
                var manual = result[0];
                if(manual.filename) {
                    manual.filename = "/data/manual/" + manual.filename;
                }
                res.json({status:"ok", manual:manual});
                return;
            }
        });
    }

    export function AddManual(req, res):void{
        if(Object.keys(req.body).length === 0){
            res.json({postData:{
                keyword: "备胎",
                title:"如何更换备胎",
                description:"就这样更换备胎"
                },
                remark:"必填:title"
            });
            return;
        }

        var data = req.body;
        var file = { filename: null };
        if(req.files.pro_img){
            var idx = req.files.pro_img.path.lastIndexOf("\\");
            file.filename = req.files.pro_img.path.slice(idx+1);
        }

        var dac = MySqlAccess.RetrievePool();
        var sql = "INSERT t_manual_content(keyword, title, description, filename) VALUES(?,?,?,?)";
        dac.query(sql, [data.keyword, data.title, data.description, file.filename], (ex, result)=>{
            if(ex){ res.json(new TaskException(-1, "创建行车手册失败", ex)); return; }
            else{
                res.json({status:"ok", id: result.insertId });
            }
        });
    }

    export function ModifyManual(req, res):void{
        if(Object.keys(req.body).length === 0){
            res.json({putData:{
                keyword: "备胎",
                title:"如何更换备胎",
                description:"就这样更换备胎"
            },
                remark:"必填:title"
            });
            return;
        }

        var dac = MySqlAccess.RetrievePool();
        var sql = "SELECT * FROM t_manual_content WHERE id = ?";;
        dac.query(sql, [req.params.id], (ex, result)=>{
            if(ex){ res.json(new TaskException(-1, "查询行车手册失败", null)); return; }
            else if(result.length === 0){ res.json(-1, util.format("行车手册%d不存在", req.params.id), null); return; }
            else{
                var manual:any = result[0];
                var data = req.body;
                if(data.keyword && data.keyword.trim().length > 0) manual.keyword = data.keyword.trim();
                if(data.title && data.title.trim().length > 0) manual.title = data.title.trim();
                if(data.description && data.description.trim().length > 0) manual.description = data.description.trim();
                if(req.files.pro_img){
                    var idx = req.files.pro_img.path.lastIndexOf("\\");
                    manual.filename = req.files.pro_img.path.slice(idx+1);
                }
                sql = "UPDATE t_manual_content SET ? WHERE id = ?";
                dac.query(sql, [manual, manual.id], (ex, result)=>{
                    if(ex){ res.json(new TaskException(-1, "修改行车手册失败", null)); return; }
                    else{ res.json({status:"ok" }); return; }
                });
            }
        });
    }

    export function DeleteManual(req, res):void{
        var dac = MySqlAccess.RetrievePool();
        var sql = "DELETE FROM t_manual_content WHERE id = ?";
        dac.query(sql, [req.params.id], (ex, result)=>{
            if(ex){ res.json(new TaskException(-1, "删除行车手册失败", ex)); return; }
            else if(result.affectedRows === 0){ res.json({status:"ok", extra:util.format("行车手册%d不存在", req.params.id)}); return; }
            else { res.json({status:"ok"}); return; }
        });
    }
}
