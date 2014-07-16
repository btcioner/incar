var app = angular.module("mrAPP", ['ngResource','ngRoute']);

//行车记录前台logic

app.controller("matchResultCtrl", function($scope, $http){


    $scope.user_openid = window.location.toString().split("=")[1];
    $scope.match_id =  window.location.toString().split("=")[2];

    $scope.postData={user:$scope.user_openid,id:$scope.match_id};

    $http.post("/mservice/matchResult",$scope.postData).success(function(data){
          if(data.status == "ok")
          {
//              console.log(data.recordList);
              $scope.matchResultList = data.matchResultList;
          }else
          {
              alert(data.status);
              setInterval(function(){
                  if(WeixinJSBridge){
                      WeixinJSBridge.call('closeWindow');
                  }
              },1000)
          }
    }).error(function(data){
            alert("请求无响应!");
        });
});