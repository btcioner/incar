/// <reference path="../dts/node.d.ts" />
/// <reference path="Service.ts" />

module Service{
    export function main(req : any, res : any):void{
        try{
            var action = req.params[0];
            var actionAPI : (req, res)=>void;
            if(req.method === "GET"){
                if(action){
                    // 尝试是否有匹配的GET的方法
                    actionAPI = APGet[action];
                    if(actionAPI) actionAPI(req, res);
                    else res.send(404); // Not Found!
                }
                else res.send(404); // Not Found!
            }
            else if(req.method === "POST"){
                if(action){
                    // 先尝试访问是否有匹配的POST方法
                    // 如果没有,再尝试是否有匹配的GET方法
                    actionAPI = APPost[action];
                    if(actionAPI) actionAPI(req, res);
                    else{
                        actionAPI = APGet[action];
                        if(actionAPI) actionAPI(req, res);
                        else res.send(404); // Not Found!
                    }
                }
                else res.send(404); // Not Found!
            }
        }
        catch(e){
            res.send(e);
        }
    }

    // 临时用于测试目的
    export function html(req:any, res:any):void{
        res.sendfile("./wservice/test.html");
    }
}

module.exports = Service;
