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
        when('/collapseG_1/:id1',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//车系
        }).
        when('/collapseG/:id1',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//车系
        })
        .when('/collapseG_1/:id1/:id',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用途
        })
        .when('/collapseG_2/:id1',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用途
        })
        .when('/collapseG_2/:id1/:id',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用途
        })
        .when('/collapseG_3/:id1',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用车频率
        })
        .when('/collapseG_3/:id1/:id',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用途
        })
        .when('/collapseG_4/:id1',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//驾驶偏好
        })
        .when('/collapseG_4/:id1/:id',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用途
        })
        .when('/collapseG_5/:id1',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//车龄
        })
        .when('/collapseG_5/:id1/:id',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用途
        })
        .when('/collapseG_6/:id1',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//渠道
        })
        .when('/collapseG_6/:id1/:id',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用途
        })
        .when('/collapseG_7/:id1',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用车时段
        })
        .when('/collapseG_7/:id1/:id',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//用途
        })
        .when('/collapseG_X/:id1',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//自定义标签
        })
        .when('/collapseG_X/:id1/:id',{
            controller:'s_customerCtrl',
            templateUrl:'/4sStore/partials/customer_channel.html'//自定义标签
        })
        .otherwise({
            controller: 's_statisticsCtrl',
            templateUrl: '/4sStore/partials/customer_main.html'//主页显示统计
        });
       // $locationProvider.html5Mode(true);
}).controller("customerCtrl",function($scope,$http){
        if($.cookie("nick_4s") != "" && $.cookie("nick_4s") != null)
        {
            $scope.nickName = $.cookie("nick_4s");//保存登录进来用户的nick
            $scope.s4Name = $.cookie("s4_name");
        }else{
            parent.location.href="../login.html";
        }
        //获取所有客户标签接口
        $scope.randomTime = new Date();
        getAllTags();
        function getAllTags()
        {
            $scope.randomTime = new Date();
            $http.get("/tag/tagListSystem/"+ $.cookie("brand_id")+"?t="+$scope.randomTime).success(function(data){
                $scope.tagsGroup = data.data;
                for(var i=0;i<$scope.tagsGroup.length;i++)
                {
                    $scope.tagsGroup[i].link = "#collapseG_"+ $scope.tagsGroup[i].groupId+"/"+(i+1);
                    $scope.tagsGroup[i].fid = "collapseG_"+ $scope.tagsGroup[i].groupId;
//                    if(i==0)
//                    {
//                        $scope.tagsGroup[i].class = "accordion-heading sidebar_a";
//                    }
//                    else{
                        $scope.tagsGroup[i].class = "accordion-heading sidebar_b";
//                    }
                    $scope.tagsGroup[i].id = "div_"+i;
                    for(var j=0;j<$scope.tagsGroup[i].tags.length;j++)
                    {
                        $scope.tagsGroup[i].tags[j].tagFlag = "";
                    }
                }
            }).error(function(data){
                    alert("请求无响应");
            });
           //获取自定义标签
            $http.get('/tag/tagListCustom/'+ $.cookie("s4_id")+"?t="+$scope.randomTime).success(function(data){
                $scope.customTags = data.data;
            }).error(function(data){
                    alert("请求无响应");
            })
        }
        $scope.changeLeftbar = function(id,len,len1,groupId)
        {
            $scope.randomTime = new Date();
            for(var i=0;i<9;i++)
            {
                if(i==id)
                {
                    $("#div_"+i).removeClass().addClass("accordion-heading sidebar_a");
                }
                else{
                    $("#div_"+i).removeClass().addClass("accordion-heading sidebar_b");
                }
            }
            for(var i=1;i<len+2;i++)
            {
                $("#a_"+groupId+"_"+i).removeClass().addClass("btn btn-menu sidebar_b_s");
            }
            for(var i=1;i<len1+2;i++)
            {
                 $("#b_"+i).removeClass().addClass("btn btn-menu sidebar_b_s");
            }

        }
        $scope.changeLeftSmallBar = function(id,len,groupId)
        {
            $scope.randomTime = new Date();
              for(var i=1;i<len+2;i++)
              {
                 if(i==id)
                 {
                     $("#a_"+groupId+"_"+i).removeClass().addClass("btn btn-menu sidebar_a_s");
                 }
                 else{
                     $("#a_"+groupId+"_"+i).removeClass().addClass("btn btn-menu sidebar_b_s");
                 }
              }
        }
        $scope.changeLeftSmallBar_1 = function(id,len)
        {
            $scope.randomTime = new Date();
            for(var i=1;i<len+2;i++)
            {
                if(i==id)
                {
                    $("#b_"+i).removeClass().addClass("btn btn-menu sidebar_a_s");
                }
                else{
                    $("#b_"+i).removeClass().addClass("btn btn-menu sidebar_b_s");
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

    $scope.countDiv = true;
    $scope.randomTime = new Date();
    $http.get('/tag/searchForUsers/'+ $.cookie("s4_id")+"?t"+$scope.randomTime).success(function(data){
        $scope.carOwnerCount = data.rowCount;
    })
    //微信端
    $http.get('/tag/searchForUsers/'+ $.cookie("s4_id")+"?tagCode=chl2&t="+$scope.randomTime).success(function(data){
        $scope.weixinCount = data.rowCount;
    })
    //手机端
    $http.get('/tag/searchForUsers/'+ $.cookie("s4_id")+"?tagCode=chl1&t="+$scope.randomTime).success(function(data){
        $scope.appCount = data.rowCount;
    })
}
