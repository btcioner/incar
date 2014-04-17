/**
 * Created by Liz on 14-2-27.
 */
   function s_reservationCtrl($scope, $http,$routeParams){

    $scope.reservationDiv = true;
    $scope.applyOperDiv = false;
    $scope.repairDiv = true;
    $scope.reserStatus = $routeParams;

    $http.get('../js/fun_js/maintainInfo.json').success(function(data){
        $scope.reservationList = data;
      //  getCurrentRecord(data);
    });


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
    $scope.ReservationTab = function(id)
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