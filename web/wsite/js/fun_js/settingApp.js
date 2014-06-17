/**
 * Created by liz on 14-03-29.
 */

// use ng-view for redirct load different page
angular.module("SSystemApp", [
    'ngResource',
    'ngSanitize',
    'ngRoute'
    ]).config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.
        when('/collapseGOne', {
            controller: 's_systemCtrl',
            templateUrl: '/4sStore/partials/setting_main.html'//特价工位
        })
        .otherwise({
           redirectTo:'/collapseGOne'//跳转到设备管理
        });
      //  $locationProvider.html5Mode(true);

}).controller("adminCtrl",function($scope){
        if($.cookie("nick") != "" && $.cookie("nick") != null)
        {
            $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
        }else{
            alert("登录已超时！");
            window.location="../login.html";
        }
         $scope.randomTime  = new Date();
         $scope.changeTime = function()
         {
             $scope.randomTime  = new Date();
         }
});
