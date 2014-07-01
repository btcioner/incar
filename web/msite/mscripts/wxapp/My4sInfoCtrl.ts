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

            $scope.model = this;
            $scope.url = $location.url();
        };

        private user_openid: string;
        private $http: any;
        private $scope: any;
    }
}