/// <reference path="wxApp.ts" />
module wxApp {
    export class ActiveDetailCtrl {
        constructor(ctrlName:string) {
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$location', '$http', '$sce', this.init]);
        }

        private init = ($scope, $location, $http, $sce) => {
            this.user_openid = $location.search().user;
            this.act_id = $location.search().id;
            this.$http = $http;
            this.$sce = $sce;
            this.$scope = $scope;
            this.searchActivity();
            $scope.model = this;
        };

        private searchActivity = ()=> {
            this.$http.post("/mservice/getActivityDetail", { user: this.user_openid, id: this.act_id }, { dataType: "json"})
                .success((data, status, headers, config)=> {
                    data.brief = this.$sce.trustAsHtml(data.brief);
                    this.act = data;

                })
                .error((data, status, headers, config)=> {
                    alert("没有找到相关信息\n或此活动已取消！");
                });
        };

        private join = ()=>{
            this.$http.post("/mservice/applyActivity", {user:this.user_openid, id:this.act_id, tags:this.act.tags})
                .success((data, status, headers, config)=> {
                    if(data.re == 1){
                        alert("报名成功！");
                        window.location.href = "/msite/myActivity.html?user="+this.user_openid;
                    }
                    else{
                        alert("报名失败\n你已经报名或不符报名条件！");
                    }
                })
                .error((data, status, headers, config)=> { console.log(status); });
        };

        private user_openid:string;
        private act_id:string;
        private act:any;
        private $http:any;
        private $sce:any;
        private $scope:any;
    }
}