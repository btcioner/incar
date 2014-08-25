/**
 * Created by LM on 14-8-25.
 */
var app = angular.module("detectionApp", []);
app.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode(true);
}]);
app.controller("myRemoteDetection", function($scope, $http, $location){
    var userStr = $location.search().user;
    var user=userStr.replace('@',':');
    $scope.resultShow="正在初始化...";
    $http.get('../message/getAllDetection?user='+user).success(function(data,status,headers,cfg){
        if(data.status=='success'){
            $scope.currentInfo=data.current;
            $scope.resultShow=data.result;
            $scope.historyList=data.history;
            $("#test").text(JSON.stringify(data));
        }
    });
});