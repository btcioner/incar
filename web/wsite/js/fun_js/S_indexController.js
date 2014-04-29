/**
 * Created by Liz on 14-03-25.
 */


var app = angular.module("SIndexApp", []);
app.controller("s_indexCtrl", function($scope, $http){

    $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
    //查询新申请的预约记录
    $http.get(baseurl+'organization/'+$.cookie("org_id")+'/work/care?page=1&pagesize=1&step=applied').success(function(data){
        $scope.applyCount = data.totalCount;
    })
    $http.get(baseurl+'organization/'+$.cookie("org_id")+'/care?page=1&pagesize=1').success(function(data){
        $scope.careCount = data.totalCount;
    })
})