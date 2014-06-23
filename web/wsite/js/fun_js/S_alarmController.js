/**
 * Created by 003383 on 14-2-27.
 */

//保养提醒
function  s_alarmCtrl($scope,$http,$routeParams){
    $scope.maintainListDiv = true;
    $scope.operDiv = false;
    $scope.oper_button = false;
    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.working_time = "";
    $scope.reason = "";
    $scope.queryString = "";

    if($routeParams.id != null )
    {
        $scope.queryString ="&remindStatus=" + $routeParams.id
        GetFirstPageInfo();
    }
    else
    {
        GetFirstPageInfo();
    }

    function GetFirstPageInfo()
    {
        $scope.tips="";
        $scope.randomTime = new Date();
        $http.get('/alarm/'+$.cookie("s4_id")+'?page='+$scope.currentPage+'&pageSize='+$scope.pageRecord+$scope.queryString+"&t="+$scope.randomTime).success(function(data){
            $scope.alarmList = data.data;
            PagingInfo(data.rowCount );
            if($scope.alarmList.length == 0)
            {
                $scope.tips="暂无数据";
            }
            else{
               for(var i=0;i<$scope.alarmList.length;i++)
               {
                   $scope.alarmList[i].remindStatus = $.changeAlarmStatus($scope.alarmList[i].remindStatus);
               }
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
        $scope.carDetails = $scope.alarmList[index];
        switch(type)
        {
            case "新提醒":
                $scope.oper_button = true;
                break;
            case "已关怀":
                $scope.oper_button = false;
                break;
        }
    }
    //详情页面的子操作
    $scope.operationChild = function(){
          if(confirm("确定已经关怀了?"))
          {
              $http.put("/alarm/"+$scope.carDetails.id,"").success(function(data){
                if(data.status == "success")
                {
                    alert("修改成功!");
                    GetFirstPageInfo();
                    changeView(2);
                }
                  else
                {
                    alert("修改失败!");
                }
              }).error(function(data){
                alert(data.status);
              })
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

    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 1:
                changeView(2);
                break;
        }
    }

    function changeView(id)
    {
        switch(id)
        {
            case 1:
                $scope.maintainListDiv = false;
                $scope.operDiv = true;
                break;
            case 2:
                $scope.maintainListDiv = true;
                $scope.operDiv = false;
                break;
        }
    }

}