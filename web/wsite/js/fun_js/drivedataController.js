/**
 * Created by liz on 14-03-30.
 */


function driveDataCtrl($scope, $http){

    $scope.driveDiv = true;
    $scope.oneDetailDiv = false;
    $scope.oneMinuteDetailDiv = false;

    //请求行车数据列表
    $scope.pageRecord = 10;
    $scope.currentPage = 1;
    $scope.obd_num="";
    $scope.city_name="";
    $scope.org_name="";
    $scope.queryString="";
    $scope.brandCode="";
    $scope.seriesCode="";
    $scope.s4_id = "";

    //筛选框初始值 todo--要从数据库读出来
    $scope.city = [{name:"请选择"},{name:"武汉"},{name:"北京"}]
    $scope.org= [{name:"请选择"},{name:'4S店A'},{name:'4S店C1'},{name:'奥体中心4S店'}]


    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $http.get(baseurl+'cmpx/drive_info?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString).success(function(data){
            if(data.status == "ok")
            {
                if(data.drvInfos.length == 0)
                {
                    $scope.tips="暂无数据！";
                }

                $scope.drvInfos = data.drvInfos;
                for(var i=0;i<data.drvInfos.length;i++)
                {
                    $scope.drvInfos[i].carStatus = $.changeCarStatus( $scope.drvInfos[i].carStatus);
                }
                PagingInfo(data.totalCount);
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
        $http.get(baseurl+'4s').success(function(data){
            $scope.s4s = data.s4s;
        });
    }

    //查找品牌
    $scope.changeBrand = function(brand_id)
    {
        $http.get(baseurl+'brand/'+brand_id+'/series').success(function(data){
            $scope.carSeries = data.series;
        });
    }

//按条件筛选行车数据行车数据
    $scope.SearchDriveInfo = function()
    {
          if($scope.city_name=="请选择")$scope.city_name="";
          $scope.queryString = "&obd_code="+$scope.obd_num+"&city="+$scope.city_name+"&s4_id="+$scope.s4_id+"&brand="+$scope.brandCode+"&series="+$scope.seriesCode;
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

    //paging redirct
    $scope.changePage=function(changeId,id)
    {
        $scope.currentPage = changeId;
        switch(id)
        {
            case 1:
                GetFirstPageInfo();
                break;
            case 2:
                $scope.GetDriveDetail($scope.chooseOC,$scope.drive_id,$scope.index);
                break;
        }
        $scope.currentPage = 1;
    }
    //get owner and car info  缺少所属4s店
    function GetOwnerInfo(obd_code)
    {
        var randomTime = new Date();//防止浏览器缓存，加上随机时间。
        $http.get(baseurl + 'obd/'+obd_code+"?t="+randomTime).success(function(data){
            if(data.status == "ok")
            {
                $scope.deviceDetail = data.car;
                $scope.deviceDetail.obdNum = obd_code;
                $scope.deviceDetail.act_type = $.changeStatus($scope.deviceDetail.act_type);
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
                alert("请求无响应");
            });
    }
    //查看一个OBD一次行程的数据
    $scope.GetDriveDetail = function(obd_code,drive_id,id)
    {
        $scope.chooseOC = obd_code;
        $scope.drive_id = drive_id;
        $scope.index = id;
      //  $scope.postData = {code:obd_code,drive_id:drive_id};
        GetOwnerInfo(obd_code);
        $scope.driveDetail = $scope.drvInfos[id];
        $http.get(baseurl + 'cmpx/drive_detail/'+obd_code+'/'+drive_id+'?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord).success(function(data){
            if(data.status == "ok")
            {
                if(data.details.length== 0)
                {
                    alert("暂无行程数据");
                }
                else{
                   // $.changeContentHeight("630px");
                    $scope.driveDiv = false;
                    $scope.oneDetailDiv = true;
                    $scope.details = data.details;
                    PagingInfo(data.totalCount);
                }
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
                alert("请求无响应");
         });

    }


    //一分钟内的行车数据流记录
    $scope.GetOneMinuteDetail = function(index)
    {
        if($scope.details[index].detail == null || $scope.details[index].detail.length == 0)
        {
             alert("暂无详细数据");
        }
        else
        {
           // $.changeContentHeight("1000px");
            $scope.omdds = $scope.details[index].detail;
            $scope.oneDetailDiv = false;
            $scope.oneMinuteDetailDiv = true;
        }
    }

   //返回操作
    $scope.gotoBack = function(id)
    {
        $scope.currentPage = 1;
        switch(id)
        {
            case 1: //行程返回行车
                $scope.driveDiv = true;
                $scope.oneDetailDiv = false;
                GetFirstPageInfo();
                break;
            case 2: //数据流数据返回行程
                $scope.oneDetailDiv = true;
                $scope.oneMinuteDetailDiv = false;
                $scope.GetDriveDetail($scope.chooseOC,$scope.drive_id,$scope.index);
                break;
        }
    }




    //删除
    $scope.deleteRecord = function(index){
        if(confirm("确定要删除吗？")){
            $scope.users.splice(index, 1);
        }
    }
}