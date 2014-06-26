/**
 * Created by Liz on 14-03-25.
 */
//首页加载动态的统计数据
var app = angular.module("SIndexApp", []);
app.controller("s_indexCtrl", function($scope, $http){
    if($.cookie("nick_4s") != "" && $.cookie("nick_4s") != null)
    {
        $("#body_id").css("display","block");
        $scope.nickName = $.cookie("nick_4s");//保存登录进来用户的nick
        $scope.s4Name = $.cookie("s4_name");
        //查询新申请的预约记录
        $scope.randomTime = new Date();
        $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/work/care?step=applied&t='+$scope.randomTime).success(function(data){
            $scope.applyCount = data.totalCount;
        })
        $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/care?t='+$scope.randomTime).success(function(data){
            $scope.careCount = data.totalCount;
        })
    }else{
        parent.location.href="../login.html";
    }

     //注销
    $scope.logout = function()
    {
        if(confirm("是否确定要注销?"))
        {
             $http.get(baseurl+"logout").success(function(data){
                 if(data.status == "ok")
                 {
                     parent.location.href="../login.html";
                 }
             }).error(function(data){
                    alert("请求无响应!");
             })
        }
    }

    //动态改变被激活菜单
    $scope.active = function(ac_id)
    {
        for(var i=1;i<8;i++)
        {
            $("#li_active_"+i).removeClass();
            if(i==ac_id)
            {
                $("#li_active_"+i).addClass("menu_hl");
            }
        }
    }
})