
module Service{

    export module APGet{
        // 测试用途
        export function HelloAPI(req, res){ res.send({status:"ok", text:"Hello API!"}); }

        // 注销
        export function Logout(req, res){
            Service.Logout(req, res);
        }

        // 枚举全部支持的接口
        export function EnumAllAPIs(req, res){
            var apis = { get:[], post:[] };
            for(var fn in APGet){ apis.get.push(fn); }
            for(var fn in APPost){ apis.post.push(fn); }
            res.send(apis);
        }

        // 返回全部OBD设备
        export function GetAllOBDDevices(req, res){
            Service.GetAllOBDDevices(req, res);
        }

        // 返回所有OBD设备的行车数据
        export function GetDriveInfoAll(req, res){
            // page=1&pagesize=8&city=北京&org=4S店A&obd_code=WF1234567
            res.setHeader("Accept-Query", "city,org,obd_code,page,pagesize");
            Service.GetDriveInfoAll(req, res);
        }
    }

    export module APPost{
        // 用户注册
        export function RegisterAccount(req, res){
            if(Object.keys(req.body).length > 0) Service.RegisterAccount(req, res);
            else res.json({
                postData: {
                    name: "usr001",
                    pwd: "7d1d8b1504f2bf1da3db3cb8751ec62f197aa124",
                    nick: "用户001",
                    email: "usr001@google.com",
                    phone: "(+86) 13912345678"
                }
            });
        }
        // 用户登录
        export function Login(req, res){
            if(Object.keys(req.body).length > 0) Service.Login(req, res);
            else res.json({
                postData:{
                    name: "usr001",
                    pwd: "7d1d8b1504f2bf1da3db3cb8751ec62f197aa124",
                    agent: "wechat"
                }
            });
        }

        // 登记OBD设备
        export function AddOBDDevice(req, res){
            if(Object.keys(req.body).length > 0) Service.AddOBDDevice(req, res);
            else res.json({
                postData: {
                    code: "WFQ00012345",
                    phone_number: "13912345678",
                    comment: "4S测试店"
                }
            });
        }

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

    // 出错时,返回给客户端的Json对象
    export class JsonError{
        status:string;
        detail:any;

        constructor(ex:TaskException){
            this.status = ex.status;
            this.detail = ex.innerTaskException;
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
