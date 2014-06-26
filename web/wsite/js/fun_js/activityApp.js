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
