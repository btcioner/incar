/// <reference path="wxApp.ts" />

declare var hex_sha1:(raw:string)=>string;
declare var WeixinJSBridge:any;

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
                this.InitCarBrand();
                this.searchUser();
            }
            else{
                // 尚未得到open_id
                var wxoa = new WXOAuth($location);
                wxoa.findUserOpenId((data)=>{
                    if(!data.openid) alert(data);
                    // 已经获取了open_id,查询数据
                    this.user_openid = data.openid;
                    this.app_id = data.app_id;
                    // 初始化车品牌
                    this.InitCarBrand();
                    this.searchUser();
                });
            }

            $scope.model = this;
        };

        private InitCarBrand = ()=>{
            this.$http.post('/mservice/brandData', { user: this.user_openid })
                .success((data, status, headers, config)=>{
                    this.brand_name = data.brand;
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
                    this.userCfg = data;
                    
                    // age
                    for(var i=0;i<this.ages.length;i++){
                        if(data.age === this.ages[i]) this.age = this.ages[i];
                    }

                    // 发动机类型
                    if(data.engine_type === 'T') this.eng_type = '涡轮增压';
                    else this.eng_type = '自然吸气';

                    console.log(data);
                })
                .error((data, status, headers, config)=>{
                    console.log(status);
                    alert("您还未注册或未绑定OBD信息\n请先注册账号！");
                    window.location.href ="/msite/enroll.html?user="+this.user_openid+"&appid="+this.app_id;
                });
        };

        private update = ()=>{
            var postData:any = {
                user: this.user_openid + '@' + this.userCfg.wx_oid.split(':')[1],
                name: this.userCfg.name,
                nick: this.userCfg.nick,
                obd_code: this.userCfg.obd_code,
                brand: this.brand_name,
                modelYear: this.userCfg.modelYear,
                phone:this.userCfg.phone,
                license:this.userCfg.license,
                mileage: this.userCfg.mileage,
                disp: this.userCfg.disp
            };
            // check pwd
            if(this.pwd || this.pwd2) {
                if (this.pwd !== this.pwd2){
                    alert('密码不一致');
                    return;
                }
                else{
                    postData.password = hex_sha1(this.pwd);
                }
            }

            // age
            for(var i=0;i<this.ages.length;i++){
                if(this.age === this.ages[i]){
                    postData.age = i;
                }
            }

            // engine_type
            if(this.eng_type === '涡轮增压') postData.engine_type = 'T';
            else postData.engine_type = 'N';

            // series
            if(this.mySeries){
                postData.series = this.mySeries.series;
            }

            console.log(postData);

            /*this.$http.post('/mservice/enroll', postData)
                .success((data, status, headers, config)=>{
                    alert('修改成功');
                    if(WeixinJSBridge){
                        WeixinJSBridge.call('closeWindow');
                    }
                })
                .error((data, status, headers, config)=>{
                    alert("修改失败\n请检查OBD Id是否正确");
                });*/
        };

        private user_openid:string;
        private app_id:string;
        private brand:number;
        private seriesData:Array<any> = [{ series:-1, series_name:'请选择'}];
        private mySeries:any;
        private brand_name:string;
        private userCfg:any;
        private eng_types = [ '自然吸气', '涡轮增压' ];
        private eng_type = '涡轮增压';
        private ages = ['1年以下','1-2年','2-3年','3-4年','4-5年','大于5年'];
        private age = '1-2年';
        private pwd:string;
        private pwd2:string;
        private $http: any;
    }
}