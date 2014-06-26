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
            controller:'s_alarmCtrl',
            templateUrl:'/4sStore/partials/remind_alarm.html'//显示全部维修信息
         })
        .when('/collapseGTwo/:id',{
            controller:'s_alarmCtrl',
            templateUrl:'/4sStore/partials/remind_alarm.html'//显示全部维修信息
        })
        .otherwise({
           redirectTo:'/main'//跳转到预约服务的主界面
        });
       // $locationProvider.html5Mode(true);
}).controller("mainCtrl",function($scope,$http){
        if($.cookie("nick_4s") != "" && $.cookie("nick_4s") != null)
        {
            $scope.nickName = $.cookie("nick_4s");//保存登录进来用户的nick
            $scope.s4Name = $.cookie("s4_name");
        }else{
            parent.location.href="../login.html";
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

function s_statisticsCtrl($scope,$http)
{
    $scope.randomTime = new Date();
    $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/care?page=1&pagesize=1&t='+$scope.randomTime).success(function(data){
        $scope.careCount = data.totalCount;
    })
    $http.get('/alarm/'+$.cookie("s4_id")+'?status=1&t='+$scope.randomTime).success(function(data){
        $scope.alarmCount = data.rowCount;
    })
}
