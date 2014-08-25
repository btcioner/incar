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

    $scope.tips = "";
    $scope.cover_show = false;
    $scope.upbox_show = false;

    $scope.closeUpbox = function(){
        $scope.tips = "";
        $scope.cover_show = false;
        $scope.upbox_show = false;
    }
    $scope.openUpbox = function(tips){
        $scope.tips = tips;
        $scope.cover_show = true;
        $scope.upbox_show = true;
    }


    countPageClick("1","14", $scope.user_openid);//原文点击记录

    //原文点击记录--by jl 07/21/14
    function countPageClick  (countType,pageId,wx_oid){
        $http.post('/mservice/countData', {countType:countType,pageId:pageId,wx_oid:wx_oid})
            .success(function(data){
                if(data.status == "ok")
                {
                    console.log(data.status);
                }else{
                    $scope.openUpbox(data.status);
                }
            })
            .error(function(data){
                $scope.openUpbox(data.status);
            });
    };



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
              $scope.openUpbox(data.status);
              setInterval(function(){
                  if(typeof WeixinJSBridge !== "undefined"){
                      WeixinJSBridge.call('closeWindow');
                  }
              },1000)
          }
    }).error(function(data){
            $scope.openUpbox("网络好像断了，请检查网络连接！!");
        });
});