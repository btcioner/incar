/**
 * Created by 003383 on 14-2-27.
 */

var app = angular.module("SParamApp", []);
app.controller("s_paramCtrl", function($scope, $http){

     $scope.paramListDiv = true;
     $scope.paramAddDiv = false;
     $scope.paramModifyDiv = false;

    //点击添加按钮
    $scope.add = function()
    {
        $scope.paramListDiv = false;
        $scope.paramAddDiv = true;
    }

    //点击修改按钮
    $scope.modify = function()
    {
        $scope.paramListDiv = false;
        $scope.paramModifyDiv = true;
    }

    //返回
    $scope.gotoBack = function(id)
    {
       switch(id)
       {
           case 1:
               $scope.paramListDiv = true;
               $scope.paramAddDiv = false;
               break;
           case 2:
               $scope.paramListDiv = true;
               $scope.paramModifyDiv = false;
               break;
       }
    }
})