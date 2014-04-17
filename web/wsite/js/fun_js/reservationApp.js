/**
 * Created by liz on 14-03-29.
 */

// use ng-view for redirct load different page

angular.module("SReservationApp", [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
]).config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.
        when('/main', {
            controller: 's_reservationCtrl',
            templateUrl: '/4sStore/partials/reservation_info.html'//主页显示统计信息
        })
        .when('/collapseGOne',{
            controller:'s_reservationCtrl',
            templateUrl:'/4sStore/partials/reservation_main.html'//显示全部保养信息
        })
        .when('/collapseGTwo',{
            controller:'s_repairCtrl',
            templateUrl:'/4sStore/partials/repair_main.html'//显示全部维修信息
         })
        .otherwise({
           redirectTo:'/main'//跳转到预约服务的主界面
        });
       // $locationProvider.html5Mode(true);
});
