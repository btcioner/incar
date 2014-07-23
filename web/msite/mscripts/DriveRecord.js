var app = angular.module("drAPP", ['ngResource','ngRoute']);

//行车记录前台logic

app.controller("driveRecordCtrl", function($scope, $http, $location){

    $scope.user_openid = window.location.toString().split("=")[1];

    $scope.postData={user:$scope.user_openid};

    countPageClick("1","1", $scope.user_openid);//原文点击记录

    //原文点击记录--by jl 07/21/14
    function countPageClick  (countType,pageId,wx_oid){
        $http.post('/mservice/countData', {countType:countType,pageId:pageId,wx_oid:wx_oid})
            .success(function(data){
                if(data.status == "ok")
                {
                    console.log(data.status);
                }else{
                    alert(data.status);
                }
            })
            .error(function(data){
                alert(data.status);
            });
    }

    $http.post("/mservice/driveRecord",$scope.postData).success(function(data){
          if(data.status == "ok")
          {
//            console.log(data.recordList);
              $scope.recordList = data.recordList;
          }else
          {
              alert(data.status);
              setInterval(function(){
                  if(WeixinJSBridge){
                      WeixinJSBridge.call('closeWindow');
                  }
              },1000);
          }
        }).error(function(data){
            alert("请求无响应!");
        });

    var wxShare = function(){
        var base = window.location.href.match(/\w+:\/\/[^\/]+/);
        var pic = $("meta[name=wx-share-pic]").attr("content");
        WeixinJSBridge.on("menu:share:timeline", function(){
            var dataShared = {
                img_url:base + pic,
                link:window.location.href,
                title:$("title").text()
            };

            WeixinJSBridge.invoke("shareTimeline", dataShared);
        });
    };

    // 微信分享
    if(typeof WeixinJSBridge !== "undefined"){
        wxShare();
    }
    else{
        $(document).on("WeixinJSBridgeReady", function(){
            wxShare();
        });
    }
});

