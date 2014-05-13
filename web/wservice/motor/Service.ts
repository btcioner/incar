
module Service{
    // 测试用途
    export function HelloAPI(req, res){ res.send({status:"ok", text:"Hello API!"}); }

    export module APGet{

        // 返回所有OBD设备的行车数据
        export function GetDriveInfoAll(req, res){
            // page=1&pagesize=8&city=北京&org=4S店A&obd_code=WF1234567
            res.setHeader("Accept-Query", "city,org,obd_code,page,pagesize");
            Service.GetDriveInfoAll(req, res);
        }
    }

    export module APPost{

        // 返回指定OBD设备的相关行车数据
        export function GetDriveInfo(req, res){
            if(Object.keys(req.body).length > 0) Service.GetDriveInfo(req, res);
            else res.json({
                postData:{
                    code: "WFQ00012345"
                }
            });
        }

        // OBD详细行车数据
        export function GetDriveDetail(req, res){
            if(Object.keys(req.body).length > 0) Service.GetDriveDetail(req, res);
            else res.json({
                postData:{
                    code: "WFQ00012345",
                    drive_id: 54
                }
            });
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

    // 是一个非空字符串返回true
    export function isStringNotEmpty(target:any):Boolean{
        return (typeof target  === "string" && target.length > 0);
    }
}
