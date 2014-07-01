/// <reference path="wxApp.ts" />
module wxApp {
    export class MyActivityCtrl{
        constructor(ctrlName:string) {
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$location', '$http', this.init]);
        }

        private init = ($scope, $location, $http) => {
            this.user_openid = $location.search().user;
            this.url = $location.url();

            $scope.model = this;
        };

        private user_openid:string;
        private url:string;
    }
}