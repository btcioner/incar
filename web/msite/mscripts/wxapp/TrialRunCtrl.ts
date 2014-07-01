/// <reference path="wxApp.ts" />

module wxApp{
    export class TrialRunCtrl {
        constructor(ctrlName:string) {

            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$location', '$http', this.init]);
        }

        private init = ($scope, $location, $http, $filter) => {
            this.user_openid = $location.search().user;
            this.$http = $http;
            this.$scope = $scope;

            $scope.url = $location.url();
        }

        private user_openid:string;
        private $http:any;
        private $scope:any;
    }
}