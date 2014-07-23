module wxApp{
    export class WXShare {
        constructor(){
        }

        public wxShare = (title:string, url:string, pic:string, desc:string)=>{
            if(typeof WeixinJSBridge !== "undefined")
                this.wxShareAll(title, url, pic, desc);
            else {
                $(document).on("WeixinJSBridgeReady", ()=>{
                    this.wxShareAll(title, url, pic, desc);
                });
            }
        };

        private wxShareAll = (title:string, url:string, pic:string, desc:string)=>{
            this.wxShareTimeline(title, url, pic, desc);
            this.wxShareMsg(title, url, pic, desc);
            this.wxShareWeibo(title, url);
        };

        private wxShareTimeline = (title:string, url:string, pic:string, desc:string)=>{
            WeixinJSBridge.on("menu:share:timeline", function(argv){
                var dataShared = {
                    img_url:pic,
                    link:url,
                    title:title,
                    desc:''
                };
                WeixinJSBridge.invoke("shareTimeline", dataShared);
            });
        };

        private wxShareMsg = (title:string, url:string, pic:string, desc:string)=>{
            WeixinJSBridge.on("menu:share:appmessage", function(argv){
                var dataShared = {
                    img_url:pic,
                    link:url,
                    title:title,
                    desc:''
                };
                WeixinJSBridge.invoke("sendAppMessage", dataShared);
            });
        };

        private wxShareWeibo = (title:string, url:string)=>{
            WeixinJSBridge.on("menu:share:weibo", function(argv){
                var dataShared = {
                    url:url,
                    content:title
                };
                WeixinJSBridge.invoke("shareWeibo", dataShared);
            });
        };
    }
}
