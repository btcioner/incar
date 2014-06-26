/**
 * Created by Liz on 14-03-25.
 */


 function s_specialStationCtrl($scope,$http,$routeParams) {

    $scope.slotListDiv = true;
    $scope.slotAddDiv = false;
    $scope.slotModifyDiv = false;

    $scope.currentPage = 1;
    $scope.pageRecord = 10;

    $scope.queryString = "";
    if($routeParams.id !=null)
    {
        $scope.queryString ="&status="+$routeParams.id;
    }

    function initAddData()
    {
        $scope.slot_location = "";
        $scope.slot_time = "";
        $scope.benefit = "";
        $scope.description = "";
        $scope.promotion_time = "";
    }
    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $scope.randomTime = new Date();
        $http.get(baseurl+'organization/'+ $.cookie("s4_id")+'/promotionslot?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString+"&t="+$scope.randomTime).success(function(data){
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
                        if( $scope.slots[i].promotion_status !=1)
                        {
                            $scope.slots[i].tdStyle1 = false;
                            $scope.slots[i].tdStyle2 = true;
                        }
                        else{
                            $scope.slots[i].tdStyle1 = true;
                            $scope.slots[i].tdStyle2=false;
                        }
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

    //修改
    $scope.modify = function(index){

        $scope.slotListDiv = false;
        $scope.slotModifyDiv = true;
        $scope.slotDetail = $scope.slots[index];
    }

    //修改确认
    $scope.ModifyConfirm = function()
    {
        $scope.slotDetail.promotion_status = $.changeSlotStatusToNum($scope.slotDetail.promotion_status);
        $scope.postData ={
            "slot_location":$scope.slotDetail.slot_location,
            "slot_time":$scope.slotDetail.slot_time,
            "benefit":$scope.slotDetail.benefit,
            "description":$scope.slotDetail.description,
            "promotion_time":$scope.slotDetail.promotion_time,
            "promotion_status": $scope.slotDetail.promotion_status
        };
        $http.put(baseurl + 'organization/'+$scope.slotDetail.storeId+'/promotionslot/'+$scope.slotDetail.id, $scope.postData).success(function(data){
            if(data.status == "ok")
            {
                alert("修改成功");
                GetFirstPageInfo();
                $scope.slotListDiv = true;
                $scope.slotModifyDiv = false;
            }
            else{
                alert(data.status);
            }
        }).error(function(data){
                alert("请求没响应");
         });
    }

    //添加按钮
    $scope.add = function(){
//        $('#datetimepicker').datetimepicker({
//            format: 'yyyy-MM-dd hh:mm:ss'
//        });
//        $('#datetimepicker1').datetimepicker({
//            format: 'yyyy-MM-dd hh:mm:ss'
//        });
        initAddData();
        $scope.slotListDiv = false;
        $scope.slotAddDiv = true;
    }

    //添加确认
    $scope.AddConfirm = function()
    {
       $scope.postData ={
            "slot_location":$scope.slot_location,
            "slot_time":$scope.slot_time,
            "benefit":$scope.benefit,
            "description":$scope.description,
            "promotion_time":$scope.promotion_time,
            "promotion_status":1,
            "tc":"",
            "ts":$.changeDate_1(new Date())
            };
        $http.post(baseurl + 'organization/'+ $.cookie("s4_id")+'/promotionslot',$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                alert("添加成功！");
                   GetFirstPageInfo();
                $scope.slotListDiv = true;
                $scope.slotAddDiv = false;

            }
            else{
                alert(data.status);
            }
        }).error(function(data){
                alert("请求没响应");
        })
    }

    //返回按钮
    $scope.gotoBack = function(id)
    {
        $scope.slotListDiv = true;
        switch(id)
        {
            case 2:
                $scope.slotAddDiv = false;
                break;
            case 1:
                $scope.slotModifyDiv = false;
                break;
        }
    }

    //delete function
    $scope.delete = function(index){
        if(confirm("确定要删除吗？")){
            $http.delete(baseurl + 'organization/'+$scope.slots[index].storeId+'/promotionslot/'+$scope.slots[index].id).success(function(data){
                if(data.status == "ok")
                {
                    alert("删除成功！");
                    $scope.slots.splice(index, 1);
                    PagingInfo( $scope.totalCount-1);
                }
                else{
                    alert(data.status);
                }
            }).error(function(data){
                    alert("请求没响应");
                });
        }
    }

}