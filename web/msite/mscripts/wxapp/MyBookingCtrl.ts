/// <reference path="wxApp.ts" />

module wxApp{

    export class MyBookingCtrl{
        constructor(ctrlName:string){
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$location', '$http', this.init]);

            // 注册filter
            _module.filter('trial_status_name', ()=>{
                return (input)=>{
                    var status_name = "无效";
                    if (input == 1) status_name = "待确认";
                    else if (input == 2) status_name = "被拒绝";
                    else if (input == 3) status_name = "已批准";
                    else if (input == 4) status_name = "已取消";
                    else if (input == 5) status_name = "已完成";
                    else if (input == 6) status_name = "未到店";
                    return status_name;
                };
            });

            _module.filter('trial_status_op', ()=>{
                return (input)=>{
                    if(input == 1 || input == 3) return "取消";
                    else return "";
                };
            });
        }

        private init = ($scope, $location, $http) => {
            this.$http = $http;
            this.user_openid = $location.search().user;
            if(this.user_openid) {
                // 已经获取了open_id, 查询数据
                this.searchUser($http, $scope);
            }
            else{
                // 尚未得到open_id
                var wxoa = new WXOAuth($location);
                wxoa.findUserOpenId((data)=>{
                    if(!data.user_openid) this.openUpbox(data);
                    // 已经获取了open_id,查询数据
                    this.user_openid = data.user_openid;
                    this.searchUser($http, $scope);
                });
            }
            this.countPageClick("1","11",this.user_openid);//原文点击记录
            $scope.model = this;

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
                    alert(data.status);
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

        private searchUser = ($http, $scope) => {
            $http.post("/mservice/infoConfig", { user:this.user_openid }, {dataType:"json"})
                .success((data,status, headers, config)=>{
                    this.wx_oid = data.wx_oid;
                    this.car_license = data.license;
                    this.searchTrialrun($http);
                    this.searchBook($http);
                })
                .error((data, status, headers, config)=>{ console.log(status); });
        };

        //获取试驾预约数据
        private searchTrialrun = ($http) => {
            $http.post("/mservice/myTrialrun", { user: this.user_openid, wx_oid: this.wx_oid}, { dataType: "json"})
                .success((data, status, headers, config)=>{
                    for(var i=0;i<data.length;i++){
                        data[i].work_type = "试驾";
                        this.my_works.push(data[i]);
                    }
                    this.qry_returned++;
                })
                .error((data, status, headers, config)=>{ console.log(status); });
        };

        // 获取保养预约数据
        private searchBook = ($http) =>{
            var sid = this.wx_oid.split(":");
            $http.post("/mservice/myBooking", { user: this.user_openid, sid: sid[1]}, { dataType:"json"})
                .success((data, status, headers, config)=>{
                    for(var i=0;i<data.length;i++){
                        data[i].work_type = "保养";
                        data[i].seriesName = data[i].license;
                        this.my_works.push(data[i]);
                    }
                    this.qry_returned++;
                })
                .error((data, status, headers, config)=>{ console.log(status); });
        };

        // cancel operator
        private cancel = (data:any) =>{
            if(data.bookingStatus == 1 || data.bookingStatus == 3) {
                if (data.work_type === "保养") this.cancelBook(data);
                else if (data.work_type === "试驾") this.cancelTrialrun(data);
            }
        };

        //取消试驾预约
        private cancelTrialrun = (data) => {
            var con = confirm("您确定要取消这个试驾预约吗？");
            if (con) {
                this.$http.post("/mservice/cancelTrialrun", { id: data.id }, { dataType: "json"})
                    .success(()=>{
                        this.openUpbox("预约已取消");
                        data.bookingStatus = 4;
                    })
                    .error(()=>{
                        this.openUpbox("预约已取消");
                        data.bookingStatus = 4;
                    });
            }
        };

        private cancelBook = (data) => {
            var con = confirm("您确定要取消这个保养预约吗？");
            if (con) {
                this.$http.post("/mservice/cancelSlotBooking", { id: data.id }, { dataType: "json"})
                    .success(()=>{
                        this.openUpbox("预约已取消");
                        data.bookingStatus = 4;
                    })
                    .error(()=>{
                        this.openUpbox("预约已取消");
                        data.bookingStatus = 4;
                    });
            }
        };

        private user_openid:string;
        private wx_oid:string;
        private car_license:string;
        private qry_returned = 0;
        private my_works = [];
        private $http: any;
        private cover_show=false;
        private upbox_show = false;
        private tips:string;
    }
}