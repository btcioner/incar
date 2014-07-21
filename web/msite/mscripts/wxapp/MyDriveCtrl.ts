/// <reference path="wxApp.ts" />

declare var shareToFriend:any;
declare var shareToWeibo:any;
declare var shareTo:any;
declare var dochart:any;

module wxApp {
    export class MyDriveCtrl {
        constructor(ctrlName:string) {

            // 向angular注册控制器
            _module.controller(ctrlName, ['$scope', '$location', '$http', '$filter', this.init]);

            // 注册filter
            _module.filter('l_per_100km', ()=>{
                return (input)=>{
                    // 原单位为 升/万千米
                    return input / 100;
                };
            });

            _module.filter('km', ()=>{
                return (input)=>{
                    // 原单位为 米
                    return input / 1000;
                };
            });

            _module.filter('l', ()=>{
                return (input)=>{
                    // 原单位为 千万分之一升
                    return input / 10000000;
                };
            });

            _module.filter('kg', ()=>{
                return (input)=>{
                    // 原单位为 十万分之一千克
                    return input / 100000;
                };
            });
        }

        private init = ($scope, $location, $http, $filter) => {

            this.user_openid = $location.search().user;
            this.$http = $http;
            this.$filter = $filter;
            this.$scope = $scope;

            // init date

            var tmNow = new Date();
            this.tmEnd = $filter('date')(tmNow, 'yyyy-MM-dd');
            tmNow.setDate(1);
            this.tmStart = $filter('date')(tmNow, 'yyyy-MM-dd');

            this.ShareLinks();
            this.fetchData();

            $scope.model = this;
        };

        private fetchData = ()=>{
            var tmStart = Date.parse(this.tmStart) - 1000*3600*8;
            var tmEnd = Date.parse(this.tmEnd) + 1000*3600*(24-8);

            var postData = {
                user:  this.user_openid,
                start: this.$filter('date')(tmStart, 'yyyy-MM-dd HH:mm:ss'),
                end:  this.$filter('date')(tmEnd, 'yyyy-MM-dd HH:mm:ss')
            };
            this.$http.post('/mservice/myDriveData', postData)
                .success((data, status, headers, config)=>{
                    this.driveData = data;
                    dochart(data);
                })
                .error((data, status, headers, config)=>{ console.log(status); });
        };

        private onDateChanged = ()=>{
            var tmStart = Date.parse(this.tmStart);
            var tmEnd = Date.parse(this.tmEnd);
            if(tmStart <= tmEnd){
                this.driveData = null;
                this.ShareLinks();
                this.fetchData();
            }
        };

        private ShareLinks = ()=>{
            try {
                //修改分享链接
                shareToFriend();
                shareToWeibo();
                shareTo();
            }
            catch(ex){
                console.log(ex);
            }
        };

        private user_openid:string;
        private tmStart:string;
        private tmEnd:string;
        private driveData:any;
        private $http:any;
        private $scope:any;
        private $filter:any;
    }
}