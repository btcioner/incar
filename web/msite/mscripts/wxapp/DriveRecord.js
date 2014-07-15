var app = angular.module("drAPP", ['ngResource','ngRoute']);

app.controller("driveRecordCtrl", function($scope, $http){
    $scope.user_openid = window.location.toString().split("=")[1];

    $scope.postData={user:$scope.user_openid};
    $http.post("/mservice/driveRecord",$scope.postData).success(function(data){
          if(data.status == "ok")
          {
//              console.log(data.recordList);
              $scope.recordList = data.recordList;
          }else
          {
              alert(data.status);
          }
    }).error(function(data){
            alert("请求无响应!");
        });
});