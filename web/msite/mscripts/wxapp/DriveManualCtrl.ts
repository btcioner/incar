/// <reference path="wxApp.ts" />

module wxApp {
    // 行车手册页面控制器
    export class DriveManualCtrl {
        constructor(ctrlName:string) {
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$resource', '$http','$location',this.init])
        }

        private init = ($scope, $resource,$http,$location) => {
            this.$http = $http;
            this.user_openid = $location.search().user;

            $scope.model = this;
            // 登记服务
            this.srvManual = $resource("/wservice/manual");

            this.countPageClick("1","3",this.user_openid); //原文点击记录

            // 微信分享
            var wxs = new WXShare();
            var base = window.location.href.match(/\w+:\/\/[^\/]+/);
            var pic = $("meta[name=wx-share-pic]").attr("content");
            wxs.wxShare($("title").text(), window.location.href, base+pic, "");
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

        public search2 = ($event) => {
            if ($event.keyCode === 13) this.search();
        };

        public search = () => {
            this.tip = "正在搜索: " + this.keyword + "...";
            this.searchResult.length = 0;
            var result = this.srvManual.get({keyword: this.keyword, page: 1, pagesize: 10}, ()=> {
                // fetch the result
                if (result.status === "ok") {
                    angular.forEach(result.manual, (obj)=> {
                        obj.img_url = obj.filename;
                        obj.filename = undefined;
                        this.searchResult.push(obj);
                    });
                    if (this.searchResult.length > 0) this.tip = null;
                    else this.tip = "没有找到相关的信息,请尝试其它关键字";
                }
                else {
                    this.tip = result.status;
                }
            });
        };

        private srvManual:any;
        public keyword = "备胎";
        public tip = "点击搜索查询相关内容,比如'备胎'";
        private searchResult:Array<ManualItem> = [];
        private user_openid:string;
        private $http: any;
        private cover_show=false;
        private upbox_show = false;
        private tips:string;
    }

    class ManualItem {
        public id:number;
        public keyword:string;
        public img_url:string;
        public title:string;
        public description:string;
    }
}