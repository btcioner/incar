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
        .when('/collapseGOne/:id', {
            controller: 's_specialStationCtrl',
            templateUrl: '/4sStore/partials/activity_main.html'//特价工位
        })
        .when('/collapseGTwo',{
            controller:'s_activityCtrl',
            templateUrl:'/4sStore/partials/activity_promoteInfo.html'//活动资讯
        })
        .when('/saveFuelMatch',{
            controller:'s_fuelMatchCtrl',
            templateUrl:'/4sStore/partials/activity_saveFuelMatch.html'//红包
        })
        .when('/saveFuelMatch',{
            controller:'s_fuelMatchCtrl',
            templateUrl:'/4sStore/partials/activity_saveFuelMatch.html'//红包
         })
        .when('/lotteryTicket',{
            controller:'s_activityCtrl',
            templateUrl:'/4sStore/partials/activity_lotteryTicket.html'//彩票
        })
        .otherwise({
             controller: 's_statisticsCtrl',
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
        $scope.changeLeftbar = function(id)
        {
            for(var i=1;i<5;i++)
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
      $http.get(baseurl+'organization/'+ $.cookie("s4_id")+'/promotionslot?status=2&t='+$scope.randomTime)
          .success(function(data){
              $scope.slotsCount = data.totalCount;
          }).error(function(data){
              alert("请求无响应!");
          })
     $http.get(baseurl +"4s/"+$.cookie("s4_id")+"/template/1/activity?status=2&t="+$scope.randomTime)
          .success(function(data){
              $scope.saveFuelCount = data.totalCount;
            }).error(function(data){
                alert("请求无响应!");
            })
}
