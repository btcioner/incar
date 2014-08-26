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
            $scope.obdCode=data.obdCode;
            $scope.sim=data.sim;
            $scope.resultShow=data.result;
            $scope.historyList=data.history;
            $scope.hisShow=[];
            $scope.resultColor=5;
            for(var i=0;i<data.history.length;i++){
                $scope.hisShow[i]=false;
                /*if(i==0){
                    $scope.hisShow[i]=true;
                }*/
            }
            $scope.showDetail=function(index){
                $scope.hisShow[index]=!$scope.hisShow[index];
            };
            $scope.detecting=function(){
                var url='../message/carDetectionSend/'+$scope.obdCode+'/'+$scope.sim;
                $http.put(url).success(function(data,status,headers,cfg){
                    alert(data);
                });
            };
        }
    });
});
app.directive(
    "bnDirective",
    function( $timeout ) {
        //将用户界面的事件绑定到$scope上
        function link( $scope, element, attributes ) {
            //当timeout被定义时，它返回一个promise对象
            var timer = $timeout(
                function() {
                    console.log( "Timeout executed", Date.now() );
                },
                2000
            );
            //将resolve/reject处理函数绑定到timer promise上以确保我们的cancel方法能正常运行
            timer.then(
                function() {
                    console.log( "Timer resolved!", Date.now() );
                },
                function() {
                    console.log( "Timer rejected!", Date.now() );
                }
            );



            //当DOM元素从页面中被移除时，AngularJS将会在scope中触发$destory事件。这让我们可以有机会来cancel任何潜在的定时器
            $scope.$on("$destroy",function( event ) {
                $timeout.cancel( timer );
            });

        }
        //返回指令的配置
        return({
            link: link,
            scope: false
        });

    }
);