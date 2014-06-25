/**
 * Created by liz on 14-03-29.
 */

// use ng-view for redirct load different page
angular.module("AdminApp", [
    'ngResource',
    'ngSanitize',
    'ngRoute'
    ]).config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.
        when('/main', {
            controller: 'deviceCtrl',
            templateUrl: '/admin/partials/deviceManage.html'//设备管理
        })
        .when('/driveData',{
            controller:'driveDataCtrl',
            templateUrl:'/admin/partials/driveData.html'//行车数据
        })
        .when('/customer4s',{
            controller:'customerCtrl',
            templateUrl:'/admin/partials/customer4s.html'//4s店客户
         })
        .when('/carOwners',{
            controller:'carOwnersCtrl',
            templateUrl:'/admin/partials/carOwners.html'//车主
        })
        .when('/userManage',{
            controller:'userManageCtrl',
            templateUrl:'/admin/partials/userManage.html'//系统用户
        })
        .when('/knowledgeBase',{
            controller:'knowledgeBaseCtrl',
            templateUrl:'/admin/partials/knowledgeBase.html'//行车手册
        })
        .when('/paramSetting',{
            controller:'s_paramCtrl',
            templateUrl:'/admin/partials/paramSetting.html'//行车手册
        })
        .otherwise({
           redirectTo:'/main'//跳转到设备管理
        });
      //  $locationProvider.html5Mode(true);

}).controller("adminCtrl",function($scope,$http){

     $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
     //动态改变被激活菜单
     $scope.active = function(ac_id)
     {
        for(var i=1;i<8;i++)
        {
            $("#li_active_"+i).removeClass();
            if(i==ac_id)
            {
                $("#li_active_"+i).addClass("menu_hl");
            }
        }
     }

        //注销
        $scope.logout = function()
        {
            if(confirm("是否确定要注销?"))
            {
                $http.get(baseurl+"logout").success(function(data){
                    if(data.status == "ok")
                    {
                        window.location="../login.html";
                    }
                }).error(function(data){
                        alert("请求无响应!");
                    })
            }
        }
});
