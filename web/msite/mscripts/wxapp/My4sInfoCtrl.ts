/// <reference path="wxApp.ts" />
module wxApp {
    export class My4sInfoCtrl {
        constructor(ctrlName:string) {
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$location', '$http', this.init]);
        }

        private init = ($scope, $location, $http) => {
            this.user_openid = $location.search().user;
            this.$http = $http;
            this.$scope = $scope;
            this.search4sInfo();

            $scope.model = this;
        };

        private search4sInfo = ()=> {
            this.$http.post("/mservice/my4sInfo", { user: this.user_openid }, { dataType: "json"})
                .success((data, status, headers, config)=> {
                    angular.forEach(data, (ad)=> {
                        ad.brief = ad.brief.replace(/<[^<>]+>|&nbsp;|\s+/g, "").substr(0,32);
                    });
                    this.ads = data;
                })
                .error((data, status, headers, config)=> {
                    console.log(status);
                });
        };

        private user_openid:string;
        private ads = [];
        private $http:any;
        private $scope:any;
    }
}