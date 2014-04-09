/**
 * Created by 003383 on 14-2-27.
 */
(function($){
    $.getUrlParam = function(name)
    {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r!=null) return unescape(r[2]); return null;
    }
})(jQuery);

var app = angular.module("SCustomerApp", []);
app.controller("s_customerCtrl", function($scope, $http){

    $scope.cusDetailDiv = false;
    $scope.cusListDiv = true;
    $scope.cusTabDiv = false;


    $http.get('../js/fun_js/maintainInfo.json').success(function(data){
        $scope.customerList = data;
        getCurrentRecord(data);
    });


    //客户端分页
    function getCurrentRecord(devices)
    {
        $scope.pageRecord = 10;
        $scope.totalCount =  devices.length;
        $scope.totalPage = Math.ceil( devices.length /  $scope.pageRecord);
        $scope.currentPage = 0;
        $scope.record = 10;
        if($scope.currentPage ==  $scope.totalPage || $scope.totalPage < 2)
        {
            $scope.record = $scope.totalCount % $scope.pageRecord;
        }
        $scope.currentRecord =[{}];
        for(var i=0;i< $scope.record;i++)
        {
            $scope.currentRecord[i]=devices[$scope.currentPage * $scope.pageRecord + i];
        }
        $scope.totalOption=[{}];
        for(var i = 0 ;i< $scope.totalPage;i++)
        {
            $scope.totalOption[i]={size:i+1};
        }
    }

    //分页跳转页面
    $scope.changePage=function(changeId)
    {
        $scope.currentPage = changeId - 1;
        $scope.record = 10;
        if($scope.currentPage ==  $scope.totalPage-1)
        {
            $scope.record = $scope.totalCount % $scope.pageRecord;
        }
        $scope.currentRecord =[{}];
        for(var i=0;i< $scope.record;i++)
        {
            $scope.currentRecord[i]=$scope.devices[$scope.currentPage * $scope.pageRecord + i];
        }
    }

    $scope.customerDetail = function()
    {
        $scope.cusDetailDiv = true;
        $scope.cusListDiv = false;
        $scope.cusTabDiv = true;
    }



})