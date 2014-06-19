/**
 * Created by 003383 on 14-2-27.
 */

//保养提醒
function  s_alarmCtrl($scope, $http,$routeParams){
    $scope.maintainListDiv = true;
    $scope.applyOperDiv = false;
    $scope.careListDiv = false;
    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.working_time = "";
    $scope.reason = "";

    if($routeParams.id != null && $routeParams.id == "alCare")
    {
        GetFirstPageInfo_1();
    }
    else
    {
        GetFirstPageInfo();
    }

    function GetFirstPageInfo()
    {
        $scope.tips="";
        $scope.randomTime = new Date();
        $http.get('/alarm/'+$.cookie("s4_id")+'?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&t="+$scope.randomTime).success(function(data){
//            if(data.status=="ok")
//            {
//                $scope.alarmList = data;
//                PagingInfo( $scope.alarmList.length);
//                if($scope.alarmList.length == 0)
//                {
//                    $scope.tips="暂无数据";
//                }
//                else{
//
//                }
//            }else{
//                alert(data.status);
//            }
        }).error(function(data){
                alert("请求无响应");
        });
    }

    function GetFirstPageInfo_1()
    {
        $scope.tips="";
        $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/care_tel_rec?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&t="+randomTime)
            .success(function(data){
                if(data.status=="ok")
                {
                    $scope.carList = data.records;
                    PagingInfo(data.totalCount);
                    if($scope.carList.length == 0)
                    {
                        $scope.tips="暂无数据";
                    }
                    else{
                        for(var i=0;i<$scope.carList.length;i++)
                        {
                            $scope.carList[i].log_time = $.changeDate($scope.carList[i].log_time);
                            $scope.carList[i].step = $.changeCareStatus($scope.carList[i].step);
                        }
                    }
                }else{
                    alert(data.status);
                }
            }).error(function(data){
                alert("请求无响应");
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

    //分页跳转页面
    $scope.changePage=function(changeId)
    {
        $scope.currentPage = changeId ;
        GetFirstPageInfo();
    }

    //查看保养预约详情
    $scope.Operation = function(index,type)
    {
        changeView(1);
        switch(type)
        {
            case "新提醒":
                $scope.carDetails = $scope.carList[index];
                $scope.car_id = $scope.carDetails.id;
                $scope.cust_id = $scope.carDetails.owner_id;
                $scope.buttonTh = true;
                $scope.show1 = true;
                break;
            case "未预约":
                $scope.show5 = true;
                $scope.remindMileTi = true;
                $scope.remindMileTe = true;
                break;
            case "已预约":
                $scope.remindMileTi = true;
                $scope.remindMileTe = true;
                $scope.show2 = true;
                break;
            case "已保养":
                $scope.remindMileTi = true;
                $scope.remindMileTe = true;
                $scope.show3 = true;
                $scope.show4 = true;
                break;
        }
    }
    //详情页面的子操作
    $scope.operationChild = function(id){
        changeView(1);
        $scope.buttonTh = true;
        $scope.show1 = true;
        switch(id){
          case 1:
              $scope.alreadyReserDiv = true;//已预约
              break;
          case 2:
              $scope.refuseReasonDiv = true;//未预约
              break;
        }
    }

    $scope.cancel = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.alreadyReserDiv = false;
                break;
            case 2:
                $scope.refuseReasonDiv = false;
                break;
        }
    }

    //确认操作
    $scope.confirmOper = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.postData = {"op":"apply","org_id":$.cookie("s4_id"),"car_id":$scope.car_id,"cust_id":$scope.cust_id,"working_time":$scope.working_time}
                $http.post(baseurl+'organization/'+ $.cookie("s4_id")+'/work/care',$scope.postData).success(function(data){
                     if(data.status=="ok")
                     {
                         alert("预约成功");
                         changeView(2);
                         GetFirstPageInfo();
                     }
                    else{
                         alert(data.status);
                     }
                }).error(function(data){
                        alert("请求无响应");
                    });
                break;
            case 2:
                $scope.postData = {"op":"refuse","org_id":$.cookie("s4_id"),"car_id":$scope.carDetails.id,"cust_id":$scope.carDetails.owner_id,"reason":$scope.reason}
                $http.post(baseurl+'organization/'+ $.cookie("s4_id")+'/work/care',$scope.postData).success(function(data){
                    if(data.status=="ok")
                    {
                        alert("操作成功");
                        changeView(2);
                        GetFirstPageInfo();
                    }
                    else{
                        alert(data.status);
                    }
                }).error(function(data){
                        alert("请求无响应");
                    });
                break;
        }
    }

    function changeView(id)
    {
        switch(id)
        {
            case 1:
                $scope.maintainListDiv = false;
                $scope.applyOperDiv = true;
                $scope.careListDiv = false;
                $scope.alreadyReserDiv = false;
                $scope.refuseReasonDiv = false;
                $scope.remindMileTi = false;
                $scope.remindMileTe = false;
                $scope.show1 = false;
                $scope.show2 = false;
                $scope.show3 = false;
                $scope.show4 = false;
                $scope.show5 = false;
                $scope.buttonTh = false;
                break;
            case 2:
                $scope.maintainListDiv = true;
                $scope.careListDiv = false;
                $scope.applyOperDiv = false;
                break;
            case 3:
                $scope.maintainListDiv = false;
                $scope.careListDiv = true;
                $scope.applyOperDiv = false;
                break;
        }
    }

}