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
    $scope.remark = "";

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
                        if(data.tries[i].step=="applied")
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
        $scope.queryString="";
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
        $scope.driveTryDiv = false;
        $scope.applyOperDiv = false;
        $scope.previewDiv = false;
        $scope.reasonTr =false;
        $scope.diffDiv = false;
        $scope.newApplyOper = false;
        $scope.completeOper = false;
        $scope.remarkDiv = false;
        $scope.rejectReason = false;
        switch(status)
        {
            case "applied":
                $scope.applyOperDiv = true;
                $scope.newApplyOper = true;
                break;
            case "approved":
                 $scope.previewDiv = true;
//                $scope.completeOper = true;
                break;
            case "rejected":
                $scope.previewDiv = true;
                $scope.reasonTr =true;
                break;
            case "cancelled":
                $scope.previewDiv = true;
                break;
            case "done":
                $scope.previewDiv = true;
//                $scope.diffDiv = true;;
            case "aborted":
                $scope.previewDiv = true;
                break;
        }
    }

    //详情子操作
    $scope.OperationChild = function(oper)
    {
        switch(oper)
        {
            case "approve":
                if(confirm("是否已确认?"))
                {
                    $scope.postData = {op:"approve",nick:$scope.triesDetail.json_args.nick,phone:$scope.triesDetail.json_args.phone};
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
                }
                break;
            case "reject":
                $scope.jj_reason = "";
                $scope.rejectReason = true;
                break;
            case "cancel":
                if(confirm("是否确定已取消?")){
                    $scope.postData = {op:"cancel"};
                    $http.put(baseurl + 'organization/'+ $.cookie("s4_id")+'/work/drivetry/'+$scope.id,$scope.postData).success(function(data){
                        if(data.status=="ok")
                        {
                            GetFirstPageInfo();
                            alert("操作成功");
                            $scope.driveTryDiv = true;
                            $scope.applyOperDiv = false;
                            $scope.previewDiv = false;
                        }else
                        {
                            alert("请求无响应");
                        }
                    }).error(function(data){
                            alert("请求无响应");
                        })
                }
                break;
            case "abort":
                if(confirm("是否确定未到店?")){
                    $scope.postData = {op:"abort",reason:"到了时间没来"};
                    $http.put(baseurl + 'organization/'+ $.cookie("s4_id")+'/work/drivetry/'+$scope.id,$scope.postData).success(function(data){
                        if(data.status=="ok")
                        {
                            GetFirstPageInfo();
                            alert("操作成功");
                            $scope.driveTryDiv = true;
                            $scope.applyOperDiv = false;
                            $scope.previewDiv = false;
                        }else{
                            alert("请求无响应");
                        }
                    }).error(function(data){
                            alert("请求无响应");
                        })
                }
                break;
            case "done":
                $scope.remark="";
                $scope.remarkDiv = true;
                break;

        }
    }
    //确定
    $scope.confirm = function(id)
    {
        switch(id)
        {
            case 1:
                if(confirm("是否确定已完成?")){
                    $scope.postData = {op:"done",reason:$scope.remark};
                    $http.put(baseurl + 'organization/'+ $.cookie("s4_id")+'/work/drivetry/'+$scope.id,$scope.postData).success(function(data){
                        if(data.status == "ok")
                        {
                            GetFirstPageInfo();
                            alert("操作成功!");
                            $scope.driveTryDiv = true;
                            $scope.applyOperDiv = false;
                            $scope.previewDiv = false;
                        }
                        else
                        {
                            alert("请求无响应");
                        }
                    }).error(function(data){
                            alert("请求无响应");
                        })
                }
                break;
            case 2:
            if(confirm("是否已拒绝?")){
                $scope.postData={op: "reject", reason:$scope.jj_reason,nick:$scope.triesDetail.json_args.nick,phone:$scope.triesDetail.json_args.phone};
                $http.put(baseurl + 'organization/'+ $.cookie("s4_id")+'/work/drivetry/'+$scope.id,$scope.postData).success(function(data){
                    if(data.status == "ok")
                    {
                        GetFirstPageInfo();
                        alert("操作成功!");
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
                break;
        }
     }

    //取消
    $scope.cancel = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.remarkDiv = false;
                break;
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