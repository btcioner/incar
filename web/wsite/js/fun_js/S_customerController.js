/**
 * Created by 003383 on 14-2-27.
 */


function s_customerCtrl($scope, $http,$routeParams){

    $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
    $scope.cusDetailDiv = false;
    $scope.cusListDiv = true;
    $scope.cusTabDiv = false;
    $scope.labelListDiv = false;
    $scope.labelAddDiv = false;
    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.city_name="";
    $scope.org_id = 0;
    $scope.queryString = "";
    $scope.brandCode = "";
    $scope.seriesCode = "";
    $scope.acc_nick = "";
    $scope.acc_phone = "";
    $scope.queryNick = "";
    $scope.queryPhone = "";
    $scope.car_license = "";
    $scope.obd_code="";



    if($routeParams.id!=null)
    {
//        changeView(2);
//        GetFirstPageInfo();//get fist driveData for first page；
        if($routeParams.id == "add")
        {
            changeView(3);
        }
        else{
           // searchForUsers($routeParams.id);
            $scope.queryString = "&tagId="+$routeParams.id;
        }
    }
    else{
         //  $scope.queryString = "&org_id="+ $.cookie("s4_id");
    }

    //筛选框初始值 todo--要从数据库读出来
    $scope.allCity = [{name:"请选择"},{name:"武汉"},{name:"北京"}]

    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $http.get('/tag/searchForUsers?page='+$scope.currentPage+'&pageSize='+$scope.pageRecord+$scope.queryString).success(function(data){
            if(data.status == "success")
            {
                if(data.data.length == 0)
                {
                    $scope.tips="暂无数据！";
                }
                $scope.carowners = data.data;

                PagingInfo(data.rowCount);
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
        $scope.queryString = "&org_id="+ $.cookie("s4_id");
        if($scope.city_name=="请选择")$scope.city_name = "";
        $scope.queryString = $scope.queryString + "&org_city="+$scope.city_name+"&brand_id="+$scope.brandCode+"&series_id="+$scope.seriesCode+"&acc_nick="+$scope.queryNick+"&acc_phone="+$scope.queryPhone+"&license="+$scope.car_license;
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
                $scope.GetDriveDetail($scope.chooseOC,$scope.drive_id,$scope.index);
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
                $scope.cusTabDiv = true;
                $scope.labelListDiv = false;
                $scope.labelAddDiv = false;
                break;
            case 2:
                $scope.cusDetailDiv = false;
                $scope.cusListDiv = true;
                $scope.cusTabDiv = false;
                $scope.labelListDiv = false;
                $scope.labelAddDiv = false;
                break;
            case 3:
                $scope.cusDetailDiv = false;
                $scope.cusListDiv = false;
                $scope.cusTabDiv = false;
                $scope.labelListDiv = true;
                $scope.labelAddDiv = false;
                break;
            case 4:
                $scope.cusDetailDiv = false;
                $scope.cusListDiv = false;
                $scope.cusTabDiv = false;
                $scope.labelListDiv = false;
                $scope.labelAddDiv = true;
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
        $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/work/care?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&step=done&car_id="+$scope.cusDetail.carId).success(function(data){
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
        $http.get(baseurl+'organization/'+$.cookie("org_id")+'/care_tel_rec?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&car_id="+$scope.cusDetail.carId).success(function(data){
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
        $scope.tips="";
        $scope.queryString="&org_id="+ $.cookie("s4_id")+"&obd_code="+$scope.cusDetail.obdCode;
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
                    $scope.drvInfos[i].fireTime = $.changeDate($scope.drvInfos[i].fireTime);
                    $scope.drvInfos[i].flameOutTime = $.changeDate($scope.drvInfos[i].flameOutTime);
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
    }

    //get owner and car info  缺少所属4s店
    function GetOwnerInfo(obd_code)
    {
        $http.get(baseurl + '4s/'+$.cookie("s4_id")+'/car?obd_code='+obd_code).success(function(data){
            if(data.status == "ok")
            {
                $scope.carInfo = data.cars[0];
                $http.get(baseurl + '4s/'+$.cookie("s4_id")+'/car/'+$scope.carInfo.id+'/cust?obd_code='+obd_code).success(function(data){
                    if(data.status=="ok")
                    {
                        $scope.custInfo = data.custs[0];
                    }else{
                        alert(data.status);
                    }
                }).error(function(data){
                        alert("请求无响应");
                    });
            }
            else{
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
                    for(var i=0;i<data.details.length;i++)
                    {
                        data.details[i].createTime = $.changeDate(data.details[i].createTime);
                    }
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
        if($scope.details[index].detail == null || $scope.details[index].detail.length == 0)
        {
            alert("暂无详细数据");
        }
        else
        {
            $scope.omdds = $scope.details[index].detail;
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
                $scope.GetDriveDetail($scope.chooseOC,$scope.drive_id,$scope.index);
                break;
            case 3:
                changeView(2);
                break;
            case 4:
                changeView(3)
                break;

        }
    }
 //自定义标签相关
  $scope.labelTab = function(id)
  {
      switch(id)
      {
          case 0: //标签管理
              changeView(3);
              break;
      }
  }
    //添加自定义标签按钮
    $scope.addCustomLabel = function()
    {
        changeView(4);
    }
    $scope.confirmAddCustomLabel = function()
    {
       changeView(3);
    }
}