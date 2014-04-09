/**
 * Created by Liz on 14-04-03.
 */

var app = angular.module("CarOwnerApp", []);
app.controller("carownerCtrl", function($scope, $http){
    $scope.carOwnerDiv = true;
    $scope.carOwnerModifyDiv = false;
    $scope.carOwnerAddDiv = false;

    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.city_name="";
    $scope.org_id = 0;
    $scope.queryString="";
    $scope.brand_id = "";
    $scope.series_id = "";
    $scope.acc_nick = ""
    $scope.acc_phone = "";
    $scope.queryNick = "";
    $scope.queryPhone = "";
    $scope.obd_code="";

    //筛选框初始值 todo--要从数据库读出来
    $scope.allCity = [{name:"请选择"},{name:"武汉"},{name:"北京"}]
    $scope.org= [{id:0,name:"请选择"},{id:4,name:'4S店A'},{id:5,name:'4S店C1'},{id:16,name:'奥体中心4S店'}]
    $scope.carBrand=[{id:"zero",name:"请选择"},{id:0,name:"丰田/TOYOTA"},{id:1,name:"本田/Honda"},{id:2,name:"日产/NISSAN"},{id:3,name:"三菱/MITSUBISHIMOTORS"}];
    $scope.carSeries=[{id:0,name:"请选择"}];


    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $http.get(baseurl + 'carowner?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString).success(function(data){
            if(data.status == "ok")
            {
                if(data.carowners.length == 0)
                {
                    $scope.tips="暂无数据！";
                }
                $scope.carowners = data.carowners;
                PagingInfo(data.totalCount);
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
        alert("请求无响应");
        })
    }

    //改变车型自动加载车款
    $scope.changeSeries = function()
    {

        if($scope.brand_id !="zero")
        {
          switch($scope.brand_id)
          {
              case 0:
                  $scope.carSeries=[{id:0,name:"请选择"},{id:1,name:"FJ酷路泽"},{id:2,name:"HIACE"},{id:3,name:"Siemma"},{id:4,name:"Venza威飒"}];
                  break;
              case 1:
                  $scope.carSeries=[{id:0,name:"请选择"},{id:1,name:"INSIGHT"},{id:2,name:"本田CR-Z"},{id:3,name:"飞度(进口)"},{id:4,name:"里程"}];
                  break;
              case 2:
                  $scope.carSeries=[{id:0,name:"请选择"},{id:1,name:"碧莲"},{id:2,name:"风度"},{id:3,name:"风雅"},{id:4,name:"贵士"}];
                  break;
              case 3:
                  $scope.carSeries=[{id:0,name:"请选择"},{id:1,name:"ASX劲炫(进口)"},{id:2,name:"LANCER"},{id:3,name:"格鲁迪(进口)"},{id:4,name:"欧蓝德(进口)"}];
                  break;
          }
    }
    }


    //按条件筛选行车数据行车数据
    $scope.SearchDriveInfo = function()
    {
        if($scope.city_name=="请选择")$scope.city_name = "";
        if($scope.org_id == 0)$scope.org_id = "";
        if($scope.brand_id == "zero")$scope.brand_id = "";
        if($scope.series_id == 0) $scope.series_id = "";
        $scope.queryString = "&org_city="+$scope.city_name+"&org_id="+$scope.org_id+"&brand_id="+$scope.brand_id+"&series_id="+$scope.series_id+"&acc_nick="+$scope.queryNick+"&acc_phone="+$scope.queryPhone;
        GetFirstPageInfo();
    }

    //get paging param info
    function PagingInfo(totalCount)
    {
        $scope.totalCount = totalCount;
        $scope.totalPage = Math.ceil( $scope.totalCount /  $scope.pageRecord)
        $scope.totalOption=[{}];
        for(var i = 0 ;i< $scope.totalPage;i++)
        {
            $scope.totalOption[i]={size:i+1};
        }
    }


    //分页跳转页面
    $scope.changePage=function(changeId)
    {
        $scope.currentPage = changeId
        GetFirstPageInfo();
    }


    //修改
    $scope.modify = function(index){
        $scope.carOwnerDiv = false;
        $scope.carOwnerModifyDiv = true;
        $scope.carOwnerDetail = $scope.carowners[index];
    }

    //修改确认
    $scope.ModifyConfirm = function()
    {
        $http.put(baseurl + 'carowner/'+$scope.carOwnerDetail.acc_id,$scope.carOwnerDetail).success(function(data){
            if(data.status == "ok")
            {
                alert("修改成功");
                $scope.carOwnerDiv = true;
                $scope.carOwnerModifyDiv = false;
            }
            else{
                alert(data.status);
            }
        }).error(function(data){
                alert("请求没响应");
        });
    }

    //添加按钮
    $scope.add = function(){
        $scope.carOwnerDiv = false;
        $scope.carOwnerAddDiv = true;
    }

    //添加确认
    $scope.AddConfirm = function()
    {
        var sha1_password =hex_sha1($scope.acc_pwd);//SHA1进行加密
        $scope.postData ={"org_id":$scope.org_id,
                           "acc_name":$scope.acc_name,
                           "acc_pwd":sha1_password,
                           "acc_nick":$scope.acc_nick,
                           "acc_phone":$scope.acc_phone,
                           "brand_id":$scope.brand_id,
                           "series_id":$scope.series_id,
                           "car_license":$scope.car_license,
                           "obd_code":$scope.obd_code};
        $http.post(baseurl + 'carowner',$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                alert("添加成功！");
                $scope.carowners[$scope.carowners.length]={
                    "acc_id": $scope.carowners[$scope.carowners.length-1].id + 1,
                    "org_id":$scope.org_id,
                    "acc_name":$scope.acc_name,
                    "acc_nick":$scope.acc_nick,
                    "acc_phone":$scope.acc_phone,
                    "car_brand":$scope.brand_id,
                    "car_series":$scope.series_id,
                    "car_license":$scope.series_id,
                    "obd_code":$scope.obd_code
                }
                $scope.carOwnerDiv = true;
                $scope.carOwnerAddDiv = false;
                GetFirstPageInfo();
            }
            else{
                alert(data.status);
            }
        }).error(function(data){
                alert("请求没响应");
            })
    }

    //返回按钮
    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 2:
                $scope.carOwnerDiv = true;
                $scope.carOwnerAddDiv = false;
                break;
            case 1:
                $scope.carOwnerDiv = true;
                $scope.carOwnerModifyDiv = false;
                break;
        }
    }

})