/**
 * Created by 003383 on 14-2-27.
 */


function  s_maintainCtrl($scope, $http){
    $scope.maintainListDiv = true;
    $scope.applyOperDiv = false;
    $http.get('../js/fun_js/maintainInfo3.json').success(function(data){
        $scope.maintainList = data;
    });

    //查看保养预约详情
    $scope.Operation = function(index,type)
    {
        changeView(1);
        switch(type)
        {
            case "新提醒":
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