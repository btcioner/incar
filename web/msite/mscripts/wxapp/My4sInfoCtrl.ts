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
            this.countPageClick("1","8",this.user_openid);//原文点击记录
            $scope.model = this;
        };

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