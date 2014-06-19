/**
 * Created by Liz on 14-2-27.
 */
//试乘试驾js
function s_repairCtrl($scope, $http,$routeParams){


    $scope.driveTryDiv = true;
    $scope.applyOperDiv = false;
    $scope.previewDiv = false;
    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.randomTime = new Date();
    $scope.queryString = "";

    if($routeParams.id != null)
    {
       $scope.queryString = "&step=" + $routeParams.id;
    }

    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $scope.randomTime = new Date();
        $http.get(baseurl+'4s/'+$.cookie("s4_id")+'/drivetry?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString+"&t="+$scope.randomTime).success(function(data){
            if(data.status == "ok")
            {
                if(data.tries.length == 0)
                {
                    $scope.tips="暂无数据";
                }
                else{
                    for(var i=0;i<data.tries.length;i++)
                    {
                        if(data.tries[i].step=="apply")
                        {
                            data.tries[i].text = "管理";
                        }
                        else
                        {
                            data.tries[i].text = "查看";
                        }
                        data.tries[i].status = $.changeWorkStatus(data.tries[i].step);
                    }
                }
                $scope.tries = data.tries;
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

//   //下拉框选择
//    $scope.ReservationTab = function(id)
//    {
//        $scope.driveTryDiv = true;
//        $scope.applyOperDiv = false;
//        $scope.previewDiv = false;
//        switch(id)
//        {
//            case 0:
//                GetFirstPageInfo();
//                break;
//            case 1://新申请
//                GetFirstPageInfo();
//                break;
//            case 2://已拒绝
//                GetFirstPageInfo();
//                break;
//            case 3://已确认
//                GetFirstPageInfo();
//                break;
//        }
//    }

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


    //查看和管理切换
    $scope.manager = function(index,status)
    {
        $scope.triesDetail = $scope.tries[index];
        $scope.id = $scope.tries[index].id;
        switch(status)
        {
            case "applied":
                $scope.driveTryDiv = false;
                $scope.applyOperDiv = true;
                $scope.previewDiv = false;
                break;
            case "approved":
                $scope.driveTryDiv = false;
                $scope.applyOperDiv = false;
                $scope.previewDiv = true;
                $scope.reasonTr =false;
                break;
            case "rejected":
                $scope.driveTryDiv = false;
                $scope.applyOperDiv = false;
                $scope.previewDiv = true;
                $scope.reasonTr =true;
                break;
        }
    }

    //详情子操作
    $scope.OperationChild = function(oper)
    {
        switch(oper)
        {
            case "approve":
                $scope.postData = {op:"approve"};
                $http.put(baseurl + 'organization/'+ $.cookie("s4_id")+'/work/drivetry/'+$scope.id,$scope.postData).success(function(data){
                    if(data.status=="ok")
                    {
                        alert("操作成功!");
                        GetFirstPageInfo();
                        $scope.driveTryDiv = true;
                        $scope.applyOperDiv = false;
                        $scope.previewDiv = false;
                    }else{
                        alert("请求无响应");
                    }
                }).error(function(data){
                        alert("请求无响应");
                    })
                break;

            case "reject":
                $scope.rejectReason = true;
                break;

        }
    }
    //确定
    $scope.confirm = function()
    {

            $scope.postData={op: "reject", reason:$scope.jj_reason};
            $http.put(baseurl + 'organization/'+ $.cookie("s4_id")+'/work/drivetry/'+$scope.id,$scope.postData).success(function(data){
                if(data.status == "ok")
                {
                    GetFirstPageInfo();
                    alert("操作成功");
                    $scope.driveTryDiv = true;
                    $scope.applyOperDiv = false;
                    $scope.previewDiv = false;
                }
                else{
                    alert("请求无响应");
                }
            }).error(function(data){
                    alert("请求无响应");
                })

     }

    //取消
    $scope.cancel = function(id)
    {
        switch(id)
        {
            case 2:
                $scope.rejectReason = false;
                break;
            case 3:
                $scope.driveTryDiv = true;
                $scope.applyOperDiv = false;
                $scope.previewDiv = false;
                break;
        }
    }
}