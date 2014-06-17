/**
 * Created by Liz on 14-03-25.
 */

//4s店设置页面
function s_systemCtrl($scope, $http){
    $scope.modifyDiv = false;
    $scope.settingListDiv = true;

    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.randomTime = new Date();
         $http.get(baseurl + "4s/"+ $.cookie("s4_id")+"?t="+$scope.randomTime).success(function(data){
            $scope.s4 = data.s4;
         }).error(function(data){
           alert("请求无响应！");
        });
    }

    //修改
    $scope.modify = function()
    {
        $("#formId_edit2").ajaxForm(function(data){
            $scope.s4.logo_url = data.split("</pre>")[0].split(">")[1].split("\"")[9];
        });
        $scope.modifyDiv = true;
        $scope.settingListDiv = false;
    }
    //保存修改
    $scope.modifyConfirm = function()
    {
        $http.put(baseurl + "4s/"+ $.cookie("s4_id"),$scope.s4).success(function(data){
           if(data.status == "ok")
           {
               alert("修改成功!");
               GetFirstPageInfo();
               $scope.modifyDiv = false;
               $scope.settingListDiv = true;
           }
        }).error(function(data){
                alert("请求无响应！");
        });
    }

    //返回or取消
    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.modifyDiv = false;
                $scope.settingListDiv = true;
            break;
        }
    }
}
