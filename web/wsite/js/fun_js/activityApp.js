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
        when('/collapseGOne', {
            controller: 's_specialStationCtrl',
            templateUrl: '/4sStore/partials/activity_main.html'//特价工位
        })
        .when('/collapseGTwo/:id',{
            controller:'s_activityCtrl',
            templateUrl:'/4sStore/partials/activity_promoteInfo.html'//活动资讯
        })
        .when('/saveFuelMatch/:id',{
            controller:'s_fuelMatchCtrl',
            templateUrl:'/4sStore/partials/activity_saveFuelMatch.html'//红包
         })
        .when('/lotteryTicket',{
            controller:'s_activityCtrl',
            templateUrl:'/4sStore/partials/activity_lotteryTicket.html'//彩票
        })
        .otherwise({
             controller: 'test',
             templateUrl: '/4sStore/partials/activity_index.html'//首页
        });
  //  $locationProvider.html5Mode(true);
}).controller("mainCtrl",function($scope){
        if($.cookie("nick") != "" && $.cookie("nick") != null)
        {
            $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
        }else{
            alert("登录已超时！");
            window.location="../login.html";
        }
        $scope.randomTime = new Date();
        $scope.changeTime = function()
        {
            $scope.randomTime = new Date();
        }
  });

