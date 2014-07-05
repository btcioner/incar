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
                var raw = this._$location.absUrl();
                var idx = raw.indexOf("/", 7);
                var base = raw.substr(0, idx);
                var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + args.app_id +
                    "&redirect_uri=" + encodeURIComponent(base + this._$location.path()) +
                    "&response_type=code&scope=snsapi_base#wechat_redirect";
                window.location.href = url;
            }
        }

        private _$location : any;
    }
}