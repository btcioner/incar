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
        $locationProvider.html5Mode(false);
    }]);

    // 页面控制器
    class DevAPCtrl {
        constructor(ctrlName:string) {
            _module.controller(ctrlName, ['$scope', '$location', '$sce', this.init]);
        }

        private init = ($scope, $location, $sce) => {
            $scope.model = this;
            this.$sce = $sce;

            var name = $location.search().name;
            if (angular.isDefined(name)) this.name = name;

            var url = this.urls[name];
            if(angular.isDefined(url)) this.url = url += "?name=" + name;

            // qrcode
            this.makeQRCode(this.url, $sce);
        };

        private makeQRCode = (text:string, $sce:any)=>{
            var qr = new qrcode(6, 'L');
            qr.addData(text);
            qr.make();
            this.img_qrcode = $sce.trustAsHtml(qr.createImgTag(6, 6));
        };

        public reload = ($event)=>{
            document.location.reload(true);
        };

        public changeQRCode = ()=>{
            this.makeQRCode(this.url, this. $sce);
        };

        // 被测试的页面
        public pages = [
            { title: "行车手册", url: "/msite/page_xcsc.html" },
            { title: "以后添加", url: "./msite/none.html" } ];

        // 每个人可以把自己最常用的内网测试URL放在这里
        public urls = {
            xgh: "http://192.168.6.16:51234/4sStore/devAP.html",
            jl : "http://192.168.88.107:51234/4sStore/devAP.html",
            zp : "http://192.168.88.108:51234/4sStore/devAP.html" };

        // 缺省url指向xgh
        public name = "xgh";
        public url = "http://192.168.6.18:51234/4sStore/devAP.html";
        public img_qrcode:string;

        private $sce:any;
    }
    var devAPCtrl = new DevAPCtrl("devAPCtrl");
}