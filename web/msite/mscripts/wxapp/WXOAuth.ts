/// <reference path="wxApp.ts" />

module wxApp{
    export class WXOAuth{
        constructor($location){
            this._$location = $location;
        }

        public findUserOpenId = (cb:(data)=>void)=>{
            var args = this._$location.search();
            var wx_code = args.code;
            if(wx_code){
                // 用CODE换取用户的open_id
                var $injector = angular.injector(['wxApp']);
                var $http = $injector.get('$http');
                var postData = { app_id: args.state, code: wx_code };
                $http.post('/mservice/getOpenid' ,postData)
                    .success((data, status, headers, config)=>{ cb(data); })
                    .error((data, status, headers, config)=>{ cb(status); });
            }
            else{
                if(!args.app_id) {
                    console.error("缺少app_id");
                    return;
                }
                // 获取CODE
                var redirect = "http://"+ this._$location.host() + this._$location.path();
                var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + args.app_id +
                    "&redirect_uri=" + encodeURIComponent(redirect) +
                    "&response_type=code&scope=snsapi_base&state=" + args.app_id + "#wechat_redirect";
                window.location.href = url;
            }
        }

        private _$location : any;
    }
}