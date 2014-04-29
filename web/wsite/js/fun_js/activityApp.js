/**
 * Created by liz on 14-03-29.
 */

// use ng-view for redirct load different page

angular.module("SActivityApp", [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
]).config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.
        when('/main', {
            controller: 's_specialStationCtrl',
            templateUrl: '/4sStore/partials/activity_main.html'//特价工位
        })
        .when('/promoteInfo',{
            controller:'s_activityCtrl',
            templateUrl:'/4sStore/partials/activity_promoteInfo.html'//促销信息
        })
        .when('/redPackage',{
            controller:'s_activityCtrl',
            templateUrl:'/4sStore/partials/activity_redPackage.html'//红包
         })
        .when('/lotteryTicket',{
            controller:'s_activityCtrl',
            templateUrl:'/4sStore/partials/activity_lotteryTicket.html'//彩票
        })
        .otherwise({
           redirectTo:'/main'//跳转到预约服务的主界面
        });
  //  $locationProvider.html5Mode(true);
}).controller("mainCtrl",function($scope){
        $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
   });
