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
            this.countPageClick("1","7",this.user_openid);//原文点击记录
            $scope.url = $location.url();
        }

        //原文点击记录--by jl 07/21/14
        private countPageClick = (countType,pageId,wx_oid)=>{
            this.$http.post('/mservice/countData', {countType:countType,pageId:pageId,wx_oid:wx_oid})
                .success((data)=>{
                    if(data.status == "ok")
                    {
                        console.log(data.status);
                    }else{
                        alert(data.status);
                    }
                })
                .error((data)=>{
                    alert(data.status);
                });
        };

        private user_openid:string;
        private $http:any;
        private $scope:any;
    }
}