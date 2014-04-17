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
            controller: '',
            templateUrl: '/4sStore/partials/customer_main.html'//主页显示统计信息
        })
        .when('/collapseGOne',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_all.html'//显示全部保养信息
        })
        .when('/collapseGTwo',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_weixin.html'//显示全部维修信息
         })
        .when('/collapseGThree',{
            controller:'',
            templateUrl:'/4sStore/partials/customer_app.html'//显示全部维修信息
        })
        .otherwise({
           redirectTo:'/main'//跳转到预约服务的主界面
        });
       // $locationProvider.html5Mode(true);
}).controller("customerCtrl",function($scope){
        $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
    });
