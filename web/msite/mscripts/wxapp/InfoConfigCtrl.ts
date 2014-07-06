/// <reference path="wxApp.ts" />
declare var init: ()=>void;

module wxApp {
    export class InfoConfigCtrl {
        constructor(ctrlName:string) {
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$location', '$http', this.init]);
        }

        private init = ($scope, $location, $http) => {
            this.$http = $http;
            this.user_openid = $location.search().user;
            if(this.user_openid) {
                // 已经获取了open_id, 查询数据
                init();
            }
            else{
                // 尚未得到open_id
                var wxoa = new WXOAuth($location);
                wxoa.findUserOpenId((data)=>{
                    if(!data.openid) alert(data);
                    // 已经获取了open_id,查询数据
                    this.user_openid = data.openid;
                    this.app_id = data.app_id;
                    init();
                });
            }

            $scope.model = this;
        };

        private user_openid:string;
        private app_id:string;
        private $http: any;
    }
}