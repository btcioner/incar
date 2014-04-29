/**
 * Created by 003383 on 14-2-27.
 */


function  s_maintainCtrl($scope, $http){
    $scope.maintainListDiv = true;
    $scope.applyOperDiv = false;
    $scope.currentPage = 1;
    $scope.pageRecord = 10;

    GetFirstPageInfo();
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $http.get(baseurl+'organization/'+$.cookie("org_id")+'/care?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord)
            .success(function(data){
            if(data.status=="ok")
            {
                $scope.carList = data.cars;
                PagingInfo(data.totalCount);
                if($scope.carList.length == 0)
                {
                    $scope.tips="暂无数据";
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
  $scope.operationChild = function(id)
  {
      changeView(1);
      $scope.buttonTh = true;
      $scope.show1 = true;
      switch(id)
      {
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
                $scope.postData = {"op":"apply","org_id":$.cookie("org_id"),"car_id":1,"cust_id":83,"working_time":$scope.working_time}
                $http.post(baseurl+'organization/'+ $.cookie("org_id")+'/work/care',$scope.postData).success(function(data){

                }).error(function(data){
                        alert("请求无响应");
                    });
                break;
            case 2:
                $scope.refuseReasonDiv = false;
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
                $scope.applyOperDiv = false;
                break;
        }
    }
    $scope.remindStatus = function(id)
    {
        changeView(2);
        switch(id)
        {
            case 0:
                $http.get('../js/fun_js/maintainInfo1.json').success(function(data){
                    $scope.reservationList = data;
                });
                break;
            case 1://新申请
                $http.get('../js/fun_js/maintainInfo1.json').success(function(data){
                    $scope.reservationList =  data;
                });
                break;
            case 2://已拒绝
                $http.get('../js/fun_js/maintainInfo1.json').success(function(data){
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