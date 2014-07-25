/// <reference path="wxApp.ts" />
module wxApp {
    export class MyActInfoCtrl {
        constructor(ctrlName:string) {
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$location', '$http', this.init]);
        }

        private init = ($scope, $location, $http) => {
            this.user_openid = $location.search().user;
            this.$http = $http;
            this.$scope = $scope;

            $scope.model = this;
        };

        private user_openid: string;
        private $http: any;
        private $scope: any;
        private cover_show=false;
        private upbox_show = false;
        private tips:string;
    }
}