module devAP {
    // 辅助声明
    declare var angular:{
        module: (moduleName:string, dependes:Array<any>)=>{
            controller: (ctrlName:string, init:Array<any>)=>any;
            config:any;
        };
        isUndefined: (value:any)=>boolean;
        isDefined: (value:any)=>boolean;
    };
    declare var qrcode:any;

    // 向AngularJS注册
    var _module = angular.module('devAP', []);
    _module.config(['$locationProvider', ($locationProvider)=> {
        $locationProvider.html5Mode(true);
    }]);

    // 页面控制器
    class DevAPCtrl {
        constructor(ctrlName:string) {
            // 尝试读取以前的配置
            if(localStorage && localStorage[this._lskURL]){
                this.url = localStorage[this._lskURL];
            }
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$sce', this.init]);
        }

        private init = ($scope, $sce) => {
            $scope.model = this;
            this.$sce = $sce;

            // qrcode
            this.makeQRCode(this.url, $sce);
        };

        private makeQRCode = (text:string, $sce:any)=>{
            var qr = new qrcode(6, 'Q');
            qr.addData(text);
            qr.make();
            this.img_qrcode = $sce.trustAsHtml(qr.createImgTag(6, 6));
        };

        public reload = ($event)=>{
            document.location.reload(true);
        };

        public changeQRCode = ($event)=>{
            if(($event instanceof KeyboardEvent) && $event.keyCode !== 13) return;

            if(localStorage){
                // 保存配置
                localStorage.setItem(this._lskURL, this.url);
            }
            this.makeQRCode(this.url, this.$sce);
        };

        // 被测试的页面
        public pages = [
            { title: "行车手册", url: "/msite/page_xcsc.html" },
            { title: "发现-我的预约", url: "/msite/myBooking.html?user=o1fUut3BkIo8XM6-8HG-3ORAtvls" /*模拟微信的openid*/ },
            { title: "发现-我的活动", url: "/msite/myActivity.html?user=o1fUut3BkIo8XM6-8HG-3ORAtvls" /*模拟微信的openid*/ }
        ];

        private _lskURL = "devAPurl";
        public url = "http://192.168.88.123:51234/4sStore/devAP.html";
        public img_qrcode:string;

        private $sce:any;
    }
    var devAPCtrl = new DevAPCtrl("devAPCtrl");
}