/**
 * Created by liz on 14-03-30.
 */

angular.module("DriveDataApp", [])
    .controller("driveDataCtrl",function($scope, $http){

   if($.cookie("nick_4s") != "" && $.cookie("nick_4s") != null)
    {
        $scope.nickName = $.cookie("nick_4s");//保存登录进来用户的nick
        $scope.s4Name = $.cookie("s4_name");
    }else{
        window.location="../login.html";
    }
    $scope.driveDiv = true;
    $scope.oneDetailDiv = false;
    $scope.oneMinuteDetailDiv = false;

    //请求行车数据列表
    $scope.pageRecord = 10;
    $scope.currentPage = 1;
    $scope.obd_num="";
    $scope.city_name="";
    $scope.org_name="";
    $scope.series = "";
    $scope.queryString = "&s4_id="+ $.cookie("s4_id");

    //筛选框初始值 todo--要从数据库读出来
    $scope.city = [{name:"请选择"},{name:"武汉"},{name:"北京"}]
   // $scope.org= [{name:"请选择"},{name:'4S店A'},{name:'4S店C1'},{name:'奥体中心4S店'}]


        GetFirstPageInfo();//get fist driveData for first page；
        function GetFirstPageInfo()
        {
            $scope.tips="";
            $scope.randomTime = new Date();
            $http.get(baseurl+'cmpx/drive_info?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString+"&t="+$scope.randomTime).success(function(data){
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
            $http.get(baseurl+'brand/'+ $.cookie("brand_id")+'/series').success(function(data){
                $scope.carSeries = data.series;
            });
            $scope.queryString = "";
        }
    //按条件筛选行车数据行车数据
    $scope.SearchDriveInfo = function()
    {
          $scope.queryString = "&s4_id="+ $.cookie("s4_id");
          if($scope.series == null){$scope.series =""};
          $scope.queryString  = $scope.queryString+"&obd_code="+$scope.obd_num+"&series="+$scope.series;
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
            $scope.randomTime = new Date();
            $http.get(baseurl + '4s/'+$.cookie("s4_id")+'/car?obd_code='+obd_code+"&t="+$scope.randomTime).success(function(data){
                if(data.status == "ok")
                {
                  $scope.carInfo = data.cars[0];
                    $http.get(baseurl + '4s/'+$.cookie("s4_id")+'/car/'+$scope.carInfo.id+'/cust?obd_code='+obd_code+"&t="+$scope.randomTime).success(function(data){
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
//            var randomTime = new Date();//防止浏览器缓存，加上随机时间。
//            $http.get(baseurl + 'obd/'+obd_code+"?t="+randomTime).success(function(data){
//                if(data.status == "ok")
//                {
//                    $scope.deviceDetail = data.car;
//                    $scope.deviceDetail.obdNum = obd_code;
//                    $scope.deviceDetail.act_type = $.changeStatus($scope.deviceDetail.act_type);
//                }
//                else
//                {
//                    alert(data.status);
//                }
//            }).error(function(data){
//                    alert("请求无响应");
//                });
        }
        //查看一个OBD一次行程的数据
        $scope.GetDriveDetail = function(obd_code,drive_id,id)
        {
            $scope.tips = "";
            $scope.chooseOC = obd_code;
            $scope.drive_id = drive_id;
            $scope.index = id;
            //  $scope.postData = {code:obd_code,drive_id:drive_id};
            GetOwnerInfo(obd_code);
            $scope.driveDetail = $scope.drvInfos[id];
            $scope.randomTime = new Date();
            $http.get(baseurl + 'cmpx/drive_detail/'+obd_code+'/'+drive_id+'?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&t="+$scope.randomTime).success(function(data){
                if(data.status == "ok")
                {
                    if(data.details.length== 0)
                    {
                         $scope.tips="暂无数据";
                    }
                    else{
                        for(var i=0;i<data.details.length;i++)
                        {
                            data.details[i].createTime = $.changeDate(data.details[i].createTime);
                        }
                    }
                    $scope.driveDiv = false;
                    $scope.oneDetailDiv = true;
                    $scope.details = data.details;
                    PagingInfo(data.totalCount);
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

        //注销
        $scope.logout = function()
        {
            if(confirm("是否确定要注销?"))
            {
                $http.get(baseurl+"logout").success(function(data){
                    if(data.status == "ok")
                    {
                        window.location="../login.html";
                    }
                }).error(function(data){
                        alert("请求无响应!");
                    })
            }
        }
})