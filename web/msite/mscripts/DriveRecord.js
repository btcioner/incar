var app = angular.module("drAPP", ['ngResource','ngRoute']);

//行车记录前台logic

app.controller("driveRecordCtrl", function($scope, $http){

    $scope.user_openid = window.location.toString().split("=")[1];

    $scope.postData={user:$scope.user_openid};

    //微信内置分享API
    if(document.addEventListener){
        document.addEventListener('WeixinJSBridgeReady', sendMessage, false);  }
    else if(document.attachEvent){
        document.attachEvent('WeixinJSBridgeReady'   , sendMessage);
        document.attachEvent('onWeixinJSBridgeReady' , sendMessage);
    }

    function sendMessage(){
        WeixinJSBridge.on('menu:share:appmessage', function(argv){
            alert("发送给好友");
        });
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
                    alert(data.status);
                }
            })
            .error(function(data){
                alert(data.status);
            });
    };

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

});

