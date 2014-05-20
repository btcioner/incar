/**
 * Created by Liz on 14-04-08.
 */


angular.module("SActivityApp").
    controller("s_activityCtrl", function($scope, $http){
    $scope.newsListDiv = true;
    $scope.newsAddDiv = false;

    //添加按钮
    $scope.add = function()
    {
        $scope.newsListDiv = false;
        $scope.newsAddDiv = true;
    }

    //添加确认
    $scope.addConfrim = function()
    {
        $scope.newsListDiv = true;
        $scope.newsAddDiv = false;
    }

   //修改按钮
    $scope.modify = function(id)
    {
        $scope.newsListDiv = false;
        $scope.newsModifyDiv = true;
    }

    //修改确认
    $scope.modifyConfirm = function(id)
    {
        $scope.newsListDiv = true;
        $scope.newsModifyDiv = false;
    }
    //预览
    $scope.preview = function(id)
    {
        $scope.newsListDiv = false;
        $scope.newsPreviewDiv = true;
    }

    //发布确认
    $scope.modifyConfirm = function(id)
    {
        $scope.newsListDiv = true;
        $scope.newsPreviewDiv = false;
    }

    $scope.cancelNews = function(id)
    {
        alert("确定要取消此活动资讯吗？");
    }

    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.newsListDiv = true;
                $scope.newsAddDiv = false;
                break;
            case 2:
                $scope.newsListDiv = true;
                $scope.newsModifyDiv = false;
                break;
            case 3:
                $scope.newsListDiv = true;
                $scope.newsPreviewDiv = false;
                break;
        }
    }
})