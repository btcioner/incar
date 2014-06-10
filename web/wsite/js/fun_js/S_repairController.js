/**
 * Created by Liz on 14-2-27.
 */

function s_repairCtrl($scope, $http,$routeParams){

    $scope.reservationDiv = true;
    $scope.applyOperDiv = false;
    $scope.repairDiv = true;
    $scope.reserStatus = $routeParams;

    $scope.currentPage = 1;
    $scope.pageRecord = 10;

    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $http.get(baseurl+'organization/'+ $.cookie("s4_id")+'/promotionslot?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord).success(function(data){
            if(data.status == "ok")
            {
                $scope.slots = data.slots;
                if(data.slots.length == 0)
                {
                    $scope.tips="暂无数据！";
                }
                else
                {
                    for(var i =0;i<data.slots.length;i++)
                    {
                        $scope.slots[i].slot_time = $.changeDate($scope.slots[i].slot_time);
                        $scope.slots[i].promotion_time = $.changeDate($scope.slots[i].promotion_time);
                        $scope.slots[i].promotion_status = $.changeSlotStatus($scope.slots[i].promotion_status);
                    }
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
        GetFirstPageInfo()
    }

    //查看保养预约详情
    $scope.Operation = function(index,type)
    {
        changeView(1);
        switch(type)
        {
            case "新申请":
                $scope.newApplyOper = true;
                break;
            case "已拒绝":
                $scope.diffDiv = true;
                break;
            case "已确认":
                $scope.completeOper = true;
                break;
            case "已完成":
                $scope.reservationProTi = true;
                $scope.reservationProTe = true;
                $scope.completeTr = true;
                break;
            case "未到店":
                break;
            case "已取消":
                $scope.cancelTimeTi = true;
                $scope.cancelTimeTe = true;
                break;
        }
    }

    //详情里面的操作
    $scope.OperationChild = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.ReservationInfo = true;
                break;
        }
    }

    $scope.cancel = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.ReservationInfo = false;
                break;
        }
    }

    function changeView(id)
    {
        switch(id)
        {
            case 1:
                $scope.reservationDiv = false;
                $scope.applyOperDiv = true;
                $scope.ReservationInfo = false;
                $scope.newApplyOper = false;
                $scope.completeOper = false;
                $scope.diffDiv = false;
                $scope.reservationProTi = false;
                $scope.reservationProTe = false;
                $scope.completeTr = false;
                $scope.cancelTimeTi = false;
                $scope.cancelTimeTe = false;
                break;
            case 2:
                $scope.reservationDiv = true;
                $scope.applyOperDiv = false;
                break;
        }
    }
    $scope.RepairTab = function(id)
    {
        changeView(2);
        switch(id)
        {
            case 0:
                $http.get('../js/fun_js/maintainInfo.json').success(function(data){
                    $scope.reservationList = data;
                });
                break;
            case 1://新申请
                $http.get('../js/fun_js/maintainInfo1.json').success(function(data){
                    $scope.reservationList =  data;
                });
                break;
            case 2://已拒绝
                $http.get('../js/fun_js/maintainInfo2.json').success(function(data){
                    $scope.reservationList =  data;
                });
                break;
            case 3://已确认
                break;
            case 4://已完成
                break;
            case 5://未到店
                break;
            case 6://已取消
                break;
        }
    }
}