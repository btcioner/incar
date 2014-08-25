/// <reference path="wxApp.ts" />

declare var hex_sha1:(raw:string)=>string;

module wxApp {
    export class InfoConfigCtrl {
        constructor(ctrlName:string) {
            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$location', '$http', this.init]);
        }

        private init = ($scope, $location, $http) => {
            this.$http = $http;
            this.user_openid = $location.search().user;
            if(this.user_openid) { // 已经获取了open_id, 查询数据
                // 初始化车品牌
                this.userCfg = {name:"",nick:"",obd_code:"",modelYear:"",phone:"",license:"",mileage:"",disp:"",id:""}
                this.InitCarBrand();
                this.searchUser();
            }
            else{
                // 尚未得到open_id
                var wxoa = new WXOAuth($location);
                wxoa.findUserOpenId((data)=>{
                    if(!data.user_openid) this.openUpbox(data);
                    // 已经获取了open_id,查询数据
                    this.user_openid = data.user_openid;
                    // 初始化车品牌
                    this.InitCarBrand();
                    this.searchUser();
                });
            }
            this.countPageClick("1","12",this.user_openid); //原文点击记录
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
                    this.openUpbox(data.status);
                });
        };

        private InitCarBrand = ()=>{
            this.$http.post('/mservice/brandData', { user: this.user_openid })
                .success((data, status, headers, config)=>{
                    this.brand_name = data.brand;
                    this.brand_code = data.brandCode;
                    this.brand = data.brandCode;
                    data.seriesData.forEach((s:any)=>{
                        this.seriesData.push({ series: s.seriesCode, series_name: s.series });
                    });
                })
                .error((data, status, headers, config)=>{
                    console.log(status);
                });
        };

        private searchUser = ()=>{
            this.$http.post('/mservice/infoConfig', {user:this.user_openid})
                .success((data, status, headers, config)=>{

//                    this.name_sta = true;
                    this.printWord = "修改成功!";
                    this.flag = "update";
                    this.userCfg = data;
                    if(data.mileage)
                    {
                        this.mileage =parseInt(data.mileage.toString());
                    }
                    if(data.mileage && data.obd_mileage)
                    {
                        this.mileage =parseInt(data.mileage.toString()) + parseInt(data.obd_mileage.toString());
                    }
                    if(data.series ==="")
                    {
                        this.mySeries =-1;
                    }else{
                       this.mySeries = data.series;
                    }
                    var temp = this.user_openid.split("@");
                    if(this.userCfg.name === "wx_"+temp[0])
                    {
                        this.userCfg.name ="";
                    }
                    if(this.userCfg.nick==="微信匿名用户")
                    {
                        this.userCfg.nick ="";
                    }
                    // age
                    if(data.age==="")
                    {
                        this.age ="请选择";
                    }else{
                        var ageDate=new Date();
                         data.age = ageDate.getFullYear() - data.age.substring(0,4);
                        for(var i=0;i<this.ages.length;i++){
                            if(data.age === i)
                                this.age = this.ages[i+1];
                        }
                    }
                    // 发动机类型
                    if(data.engine_type ===""){
                        this.eng_type = '请选择';
                    }
                    else
                    {
                        if(data.engine_type === 'T') this.eng_type = '涡轮增压';
                        else this.eng_type = '自然吸气';
                    }
                    console.log(data);
                })
                .error((data, status, headers, config)=>{
//                    console.log(status);
                    this.openUpbox("网络好像断了，请检查网络连接！");
//                    this.name_sta = false;
                    this.printWord ="创建成功!";
                    this.flag = "add";
                    this.userCfg = {name:"",nick:"",obd_code:"",modelYear:"",phone:"",license:"",mileage:"",disp:"",id:""};
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
        private update = ()=>{
            var postData:any = {
                user: this.user_openid,
                name: this.userCfg.name,
                nick: this.userCfg.nick,
                obd_code: this.userCfg.obd_code,
                brand: this.brand_code,
                modelYear: this.userCfg.modelYear,
                phone:this.userCfg.phone,
                license:this.userCfg.license,
                disp: this.userCfg.disp,
                flag:this.flag,
                id:this.userCfg.id
            };

            //判断所有的数据不为空和为有效数据
            if (postData.name == "") {
                this.openUpbox('用户名不能为空!');
                return;
            }

            if (postData.obd_code == "") {
                this.openUpbox('车云终端ID不能为空!');
                return;
            }
            // check pwd
            if(this.flag =="update")
            {
                if(this.pwd || this.pwd2) {
                    if (this.pwd !== this.pwd2){
                        this.openUpbox('密码不一致');
                        return;
                    }
                    else{
                        postData.password = hex_sha1(this.pwd);
                    }
                }
            }
            else
            {
                if(this.pwd || this.pwd2) {
                    if (this.pwd !== this.pwd2){
                        this.openUpbox('密码不一致');
                        return;
                    }
                    else{
                        postData.password = hex_sha1(this.pwd);
                    }
                }else {
                    this.openUpbox('密码不能为空!');
                    return;
                }
            }
            if (postData.nick == "") {
                this.openUpbox('车主姓名不能为空!');
                return;
            }
            if (postData.phone == "") {
                this.openUpbox('联系电话不能为空!');
                return;
            }
            if (postData.license == "") {
                this.openUpbox('车牌号不能为空!');
                return;
            }
            if (postData.modelYear == "") {
                this.openUpbox('年款不能为空!');
                return;
            }
            // series
            if(this.mySeries != -1){
                postData.series = this.mySeries;
            }else
            {
                this.openUpbox("系列不能为空!");
                return;
            }
             postData.mileage = this.mileage;
            if (postData.mileage == "" || postData.mileage ==0) {
                this.openUpbox('行驶总里程不能为空!');
                return;
            }
            else{
                if(this.userCfg.obd_mileage)
                {
                    postData.mileage = parseInt(this.mileage.toString()) - parseInt(this.userCfg.obd_mileage.toString())
                }
                else{
                    postData.mileage = parseInt(this.mileage.toString());
                }
            }
            if (postData.disp == "") {
                this.openUpbox('排气量不能为空!');
                return;
            }

            // age
            if(this.age==="请选择")
            {
                this.openUpbox("请选择车龄!");
                return;
            }else{
                for(var i=1;i<this.ages.length+1;i++){
                    if(this.age === this.ages[i]){
                        postData.age = i-1;
                    }
                }
            }

            // engine_type
            if(this.eng_type ==="请选择")
            {
                this.openUpbox("请选择发动机类型!");
                return;
            }else{
                if(this.eng_type === '涡轮增压') postData.engine_type = 'T';
                else postData.engine_type = 'L';
            }

            this.$http.post('/mservice/enroll', postData)
                .success((data, status, headers, config)=>{
                    if(data.status == "success")
                    {
                        this.openUpbox(this.printWord);
                        setInterval(function(){
                         if(typeof WeixinJSBridge !== "undefined"){
                            WeixinJSBridge.call('closeWindow');
                         }
                        },1500);
                    }
                    else
                    {
                        this.openUpbox(data.status);
//                        if(this.flag =="update")
//                        {
//                           this.searchUser();
//                        }
                    }
                })
                .error((data, status, headers, config)=>{
                    this.openUpbox("网络好像断了，请检查网络连接！");
                });
        };

        private user_openid:string;
        private brand:number;
        private seriesData:Array<any> = [{ series:-1, series_name:'请选择'}];
        private mySeries:any;
        private brand_name:string;
        private userCfg:any;
        private eng_types = ['请选择', '自然吸气', '涡轮增压' ];
        private eng_type = '请选择';
        private ages = ['请选择','1年以下','1-2年','2-3年','3-4年','4-5年','大于5年'];
        private age = '请选择';
        private mileage = 0;
        private pwd:string;
        private pwd2:string;
        private $http: any;
//        private name_sta:boolean;
        private printWord:any;
        private brand_code:any;
        private flag:any;
        private cover_show=false;
        private upbox_show = false;
        private tips:string;
    }
}