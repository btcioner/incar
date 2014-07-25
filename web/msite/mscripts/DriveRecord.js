var app = angular.module("drAPP", ['ngResource','ngRoute']);

//行车记录前台logic

app.controller("driveRecordCtrl", function($scope, $http){

    $scope.user_openid = window.location.toString().split("=")[1];

    $scope.postData={user:$scope.user_openid};



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

    countPageClick("1","1", $scope.user_openid);//原文点击记录

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
    }

    $http.post("/mservice/driveRecord",$scope.postData).success(function(data){
          if(data.status == "ok")
          {
//            console.log(data.recordList);
              $scope.recordList = data.recordList;
          }else
          {
              $scope.openUpbox(data.status);
              setInterval(function(){
                  if(WeixinJSBridge){
                      WeixinJSBridge.call('closeWindow');
                  }
              },1500);
          }
        }).error(function(data){
            $scope.openUpbox("网络好像断了，请检查网络连接！");
        });

    var wxShare = function(){
        var base = window.location.href.match(/\w+:\/\/[^\/]+/);
        var pic = $("meta[name=wx-share-pic]").attr("content");
        WeixinJSBridge.on("menu:share:timeline", function(argv){
            var dataShared = {
                img_url:base + pic,
                link:window.location.href,
                title:$("title").text(),
                desc:''
            };
            WeixinJSBridge.invoke("shareTimeline", dataShared);
        });

        WeixinJSBridge.on("menu:share:appmessage", function(argv){
            var dataShared = {
                img_url:base + pic,
                link:window.location.href,
                title:$("title").text(),
                desc:''
            };
            WeixinJSBridge.invoke("sendAppMessage", dataShared);
        });

        WeixinJSBridge.on("menu:share:weibo", function(argv){
            var dataShared = {
                url:window.location.href,
                content:$("title").text()
            };
            WeixinJSBridge.invoke("shareWeibo", dataShared);
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

