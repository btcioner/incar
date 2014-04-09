/**
 * Created by Liz on 14-2-27.
 */

angular.module("SReservationApp")
    .controller("s_reservationCtrl", function($scope, $http, $location){

    $scope.reservationDiv = true;
    $scope.applyOperDiv = false;
    $scope.repairDiv = true;

    $http.get('../js/fun_js/maintainInfo.json').success(function(data){
        $scope.reservationList = data;
      //  getCurrentRecord(data);
    });

    //客户端分页
//    function getCurrentRecord(devices)
//    {
//        $scope.pageRecord = 10;
//        $scope.totalCount =  devices.length;
//        $scope.totalPage = Math.ceil( devices.length /  $scope.pageRecord);
//        $scope.currentPage = 0;
//        $scope.record = 10;
//        if($scope.currentPage ==  $scope.totalPage || $scope.totalPage < 2)
//        {
//            $scope.record = $scope.totalCount % $scope.pageRecord;
//        }
//        $scope.currentRecord =[{}];
//        for(var i=0;i< $scope.record;i++)
//        {
//            $scope.currentRecord[i]=devices[$scope.currentPage * $scope.pageRecord + i];
//        }
//        $scope.totalOption=[{}];
//        for(var i = 0 ;i< $scope.totalPage;i++)
//        {
//            $scope.totalOption[i]={size:i+1};
//        }
//    }

    //分页跳转页面
//    $scope.changePage=function(changeId)
//    {
//        $scope.currentPage = changeId - 1;
//        $scope.record = 10;
//        if($scope.currentPage ==  $scope.totalPage-1)
//        {
//            $scope.record = $scope.totalCount % $scope.pageRecord;
//        }
//        $scope.currentRecord =[{}];
//        for(var i=0;i< $scope.record;i++)
//        {
//            $scope.currentRecord[i]=$scope.devices[$scope.currentPage * $scope.pageRecord + i];
//        }
//    }
   //查看保养预约详情
   $scope.Operation = function(index,type)
   {
       changeView(1);
       switch(type)
       {
           case "新申请":
               $("#diffDiv").html("");
              break;
           case "已拒绝":
               $("#diffDiv").html("<th style='height:30px;vertical-align: middle'>拒绝原因</th>"
                   +"<th style='background-color:#F9F9F9;vertical-align: middle;text-align: left' colspan='5' rowspan='2'>工位已满</th>");
               break;
           case "已取消":
               break;
       }
   }

    function changeView(id)
    {
        switch(id)
        {
            case 1:
                $scope.reservationDiv = false;
                $scope.applyOperDiv = true;
               break;
            case 2:
                $scope.reservationDiv = true;
                $scope.applyOperDiv = false;
                break;
        }
    }
    $scope.ReservationTab = function(id)
    {
        changeView(2);
        switch(id)
        {
            case 0:
                $http.get('../js/fun_js/maintainInfo.json').success(function(data){
                    $scope.reservationList = data;
                });
                break;
            case 1://新申请
                $http.get('../js/fun_js/maintainInfo1.json').success(function(data){
                    $scope.reservationList =  data;
                });
                break;
            case 2://已拒绝
                $http.get('../js/fun_js/maintainInfo2.json').success(function(data){
                    $scope.reservationList =  data;
                });
                break;
            case 3://已确认
                break;
            case 4://已完成
                break;
            case 5://未到店
                break;
            case 6://已取消
                break;
        }
    }
})