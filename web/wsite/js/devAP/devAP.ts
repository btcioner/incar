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

    // 页面控制�?
    class DevAPCtrl {
        constructor(ctrlName:string) {
            // 尝试读取以前的配�?
            if(localStorage && localStorage[this._lskURL]){
                this.url = localStorage[this._lskURL];
            }
            // 向angular注册控制�?
            _module.controller(ctrlName, ['$scope', '$sce', this.init]);
        }

        private init = ($scope, $sce) => {
            $scope.model = this;
            this.$sce = $sce;

            // qrcode
            this.makeQRCode(this.url, $sce);

            // 模拟微信用户
            this.wx_oid_keys = Object.keys(this.wx_oids);
            if(this.wx_oid_keys.length > 0) this.wx_active_key = this.wx_oid_keys[0];
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


        public switchActive = (oid:string)=>{
            this.wx_active_key = oid;
        };

        // 被测试的页面
        public pages = [
            { title: "我的�?行车记录", url: "/msite/driveRecord.html" },
            { title: "我的�?行车分析", url: "/msite/myDrive.html" },
            { title: "我的�?行车手册", url: "/msite/page_xcsc.html" },
            { title: "我的�?行车报告", url: "/msite/travelReport.html" },
            { title: "我的4S-预约保养", url: "/msite/booking.html"  },
            { title: "我的4S-试乘试驾", url: "/msite/trialrun.html"  },
            { title: "我的4S-资讯活动", url: "/msite/my4sInfo.html" },
            { title: "发现-我的预约", url: "/msite/myBooking.html" },
            { title: "发现-我的活动", url: "/msite/myActivity.html" },
            { title: "发现-设置", url: "/msite/infoConfig.html" }

        ];

        private _lskURL = "devAPurl";
        public url = "http://114.215.172.92:80/4sStore/devAP.html";
        public img_qrcode:string;
        public wx_oids = {
            "wmq@dev" : "user=o1fUut3BkIo8XM6-8HG-3ORAtvls@gh_895980ee6356",
            "wmq@staging" : "user=oAPKMuL3dNs0NjF9ytmOQl8PpxMI@gh_2ca6120e0ed0",
            "xgh@staging" : "user=oAPKMuJssQAohcEgKyKkcRDUDiAw@gh_2ca6120e0ed0"
        };
        public wx_oid_keys : Array<string>;
        public wx_active_key: string;

        private $sce:any;
    }
    var devAPCtrl = new DevAPCtrl("devAPCtrl");
}