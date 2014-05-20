/**
 * Created by 003383 on 14-2-27.
 */


function s_customerCtrl($scope, $http,$routeParams){

    $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
    $scope.cusDetailDiv = false;
    $scope.cusListDiv = true;
    $scope.cusTabDiv = false;

    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.city_name="";
    $scope.org_id = 0;
    $scope.queryString = "&org_id="+ $.cookie("org_id");
    $scope.brand_id = "";
    $scope.series_id = "";
    $scope.acc_nick = "";
    $scope.acc_phone = "";
    $scope.queryNick = "";
    $scope.queryPhone = "";
    $scope.queryOBDCode = "";
    $scope.obd_code="";


//    $scope.countDiv = true;
//    if($routeParams.id!=null)
//    {
//        changeView(2);
//        GetFirstPageInfo();//get fist driveData for first page；
//    }
//    else{
//        $http.get(baseurl+'carowner?page=1&pagesize=1&org_id='+ $.cookie("org_id")).success(function(data){
//            $scope.carOwnerCount = data.totalCount;
//        })
//    }
//    $scope.changeTag = function(id)
//    {
//
//        switch(id)
//        {
//            case 0:
//                changeView(2);
//                GetFirstPageInfo();//get fist driveData for first page；
//                break;
//            case 1:
//                changeView(2);
//                GetFirstPageInfo();//get fist driveData for first page；
//                break;
//        }
//    }
//
//    $scope.changeAccordion = function()
//    {
//        $("#collapseGOne").removeClass;
//        $("#collapseGOne").addClass("collapse accordion-body");
//        $("#collapseGThree").removeClass;
//        $("#collapseGThree").addClass("collapse in accordion-body");
//    }
    //筛选框初始值 todo--要从数据库读出来
    $scope.allCity = [{name:"请选择"},{name:"武汉"},{name:"北京"}]
    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";

        $http.get(baseurl + '4s/1/cust?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString).success(function(data){
            if(data.status == "ok")
            {
                if(data.custs.length == 0)
                {
                    $scope.tips="暂无数据！";
                }
                $scope.carowners = data.custs;
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
        $scope.queryString = "&org_id="+ $.cookie("org_id");
        if($scope.city_name=="请选择")$scope.city_name = "";
        $scope.queryString = $scope.queryString + "&org_city="+$scope.city_name+"&brand_id="+$scope.brandCode+"&series_id="+$scope.seriesCode+"&acc_nick="+$scope.queryNick+"&acc_phone="+$scope.queryPhone;
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
                $scope.GetDriveDetail($scope.chooseOC,$scope.drive_id);
                break;
            case 3:
                getDriveList();
                break;
        }
    }

    function changeView(id)
    {
        switch(id)
        {
            case 1:
                $scope.cusDetailDiv = true;
                $scope.cusListDiv = false;
               // $scope.countDiv = false;
                $scope.cusTabDiv = true;
                break;
            case 2:
                $scope.cusDetailDiv = false;
                $scope.cusListDiv = true;
             //   $scope.countDiv = false;
                $scope.cusTabDiv = false;
                break;
        }
    }

    $scope.customerTab = function(id)
    {
        changeView(2);
        switch(id)
        {
            case 0:
                GetFirstPageInfo();
                break;
            case 1:
                GetFirstPageInfo();
                break;
            case 2:
                GetFirstPageInfo();
                break;
        }
    }
  //获取该车主的保养记录
    function getReservationRecord()
    {
        $scope.tips="";
        $http.get(baseurl+'organization/'+$.cookie("org_id")+'/work/care?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&step=done&car_id="+$scope.cusDetail.car_id).success(function(data){
            $scope.careList = data.works;
            PagingInfo(data.totalCount);
            if(data.works.length > 0)
            {
                for(var i=0;i< $scope.careList.length;i++)
                {
                    $scope.careList[i].working_time =  $.changeDate($scope.careList[i].working_time);
                    $scope.careList[i].created_time =  $.changeDate($scope.careList[i].created_time);
                    $scope.careList[i].updated_time =  $.changeDate($scope.careList[i].updated_time);
                    $scope.careList[i].step = $.changeWorkStatus($scope.careList[i].step);
                }
            }
            else{
                $scope.tips="暂无数据";
            }

        }).error(function(data){
                alert("请求无响应");
            });
    }
   //获取该车主的关怀记录
    function getCareRecord()
    {
        $scope.tips="";
        $http.get(baseurl+'organization/'+$.cookie("org_id")+'/care_tel_rec?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&car_id="+$scope.cusDetail.car_id).success(function(data){
           $scope.recordList = data.records;
            PagingInfo(data.totalCount);
           if(data.records.length > 0)
           {
              for(var i=0;i<data.records.length;i++)
              {
                  $scope.recordList[i].log_time = $.changeDate($scope.recordList[i].log_time);
              }
           }
            else{
                $scope.tips = "暂无数据";
            }
        }).error(function(data){
                alert("请求无响应");
        });
    }
    $scope.customerDetail = function(id)
    {
        $scope.cusDetail = $scope.carowners[id];
        getReservationRecord();
        $scope.cusDetailDiv = true;
        $scope.cusListDiv = false;
        $scope.cusTabDiv = true;
    }

    $scope.detailTab = function(id)
    {
            for(var i=1;i<7;i++)
            {
                $("#tab"+i).hide();

                if(i==id)
                {
                    $("#tab"+i).show();
                    $("#tab"+id).removeClass();
                    $("#tab"+id).addClass("tab-pane active");
                }
            }
        switch(id)
        {
            case 1:
                getReservationRecord();
                break;
            case 2:

                break;
            case 3:
                getCareRecord();
                break;
            case 4:

                break;
            case 5:
                $scope.driveDiv = true;
                $scope.paging1 = true;
                $scope.paging2 = false;
                $scope.oneDetailDiv = false;
                $scope.detailInfoDiv = false;
                $scope.oneMinuteDetailDiv = false;
                getDriveList();
                break;
            case 6:

                break;
        }
    }
   //查询行车数据
    function getDriveList()
    {
        $scope.postData = "&org_id="+ $.cookie("org_id")+"&obd_code="+$scope.cusDetail.obd_code;
        $http.post(baseurl+'GetDriveInfoAll?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                if(data.drvInfos.length == 0)
                {
                    alert("暂无详细数据");
                }
                $scope.drvInfos = data.drvInfos;
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

    //get owner and car info  缺少所属4s店
    function GetOwnerInfo(obd_code)
    {
        $http.get(baseurl + 'obd/'+obd_code).success(function(data){
            if(data.status == "ok")
            {
                $scope.deviceDetail = data.obd;
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
    $scope.GetDriveDetail = function(obd_code,drive_id)
    {
        $scope.chooseOC = obd_code;
        $scope.drive_id = drive_id;
        $scope.postData = {token:$scope.token,code:obd_code,drive_id:drive_id};
        GetOwnerInfo(obd_code);
        $http.post(baseurl + 'GetDriveDetail?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord,$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                if(data.details.length== 0)
                {
                    alert("暂无行程数据");
                }
                else{
                    $scope.driveDiv = false;
                    $scope.detailInfoDiv = true;
                    $scope.oneDetailDiv = true;
                    $scope.paging2 = true;
                    $scope.paging1 = false;
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
        if($scope.details[index].CarCondition == null || $scope.details[index].CarCondition.detail == 0)
        {
            alert("暂无详细数据");
        }
        else
        {
            $scope.omdds = $scope.details[index].CarCondition;
            $scope.oneDetailDiv = false;
            $scope.detailInfoDiv = false;
            $scope.paging1 = false;
            $scope.paging2 = false;
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
                $scope.paging1 = true;
                $scope.paging2 = false;
                $scope.oneDetailDiv = false;
                $scope.detailInfoDiv = false;
                $scope.oneMinuteDetailDiv = false;
                getDriveList();
                break;
            case 2: //数据流数据返回行程
                $scope.driveDiv = false;
                $scope.paging1 = false;
                $scope.paging2 = true;
                $scope.oneDetailDiv = true;
                $scope.detailInfoDiv = true;
                $scope.oneMinuteDetailDiv = false;
                $scope.GetDriveDetail($scope.chooseOC,$scope.drive_id);
                break;

        }
    }


}