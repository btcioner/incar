/**
 * Created by liz on 14-7-16.
 */
'use strict';
var app = angular.module("mrAPP", ['ngResource','ngRoute']);

//行车记录前台logic

app.controller("matchResultCtrl", function($scope, $http,$sce){

    $scope.user_openid = window.location.toString().split("=")[1].split("&")[0];
    $scope.match_id =  window.location.toString().split("=")[2];

    $scope.postData={user:$scope.user_openid,id:$scope.match_id};

    $http.post("/mservice/matchResult",$scope.postData).success(function(data){
          if(data.status == "ok")
          {
//              console.log(data.recordList);
              $scope.matchResultList = data.matchResultList;
              $scope.matchResultList[0].awards =  $sce.trustAsHtml($scope.matchResultList[0].awards);
              $scope.matchResultList[0].tm_start =  $scope.matchResultList[0].tm_start.substring(0,16);
              $scope.matchResultList[0].tm_end =  $scope.matchResultList[0].tm_end.substring(0,16);
              $scope.matchResultList[0].tm_announce =  $scope.matchResultList[0].tm_announce.substring(0,16);
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