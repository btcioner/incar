/**
 * Created by liz on 14-03-29.
 */

// use ng-view for redirct load different page
angular.module("SCustomerApp", [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
]).config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.
        when('/main', {
            controller: 's_statisticsCtrl',
            templateUrl: '/4sStore/partials/customer_main.html'//主页显示统计信息
        })
        .when('/collapseGOne',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//显示全部保养信息
        })
        .when('/collapseGTwo',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//显示全部维修信息
         })
        .when('/collapseGThree',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//显示全部维修信息
        })
        .when('/collapseGFour',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//显示全部维修信息
        })
        .when('/collapseGFive',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//显示全部维修信息
        })
        .when('/collapseGSix',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//显示全部维修信息
        })
        .when('/collapseGServen',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//显示全部维修信息
        })
        .when('/collapseGEight',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//显示全部维修信息
        })
        .otherwise({
           redirectTo:'/main'//跳转到预约服务的主界面
        });
       // $locationProvider.html5Mode(true);
}).controller("customerCtrl",function($scope){
        $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
//        $scope.randomTime  = new Date();
//        $scope.changeTime = function()
//        {
//            $scope.randomTime  = new Date();
//        }
    });

function s_statisticsCtrl($scope,$http)
{
    $scope.countDiv = true;
    $http.get(baseurl+'cmpx/carowner?page=1&pagesize=1&org_id='+ $.cookie("s4_id")).success(function(data){
        $scope.carOwnerCount = data.totalCount;
    })

}
