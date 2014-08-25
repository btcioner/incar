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
            this.countPageClick("1","13",this.user_openid);//原文点击记录
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
                        this.openUpbox(data.status);
                    }
                })
                .error((data)=>{
                    this.openUpbox(data.status);
                });
        };

        private closeUpbox =()=>{
            this.tips = "";
            this.cover_show = false;
            this.upbox_show = false;
        }
        private openUpbox =(tips)=>{
            this.tips = tips;
            this.cover_show = true;
            this.upbox_show = true;
        }

        private searchActivity = ()=> {
            this.$http.post("/mservice/getActivityDetail", { user: this.user_openid, id: this.act_id }, { dataType: "json"})
                .success((data, status, headers, config)=> {
                    var txt = data.brief.replace(/<[^<>]+>|&nbsp;|\s+/g, "").substr(0,32);
                    data.brief = this.$sce.trustAsHtml(data.brief);
                    this.act = data;
                    if(this.act.tm_start)this.act.tm_start =  this.act.tm_start.substring(0,16);
                    if(this.act.tm_end)this.act.tm_end = this.act.tm_end.substring(0,16);
                    if(this.act.tm_announce)this.act.tm_announce =  this.act.tm_announce.substring(0,16);

                    // 微信分享
                    var wxs = new WXShare();
                    var base = window.location.href.match(/\w+:\/\/[^\/]+/);
                    var pic = data.logo_url;
                    if(pic.charAt(0) !== '/') pic = '/' + pic;
                    wxs.wxShare(data.title, window.location.href, base+pic, txt);
                })
                .error((data, status, headers, config)=> {
                    this.openUpbox("没有找到相关信息\n或此活动已取消！");
                });
        };

        private join = ()=>{
            this.$http.post("/mservice/applyActivity", {user:this.user_openid, id:this.act_id, tags:this.act.tags})
                .success((data, status, headers, config)=> {
                    if(data.re == 1){
                        this.openUpbox("报名成功！");
                        window.location.href = "/msite/myActivity.html?user="+this.user_openid;
                    }
                    else{
                        this.openUpbox("报名失败\n你已经报名或不符报名条件！");
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
        private cover_show=false;
        private upbox_show = false;
        private tips:string;

    }
}