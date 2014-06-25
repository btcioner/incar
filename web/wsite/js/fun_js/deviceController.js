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
    $scope.queryString = "";
    $scope.act_status=[{id:2,name:"请选择"},{id:0,name:"未激活"},{id:1,name:"已激活"}];
    $scope.ser_obdCode = "";
    $scope.ser_simNum = "";
    $scope.act_id = "";
    $scope.ser_addTimeB ="";
    $scope.ser_addTimeE = "";
    $scope.ser_actTimeB = "";
    $scope.ser_actTimeE = "";

    //请求设备列表数据

    $scope.currentPage = 1;
    $scope.pageRecord = 10;

    //首次请求数据库数据
    GetFirstPageInfo(false);//get fist driveData for first page；

    function GetFirstPageInfo(flag)
    {
         $scope.tips="";
         if(!flag) $scope.changeId = 1;
        $scope.randomTime = new Date();
         getAjaxLink(baseurl+'obd?page='+$scope.currentPage+'&pagesize='+ $scope.pageRecord+$scope.queryString+"&t="+$scope.randomTime,"","get",1);
//         $http.get(baseurl+'obd?page='+$scope.currentPage+'&pagesize='+ $scope.pageRecord+$scope.queryString+$scope.randomTime).success(function(data){
//
//          }).error(function(data){
//                alert("请求无响应");
//         })
    }

    //筛选条件
    $scope.SearchDriveInfo = function()
    {
        if($scope.act_id =="2" )$scope.act_id="";
        $scope.queryString = "&obd_code="+$scope.ser_obdCode+"&act_type="+$scope.act_id+"&sim_number="+$scope.ser_simNum+"&act_time_begin="
            +$scope.ser_actTimeB+"&act_time_end="+$scope.ser_actTimeE+"&created_date_begin="+$scope.ser_addTimeB+"&created_date_end="+$scope.ser_addTimeE;
        GetFirstPageInfo(false);
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
                $scope.GetDriveDetail($scope.choosedOC,$scope.drive_id,$scope.id);
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
        $scope.postData = {obd_code:$scope.obd_code};
    //  $scope.date = $.changeDate(new Date());
        getAjaxLink(baseurl + 'obd',$scope.postData,"post",2);
//        $http.post(baseurl + 'obd',$scope.postData).success(function(data){
//
//        }).error(function(data){
//          alert("请求无响应");
//        });
    }

    //get owner and car info  缺少所属4s店
    function GetOwnerInfo(obd_code)
    {
        $scope.randomTime = new Date();
        getAjaxLink(baseurl + 'obd/'+obd_code+"?t="+$scope.randomTime,"","get",3);
//        $http.get(baseurl + 'obd/'+obd_code+"?t="+randomTime).success(function(data){
//
//        }).error(function(data){
//                alert("请求无响应");
//        });
    }

    //查看一个OBD的行车数据
    $scope.GetDriveInfo = function(obd_code)
    {
        $scope.changeId = 1;
        $scope.choosedOC = obd_code;
        $scope.postData = {code:obd_code};
        GetOwnerInfo(obd_code);
        $scope.randomTime = new Date();
        getAjaxLink(baseurl + 'cmpx/drive_info?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord +'&obd_code='+obd_code+"&t="+$scope.randomTime,$scope.postData,"get",4);
//        $http.get(baseurl + 'cmpx/drive_info?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord +'&obd_code='+obd_code,$scope.postData)
//          .success(function(data){
//        }).error(function(data){
//                alert("请求无响应");
//        });
    }
    //查看一个OBD一次行程的数据
    $scope.GetDriveDetail = function(obd_code,drive_id,id)
    {
        $scope.changeId = 1;
        $scope.choosedOC = obd_code;
        $scope.drive_id = drive_id;
        $scope.id = id;
        //$scope.postData = {code:obd_code,drive_id:drive_id};
        GetOwnerInfo(obd_code);
        $scope.driveDetail = $scope.drvInfos[id];
        $scope.randomTime = new Date();
        getAjaxLink(baseurl + 'cmpx/drive_detail/'+obd_code+'/'+drive_id+'?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&t="+$scope.randomTime,"","get",5);
//        $http.get(baseurl + 'cmpx/drive_detail/'+obd_code+'/'+drive_id+'?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord).success(function(data){
//
//        }).error(function(data){
//                alert("请求无响应");
//        });
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

    //修改OBD信息操作按钮
    $scope.modify = function(index){
        $scope.index = index;
        $scope.modifySim = true;
        $scope.deviceList = false;
     //   alert($scope.devices[index].obd_code);
        GetOwnerInfo($scope.devices[index].obd_code);
     }

    //operate modify confirm //需要判断sim_number真实的修改以后才要
    $scope.ModifyConfrim = function(sim_number,obd_code)
    {
        $scope.changeId = 1;
        $scope.postData={sim_number:sim_number};
        getAjaxLink(baseurl + 'obd/'+obd_code,$scope.postData,"put",6);
//        $http.put(baseurl + 'obd/'+obd_code,$scope.postData).success(function(data){
//
//        }).error(function(data){
//                alert("请求无响应");
//        });
    }

    //利用$http封装访问，并解决防盗链问题。
    function getAjaxLink(url,query,type,id)
    {
        if($.cookie("nick") != "" && $.cookie("nick") != null)
        {
            //通过AngularJS自带的http访问。
            $http({ method: type, url: url, data:query}).success(function(data){
                if(data.status =="没有登录")
                {
                    alert("登录已超时！");
                    window.location="../login.html";
                }
                else{
                    getIndexData(id,data);
                }
            }). error(function(data){
                    alert("请求无响应");
                });
        }
        else{
            alert("登录已超时！");
            window.location="../login.html";
        }
    }

    //在访问之后对数据进行处理
    function getIndexData(id,data)
    {
        $scope.tips="";
        switch(id)
        {
            case 1: //查询所有设备列表
                if(data.status == "ok")
                {
                    for(var i=0;i<data.cars.length;i++)
                    {
                        data.cars[i].act_type = $.changeStatus(data.cars[i].act_type);
                        data.cars[i].created_date = $.changeDate2(data.cars[i].created_date);
                        data.cars[i].act_time = $.changeDate2(data.cars[i].act_time);
                    }
                    if(data.cars.length == 0)
                    {
                        $scope.tips = "暂无数据";
                    }
                    $scope.devices= data.cars;
                    PagingInfo(data.totalCount);
                }
                else
                {
                    alert(data.status);
                }
                break;
            case 2: //确认添加
                if(data.status == "ok")
                {
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
                break;
            case 3:
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
                break;
            case 4:
                if(data.status == "ok")
                {
                    if(data.drvInfos.length == 0)
                    {
                        alert("暂无行车数据");
                    }
                    else
                    {
                        $scope.drvInfos = data.drvInfos;

                        for(var i=0;i<data.drvInfos.length;i++)
                        {
                            $scope.drvInfos[i].carStatus = $.changeCarStatus( $scope.drvInfos[i].carStatus);
                            $scope.drvInfos[i].fireTime = $.changeDate($scope.drvInfos[i].fireTime);
                            $scope.drvInfos[i].flameOutTime = $.changeDate($scope.drvInfos[i].flameOutTime);
                        }
                        $scope.detailDiv = true;
                        $scope.deviceList = false;

                        PagingInfo(data.totalCount);
                    }
                }
                else
                {
                    alert(data.status);
                }
                break;
            case 5:
                if(data.status == "ok")
                {
                    if(data.details.length== 0)
                    {
                        $scope.tips="暂无数据";
                    }
                    else
                    {
                        for(var i=0;i<data.details.length;i++)
                        {
                            data.details[i].createTime = $.changeDate(data.details[i].createTime);
                        }
                    }
                    $scope.detailDiv = false;
                    $scope.oneDetailDiv = true;
                    $scope.details = data.details;
                    PagingInfo(data.totalCount);
                }
                else
                {
                    alert(data.status);
                }
                break;
            case 6:
                if(data.status == "ok")
                {
                    alert("修改成功！");
                    GetFirstPageInfo(false);
                    $scope.modifySim = false;
                    $scope.deviceList = true;
                    // $scope.devices[$scope.index].sim_number = sim_number;
                }
                else
                {
                    alert(data.status);
                }
                break;
        }
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
                 $scope.GetDriveDetail($scope.choosedOC,$scope.drive_id,$scope.id);
              break;
        }
    }


}

