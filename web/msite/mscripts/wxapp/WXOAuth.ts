/// <reference path="wxApp.ts" />

module wxApp{
    export class WXOAuth{
        constructor($location){
            this._$location = $location;
        }

        public findUserOpenId = ()=>{
            var args = this._$location.search();
            var wx_code = args.code;
            if(wx_code){
                alert(wx_code);
            }
            else{
                // 获取CODE
                if(!args.app_id) {
                    console.error("缺少app_id");
                    return;
                }

                var redirect = "http://"+ this._$location.host() + ":" + this._$location.port() + this._$location.path();
                var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + args.app_id +
                    "&redirect_uri=" + encodeURIComponent(redirect) +
                    "&response_type=code&scope=snsapi_base&state=" + args.app_id + "#wechat_redirect";
                window.location.href = url;
            }
        }

        private _$location : any;
    }
}