/**
 * Created by 003383 on 14-2-27.
 */

var app = angular.module("4sLoginApp", []);


app.controller("loginCtrl", function($scope, $http){


    $scope.username1="";
    $scope.password="";

    $scope.login = function(){
        /*检验是否为空*/
        if($scope.username1 == '' ||  $scope.username1.trim == ''){
            alert("用户名不能为空");
            return ;
        }else if($scope.password == '' ||  $scope.password.trim == ''){
            alert("密码不能为空");
            return ;
        }
        //在web service进行验证
        var sha1_password =hex_sha1($scope.password);//SHA1进行加密
        $scope.postData = {name:$scope.username1,pwd:sha1_password,agent:"web"};
        var link = window.location.href;
        var s4_id = link.split("/")[3].split(".")[0].split("_")[1];

        $http.post(baseurl+'4s/'+s4_id+'/login', $scope.postData)
            .success(function(data){
            if(data.status == "ok" && data.staff != null)
            {
                $.cookie("nick",data.staff.nick);
                $.cookie("s4_id",1);
                window.location.href='/4sStore/index.html';
            }
            else
            {
                alert(data.status);
                $scope.password="";
                $scope.username1="";
            }
            }).error(function(data){
                alert("请求无响应");
            });
    }
})