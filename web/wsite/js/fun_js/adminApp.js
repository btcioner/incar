/**
 * Created by liz on 14-03-29.
 */

// use ng-view for redirct load different page
var app = angular.module("AdminApp", [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
])
app.config(function ($routeProvider, $locationProvider, $httpProvider) {
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
        .otherwise({
           redirectTo:'/main'//跳转到设备管理
        });
       // $locationProvider.html5Mode(true);

})
app.controller("adminCtrl",function($scope){
     $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
});
