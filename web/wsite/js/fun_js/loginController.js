/**
 * Created by 003383 on 14-2-27.
 */

var app = angular.module("LoginApp", []);


app.controller("loginCtrl", function($scope, $http){
   //注册的API
//    var postData = {name:"jiangli",pwd:"123456",nick:"liz",email:"hyacinth0509@163.com",phone:"13296630210"};
//    $http.post('/wservice/RegisterAccount',postData).success(function(data){
//        alert(data.status);
//    });

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
        $http.post(baseurl+'Login', $scope.postData)
            .success(function(data){
            if(data.status == "ok" && data.organizations[0]["class"] =="TOP")
            {
                $.cookie("nick",data.account.nick);
               window.location.href='/admin/index.html';
            }
            else if(data.status == "ok" && data.organizations[0]["class"] =="4S")
            {

                $.cookie("nick",data.account.nick);
                $.cookie("org_name",data.organizations[0]["name"]);
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