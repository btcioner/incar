/// <reference path="wxApp.ts" />

module wxApp{

    export class MyBookingCtrl{
        constructor(ctrlName:string){
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$location', this.init]);
        }

        private init = ($scope, $location) => {
            this.tag = $location.url();

            $scope.model = this;
        };

        private tag : string;
    }
}