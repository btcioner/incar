module wxApp {
    // 辅助声明
    declare var angular:{
        module: (moduleName:string, dependes:Array<any>)=>{
            controller: (ctrlName:string, init:Array<any>)=>any;
            config:any;
        };
        isUndefined: (value:any)=>boolean;
        isDefined: (value:any)=>boolean;
        forEach: (value:any, cb:(obj:any)=>any)=>any;
    };

    // 向AngularJS注册
    var _module = angular.module('wxApp', ['ngResource']);
    _module.config(['$locationProvider', ($locationProvider)=> {
        $locationProvider.html5Mode(true);
    }]);

    // 页面控制器
    class DriveManualCtrl {
        constructor(ctrlName:string) {
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$resource', this.init]);
        }

        private init = ($scope, $resource) => {
            $scope.model = this;
            // 登记服务
            this.srvManual = $resource("/wservice/manual");
        };

        public search2 = ($event) =>{
            if($event.keyCode === 13) this.search();
        };

        public search = () =>{
            this.tip = "正在搜索: " + this.keyword + "...";
            this.searchResult.length = 0;
            var result = this.srvManual.get({keyword:this.keyword, page:1, pagesize:10}, ()=>{
                // fetch the result
                if(result.status === "ok"){
                    angular.forEach(result.manual, (obj)=>{
                        obj.img_url = obj.filename;
                        obj.filename = undefined;
                        this.searchResult.push(obj);
                    });
                    if(this.searchResult.length > 0) this.tip = null;
                    else this.tip = "没有找到相关的信息,请尝试其它关键字";
                }
                else{
                    this.tip = result.status;
                }
            });
        };

        private srvManual:any;
        public keyword = "备胎";
        public searchResult : Array<ManualItem> = [];
        public tip = "点击搜索查询相关内容,比如'备胎'";
    }
    var driveManualCtrl = new DriveManualCtrl("driveManualCtrl");

    class ManualItem{
        public id:number;
        public keyword:string;
        public img_url:string;
        public title:string;
        public description:string;
    }
}