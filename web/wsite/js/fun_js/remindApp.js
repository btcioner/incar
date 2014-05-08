/**
 * Created by liz on 14-03-29.
 */

// use ng-view for redirct load different page
angular.module("SMaintainApp", [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
]).config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.
        when('/main', {
            controller: 's_statisticsCtrl',
            templateUrl: '/4sStore/partials/remind_main.html'//主页显示统计信息
        })
        .when('/collapseGOne',{
            controller:'s_maintainCtrl',
            templateUrl:'/4sStore/partials/remind_maintain.html'//显示全部保养信息
        })
        .when('/collapseGOne/:id',{
            controller:'s_maintainCtrl',
            templateUrl:'/4sStore/partials/remind_maintain.html'//显示全部保养信息
        })
        .when('/collapseGTwo',{
            controller:'',
            templateUrl:'/4sStore/partials/remind_fault.html'//显示全部维修信息
         })
        .when('/collapseGThree',{
            controller:'',
            templateUrl:'/4sStore/partials/remind_safety.html'//显示全部维修信息
        })
        .otherwise({
           redirectTo:'/main'//跳转到预约服务的主界面
        });
       // $locationProvider.html5Mode(true);
}).controller("mainCtrl",function($scope){
        $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
    });

function s_statisticsCtrl($scope,$http)
{
    $http.get(baseurl+'organization/'+$.cookie("org_id")+'/care?page=1&pagesize=1').success(function(data){
        $scope.careCount = data.totalCount;
    })
}
