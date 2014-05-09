/**
 * Created by Liz on 14-03-25.
 */
//获取url里面的token

//使用ngResource
//app.factory('quickService',['$http',function($http){
//    var baseUrl = "/wservice/organization";
//    return{
//        query:function()
//        {
//           return $http.get(baseUrl);
//        }
//    }
//}]);
function deviceCtrl($scope, $http)
{
    $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
    //alert($.cookie("username"));通过cookie来传值
    //定义各部分div初始的显示状态 -false为隐藏 true为显示
//    quickService.query().success(function(data){
//      alert(data.status);
//    })

    $scope.addDiv=false;
    $scope.deviceList=true;
    $scope.modifySim=false;
    $scope.detailDiv = false;
    $scope.oneDetailDiv = false;
    $scope.oneMinuteDetailDiv = false;
    $scope.obd_code ="";
    $scope.postData = "";
    $scope.changeId = 1;

    //请求设备列表数据

    $scope.currentPage = 1;
    $scope.pageRecord = 10;

    //首次请求数据库数据
    GetFirstPageInfo(false);//get fist driveData for first page；
    function GetFirstPageInfo(flag)
    {
         if(!flag) $scope.changeId = 1;
          $http.post(baseurl+'GetAllOBDDevices?page='+$scope.currentPage+'&pagesize='+ $scope.pageRecord,$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                for(var i=0;i<data.devs.length;i++)
                {
                    data.devs[i].act_type = $.changeStatus(data.devs[i].act_type);
                    data.devs[i].created_date = $.changeDate2(data.devs[i].created_date);
                    data.devs[i].join_time = $.changeDate2(data.devs[i].join_time);
                }
                  $scope.devices= data.devs;
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
    $scope.changePage=function(changeId,id)
    {
        $scope.changeId = changeId;
        $scope.currentPage = changeId ;
        switch(id)
        {
            case 1://设备列表
                GetFirstPageInfo(true);
                break;
            case 2: //行车数据
                $scope.GetDriveInfo($scope.choosedOC);
                break;
            case 3://行程数据
                $scope.GetDriveDetail($scope.choosedOC,$scope.drive_id);
                break;
        }
        $scope.currentPage = 1;
    }

    //添加按钮效果
    $scope.add = function(){
        $scope.addDiv=true;
        $scope.deviceList=false;
    }

    //添加确定操作
    $scope.addDevice = function(){
        $scope.changeId = 1;
        /*添加OBD设备 todo在填入设备好之后应该立即提示是否存在该设备号*/
        $scope.postData = {code:$scope.obd_code};
        $scope.date = $.changeDate(new Date());
        $http.post(baseurl + 'AddOBDDevice',$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                   $scope.devices[$scope.devices.length] ={
                   obd_code:$scope.obd_code,
                   created_date:$scope.date
                   }
                   $scope.obd_code = "";
                   alert("添加成功！");
                   $scope.addDiv=false;
                   $scope.deviceList=true;
                   GetFirstPageInfo(false);
            }
            else
            {
                  alert(data.status);
            }
        }).error(function(data){
          alert("请求无响应");
    });
    }

    //get owner and car info  缺少所属4s店
    function GetOwnerInfo(obd_code)
    {
        var randomTime = new Date();//防止浏览器缓存，加上随机时间。
        $http.get(baseurl + 'obd/'+obd_code+"?t="+randomTime).success(function(data){
            if(data.status == "ok")
            {
                $scope.deviceDetail = data.obd;
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

    //查看一个OBD的行车数据
    $scope.GetDriveInfo = function(obd_code)
    {
        $scope.changeId = 1;
        $scope.choosedOC = obd_code;
        $scope.postData = {code:obd_code};
        GetOwnerInfo(obd_code);
        $http.post(baseurl + 'GetDriveInfoAll?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord +'&obd_code='+obd_code,$scope.postData)
          .success(function(data){
            if(data.status == "ok")
            {
                if(data.drvInfos.length == 0)
                {
                    alert("暂无行车数据");
                }
                else
                {
                  $scope.detailDiv = true;
                  $scope.deviceList = false;
                  $scope.drvInfos = data.drvInfos;
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
    //查看一个OBD一次行程的数据
    $scope.GetDriveDetail = function(obd_code,drive_id)
    {
        $scope.changeId = 1;
        $scope.choosedOC = obd_code;
        $scope.drive_id = drive_id;
        $scope.postData = {code:obd_code,drive_id:drive_id};
        GetOwnerInfo(obd_code);
        $http.post(baseurl + 'GetDriveDetail?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord,$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                if(data.details.length== 0)
                {
                  alert("暂无行程数据");
                }
                else
                {
                    $scope.detailDiv = false;
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
        if($scope.details[index].CarCondition == null || $scope.details[index].CarCondition.length == 0)
        {
            alert("暂无详细数据");
        }
        else
        {
            $scope.omdds = $scope.details[index].CarCondition;
            $scope.oneDetailDiv = false;
            $scope.oneMinuteDetailDiv = true;
        }
    }

    //修改OBD信息操作按钮
    $scope.modify = function(index){
        $scope.index = index;
        $scope.modifySim = true;
        $scope.deviceList = false;
        GetOwnerInfo($scope.devices[index].obd_code);
     }

    //operate modify confirm //需要判断sim_number真实的修改以后才要
    $scope.ModifyConfrim = function(sim_number,obd_code)
    {
        $scope.changeId = 1;
        $scope.postData={sim_number:sim_number};
        $http.put(baseurl + 'obd/'+obd_code,$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                alert("修改成功！");
                GetFirstPageInfo(false);
                $scope.modifySim = false;
                $scope.deviceList = true;
                $scope.devices[$scope.index].sim_number = sim_number;
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
                alert("请求无响应");
        });
    }

    //返回操作
    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 2://修改OBD数据返回
              $scope.modifySim = false;
              $scope.deviceList = true;
                GetFirstPageInfo(false);
              break;
            case 1://添加设备数据返回
              $scope.addDiv=false;
              $scope.deviceList=true;
               GetFirstPageInfo(false);
              break;
            case 3://行程数据返回
              $scope.oneDetailDiv = false;
              $scope.detailDiv = true;
               $scope.GetDriveInfo($scope.choosedOC);
              break;
             case 4://行车数据返回
              $scope.detailDiv = false;
              $scope.deviceList=true;
                 GetFirstPageInfo(false);
              break;
             case 5://数据流记录
              $scope.oneMinuteDetailDiv = false;
              $scope.oneDetailDiv = true;
                 $scope.GetDriveDetail($scope.choosedOC,$scope.drive_id);
              break;
        }
    }


}

