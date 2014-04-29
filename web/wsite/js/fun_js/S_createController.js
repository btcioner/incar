/**
 * Created by Liz on 14-04-08.
 */

angular.module("createApp",[]).
    controller("createCtrl", function($scope, $http){
        $scope.nickName = $.cookie("nick");//保存登录进来用户的nick
})
