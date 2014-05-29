var util = require("util");

module Service{

    // 测试用途
    export function HelloAPI(req, res){ res.send({status:"ok", text:"Hello API!"}); }

    // 上传文件
    export function UploadFile(req, res){
        var count = 0;
        var uploads:any = {};
        for(var name in req.files){
            count++;
            uploads[name] = req.files[name].path.replace(/\\/g, '/');
        }
        if(count > 0){
            res.json({status:"ok", files:uploads});
        }
        else{
            res.json(new TaskException(-1, "上传失败", null));
        }
    }

    // 临时用于测试目的
    export function html(req:any, res:any):void{
        res.sendfile("./wservice/test.html");
    }

    // 是一个非空字符串返回true
    export function isStringNotEmpty(target:any):Boolean{
        return (typeof target  === "string" && target.length > 0);
    }

    // 任务异常
    export class TaskException{
        // 错误消息
        status = "ok";
        // 错误代码,0代表正常
        code = 0;
        // 内部错误
        innerTaskException : TaskException;

        constructor(errCode:number, msg:string, ex:TaskException){
            this.code = errCode;
            this.status = msg;
            if(ex) this.innerTaskException = ex;
            else this.innerTaskException = null;
        }
    }

    // 分页
    export class Pagination{
        _page:number; // 原始请求第几页
        _pagesize:number; // 每页多少条数据
        _offset:number; // 前侈少条数据不返回

        constructor(page:number, pagesize:number){
            this._page = Number(page);
            this._pagesize = Number(pagesize);
            if(this._page > 0 && this._pagesize > 0){
                this._offset = this._pagesize * (this._page - 1);
            }
        }

        IsValid():boolean{
            return (this._pagesize > 0 && this._offset >= 0);
        }

        get sql(){
            return util.format(" LIMIT %d,%d ", this._offset, this._pagesize);
        }
    }
}
