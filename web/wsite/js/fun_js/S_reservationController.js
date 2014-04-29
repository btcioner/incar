/**
 * Created by Liz on 14-2-27.
 */
   function s_reservationCtrl($scope, $http,$routeParams){

    $scope.reservationDiv = true;
    $scope.applyOperDiv = false;
    $scope.repairDiv = true;
    $scope.reserStatus = $routeParams;
    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.jj_reason = "";
    $scope.care_itmes = "";
    $scope.care_cost = "";
    $scope.begin_time = "";
    $scope.end_time = "";
    $scope.ownerNick="";
    $scope.ownerLicense="";
    $scope.work_time_begin="";
    $scope.queryString = "";

    GetFirstPageInfo("");
    function GetFirstPageInfo(str)
    {
        var queryStr = "";
        $scope.tips="";
        if(str!="") queryStr="&step="+str;
        $http.get(baseurl+'work/care?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+queryStr+$scope.queryString).success(function(data){
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


    //按条件筛选行车数据行车数据
    $scope.SearchDriveInfo = function()
    {
        if($scope.ownerNick=="")$scope.ownerNick="";
        if($scope.ownerLicense=="")$scope.ownerLicense="";
        if($scope.work_time_begin=="")$scope.work_time_begin="";
        $scope.queryString = "&cust_nick="+$scope.ownerNick+"&license="+$scope.ownerLicense+"&working_time_begin="+$scope.work_time_begin;
        GetFirstPageInfo("");
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
        GetFirstPageInfo("");
    }

   //详情子操作
   $scope.OperationChild = function(oper)
    {
      switch(oper)
      {
          case "approve":
              $scope.postData = {op:"approve"};
              $http.put(baseurl + 'work/care/'+$scope.id,$scope.postData).success(function(data){
                  if(data.status=="ok")
                  {
                    GetFirstPageInfo("");
                    alert("已确认");
                    changeView(2);
                  }else{
                      alert("请求无相应");
                  }
              }).error(function(data){
                 alert("请求无相应");
             })

              break;
          case "cancel":
              $scope.postData = {op:"cancel"};
              $http.put(baseurl + 'work/care/'+$scope.id,$scope.postData).success(function(data){
                  if(data.status=="ok")
                  {
                      GetFirstPageInfo("");
                      alert("已取消");
                      changeView(2);
                  }else
                  {
                      alert("请求无相应");
                  }
              }).error(function(data){
                      alert("请求无相应");
              })
              break;
          case "reject":
              $scope.rejectReason = true;
              break;
          case "done":
              $scope.ReservationInfo = true;
              break;
          case "abort":
              $scope.postData = {op:"abort",reason:"到了时间没来"};
              $http.put(baseurl + 'work/care/'+$scope.id,$scope.postData).success(function(data){
                  if(data.status=="ok")
                  {
                      GetFirstPageInfo("");
                      alert("未到店");
                      changeView(2);
                  }else{
                      alert("请求无相应");
                  }
              }).error(function(data){
                      alert("请求无相应");
              })
              break;
      }

    }

   //查看保养预约详情
   $scope.Operation = function(index,type)
   {
       changeView(1);
       $scope.careDetail = $scope.careList[index];
       $scope.id = $scope.careList[index].id;
       switch(type)
       {
           case "新申请":
              $scope.newApplyOper = true;
              break;
           case "已拒绝":
               $scope.reason = $scope.careList[index].json_args.reason;
               $scope.colspanTh = true;
               $scope.diffDiv = true;
               break;
           case "已确认":
               $scope.completeOper = true;
               break;
           case "已完成":
               $scope.done_items = $scope.careList[index].json_args.care_items;
               $scope.done_cost = $scope.careList[index].json_args.care_cost;
               $scope.done_btime =  $scope.careList[index].json_args.begin_time;
               $scope.done_etime =  $scope.careList[index].json_args.end_time;
               $scope.reservationProTi = true;
               $scope.reservationProTe = true;
               $scope.completeTr = true;
               break;
           case "未到店":
               $scope.colspanTh = true;
               break;
           case "已取消":
               $scope.cancelTime = $scope.careList[index].updated_time;
               $scope.cancelTimeTi = true;
               $scope.cancelTimeTe = true;
               break;
       }
   }

  //取消
    $scope.cancel = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.ReservationInfo = false;
                break;
            case 2:
                $scope.rejectReason = false;
                break;
        }
    }

    //确定
    $scope.confirm = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.postData = {op:"done",care_items:$scope.care_items,care_cost:$scope.care_cost,begin_time:$scope.begin_time,end_time:$scope.end_time};
                $http.put(baseurl + 'work/care/'+$scope.id,$scope.postData).success(function(data){
                    if(data.status == "ok")
                    {
                        GetFirstPageInfo("");
                        alert("已完成");
                        changeView(2);
                    }
                    else
                    {
                        alert("请求无响应");
                    }
                }).error(function(data){
                    alert("请求无相应");
                })
                break;
            case 2:
                $scope.postData={op: "reject", reason:$scope.jj_reason};
                $http.put(baseurl + 'work/care/'+$scope.id,$scope.postData).success(function(data){
                    if(data.status == "ok")
                    {
                        GetFirstPageInfo("");
                        alert("已拒绝");
                        changeView(2);
                    }
                    else{
                        alert("请求无相应");
                    }
                }).error(function(data){
                    alert("请求无相应");
                })
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
                $scope.rejectReason = false;
                $scope.colspanTh = false;
               break;
            case 2:
                $scope.reservationDiv = true;
                $scope.applyOperDiv = false;
                break;
        }
    }
    $scope.ReservationTab = function(id)
    {
        changeView(2);
        switch(id)
        {
            case 0:
                GetFirstPageInfo("");
                break;
            case 1://新申请
                GetFirstPageInfo("applied");
                break;
            case 2://已拒绝
                GetFirstPageInfo("rejected");
                break;
            case 3://已确认
                GetFirstPageInfo("approved");
                break;
            case 4://已完成
                GetFirstPageInfo("done");
                break;
            case 5://未到店
                GetFirstPageInfo("aborted");
                break;
            case 6://已取消
                GetFirstPageInfo("cancelled");
                break;
        }
    }
}