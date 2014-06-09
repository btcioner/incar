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
        when('/collapseG_1',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//车系
        })
        .when('/collapseG_2',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用途
        })
        .when('/collapseG_2/:id',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用途
        })
        .when('/collapseG_3',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用车频率
        })
        .when('/collapseG_4',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//驾驶偏好
        })
        .when('/collapseG_5',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//车龄
        })
        .when('/collapseG_6',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//渠道
        })
        .when('/collapseG_7',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用车时段
        })
        .when('/collapseG_8',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//自定义标签
        })
        .when('/collapseG_X',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//自定义标签
        })
        .when('/collapseG_X/:id',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//自定义标签
        })
        .otherwise({
            controller: 's_statisticsCtrl',
            templateUrl: '/4sStore/partials/customer_main.html'//主页显示统计
        });
       // $locationProvider.html5Mode(true);
}).controller("customerCtrl",function($scope,$http){
        $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
        //获取所有客户标签接口
        getAllTags();
        function getAllTags()
        {
            $http.get("/tag/tagListSystem/8").success(function(data){
                $scope.tagsGroup = data;
                for(var i=0;i<$scope.tagsGroup.length;i++)
                {
                    $scope.tagsGroup[i].link = "#collapseG_"+ $scope.tagsGroup[i].groupId;
                    $scope.tagsGroup[i].fid = "collapseG_"+ $scope.tagsGroup[i].groupId;
                    for(var j=0;j<$scope.tagsGroup[i].tags.length;j++)
                    {
                        $scope.tagsGroup[i].tags[j].tagFlag = "";
                    }
                }
            }).error(function(data){
                    alert("请求无响应");
                });
               //获取自定义标签
                $http.get('/tag/tagListCustom/').success(function(data){
                    $scope.customTags = data[0].tags;
                }).error(function(data){
                        alert("请求无响应");
                })
        }
    });

function s_statisticsCtrl($scope,$http)
{
    $scope.countDiv = true;
    $http.get(baseurl+'cmpx/carowner?page=1&pagesize=1&org_id='+ $.cookie("s4_id")).success(function(data){
        $scope.carOwnerCount = data.totalCount;
    })
}
