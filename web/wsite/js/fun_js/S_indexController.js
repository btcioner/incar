/**
 * Created by Liz on 14-03-25.
 */
//首页加载动态的统计数据
var app = angular.module("SIndexApp", []);
app.controller("s_indexCtrl", function($scope, $http){
    if($.cookie("nick_4s") != "" && $.cookie("nick_4s") != null)
    {
        $scope.nickName = $.cookie("nick_4s");//保存登录进来用户的nick
        //查询新申请的预约记录
        $scope.randomTime = new Date();
        $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/work/care?step=applied&t='+$scope.randomTime).success(function(data){
            $scope.applyCount = data.totalCount;
        })
        $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/care?t='+$scope.randomTime).success(function(data){
            $scope.careCount = data.totalCount;
        })
    }else{
       window.location="../login.html";
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
})