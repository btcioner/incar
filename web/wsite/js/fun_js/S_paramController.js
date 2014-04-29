/**
 * Created by 003383 on 14-2-27.
 */

function s_paramCtrl($scope, $http){

     $scope.paramListDiv = true;
     $scope.paramAddDiv = false;
     $scope.paramModifyDiv = false;

     $scope.currentPage = 1;
     $scope.pageRecord = 10;

     $scope.initBid = 0;
     $scope.intiSid = "";
    GetFirstPageInfo($scope.initBid,$scope.intiSid);//get fist driveData for first page；
    function GetFirstPageInfo(bid,sid)
    {
        $scope.tips="";
        $scope.queryStr="";
        if(sid != "")
        {
            $scope.queryStr="/"+sid;
        }
        else
        {
            $scope.queryStr='?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord
        }

        $http.get(baseurl+'brand/'+bid+'/series'+$scope.queryStr).success(function(data){
            if(data.status == "ok")
            {
                if(sid == "")
                {
                    if(data.series.length > 0)
                    {
                      $scope.seriesList = data.series;
                      PagingInfo(data.totalCount);
                    }
                    else{
                       $scope.tips="暂无数据";
                    }
                }
                else{
                  $scope.seriesList[0] = data.series;
                    $scope.seriesList.splice(1, $scope.seriesList.length);
                    PagingInfo(0);
                }
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
                alert("请求无响应");
            })
        $http.get(baseurl+'brand').success(function(data){
            $scope.carBrand = data.brands;
        });
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

    //paging redirct
    $scope.changePage=function(changeId)
    {
        $scope.currentPage = changeId ;
        GetFirstPageInfo($scope.initBid);
    }

    //查找品牌
    $scope.changeBrand = function(brand_id)
    {
       $scope.initBid = brand_id;
       GetFirstPageInfo($scope.initBid,"");
       $http.get(baseurl+'brand/'+brand_id+'/series').success(function(data){
           $scope.carSeries = data.series;
       });
    }

    //查找车型
    $scope.changeSeries = function(series_id)
    {
        GetFirstPageInfo($scope.initBid,series_id);
    }



    //点击添加按钮
    $scope.add = function()
    {
        $scope.paramListDiv = false;
        $scope.paramAddDiv = true;
    }

    //点击修改按钮
    $scope.modify = function()
    {
        $scope.paramListDiv = false;
        $scope.paramModifyDiv = true;
    }

    //返回
    $scope.gotoBack = function(id)
    {
       switch(id)
       {
           case 1:
               $scope.paramListDiv = true;
               $scope.paramAddDiv = false;
               break;
           case 2:
               $scope.paramListDiv = true;
               $scope.paramModifyDiv = false;
               break;
       }
    }
}