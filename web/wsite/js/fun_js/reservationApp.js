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
            controller: 's_statisticsCtrl',
            templateUrl: '/4sStore/partials/reservation_info.html'//主页显示统计信息
        })
        .when('/collapseGOne/:id',{
            controller:'s_reservationCtrl',
            templateUrl:'/4sStore/partials/reservation_main.html'//显示全部保养信息
        })
        .when('/collapseGOne',{
            controller:'s_reservationCtrl',
            templateUrl:'/4sStore/partials/reservation_main.html'//显示全部保养信息
        })
        .when('/collapseGTwo/:id',{
            controller:'s_repairCtrl',
            templateUrl:'/4sStore/partials/repair_main.html'//显示全部维修信息
         })
        .when('/collapseGTwo',{
            controller:'s_repairCtrl',
            templateUrl:'/4sStore/partials/repair_main.html'//显示全部保养信息
        })
        .otherwise({
            redirectTo:'/main'//跳转到预约服务的主界面
        });
       // $locationProvider.html5Mode(true);
}).controller("mainCtrl",function($scope){
        if($.cookie("nick") != "" && $.cookie("nick") != null)
        {
            $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
        }else{
            alert("登录已超时！");
            window.location="../login.html";
        }
        $scope.changeLeftbar = function(id)
        {
            for(var i=1;i<3;i++)
            {
                if(i==id)
                {
                    $("#div_"+i).removeClass().addClass("accordion-heading sidebar_a");
                }
                else{
                    $("#div_"+i).removeClass().addClass("accordion-heading sidebar_b");
                }
            }
        }
    });

function s_statisticsCtrl($scope,$http)
{
    $scope.randomTime = new Date();
     $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/work/care?step=applied&t='+$scope.randomTime).success(function(data){
        $scope.applyCount = data.totalCount;
    })
    $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/work/care?step=approved&t='+$scope.randomTime).success(function(data){
        $scope.approveCount = data.totalCount;
    })
    $http.get(baseurl+'4s/'+$.cookie("s4_id")+'/drivetry?step=applied&t='+$scope.randomTime).success(function(data){
        $scope.drivetryCount = data.totalCount;
    })
}
