/**
 * Created by Liz on 14-03-25.
 */
//首页加载动态的统计数据
var app = angular.module("SIndexApp", []);
app.controller("s_indexCtrl", function($scope, $http){
    if($.cookie("nick") != "" && $.cookie("nick") != null)
    {
        $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
        //查询新申请的预约记录
        $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/work/care?step=applied').success(function(data){
            $scope.applyCount = data.totalCount;
        })
        $http.get(baseurl+'organization/'+$.cookie("org_id")+'/care').success(function(data){
            $scope.careCount = data.totalCount;
        })
    }else{
        alert("登录已超时！");
        window.location="../login.html";
    }
})