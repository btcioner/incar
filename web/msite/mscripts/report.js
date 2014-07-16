/**
 * Created by LM on 14-8-13.
 */
function cloneJSON(para){
    var rePara = null;
    var type = Object.prototype.toString.call(para);
    if(type.indexOf("Object") > -1){
        rePara = jQuery.extend(true, {}, para);
    }else if(type.indexOf("Array") > 0){
        rePara = [];
        jQuery.each(para, function(index, obj){
            rePara.push(jQuery.cloneJSON(obj));
        });
    }else{
        rePara = para;
    }
    return rePara;
}
var config={
    credits:{
        enabled:false   //禁用版权信息
    },
    exporting:{
        enabled:false   //禁用导出
    },
    tooltip:{
        enabled:false   //禁用鼠标提示
    },
    chart: {
        type: 'column'
    },
    colors: ['#90DE69'],
    xAxis: {
        categories: ['我','大家']
    },
    yAxis: {
        type: 'linear',
        labels:{enabled:false},
        title:'',
        gridLineWidth:0
    },
    legend: {
        enabled:false
    },
    plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: true,
                color: 'white',
                style: {
                    textShadow: '0 0 3px black, 0 0 3px black'
                }
            }
        }
    }
};
var app = angular.module("reportApp", []);
app.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode(true);
}]);
app.controller("myTravelReport", function($scope, $http, $location){
    var user = $location.search().user;

    $http.get('../travelReport/loadTravelReport?user='+user).success(function(data,status,headers,cfg){
        if(data.status=='success'){
            var staInfo=data.data;
            $scope.console=staInfo;
            var allMonths=[];
            for(var monthKey in staInfo){
                allMonths.push(monthKey);
            }
            $scope.allMonths=allMonths;
            $scope.switchMonth=function(index){
                var dataMth=staInfo[$scope.allMonths[index]].dataMth;
                for(var i=0;i<dataMth.length;i++){
                    var newConfig=cloneJSON(config);
                    newConfig.title={text:dataMth[i].title};        //标题
                    newConfig.subtitle={text:dataMth[i].unit};      //单位
                    newConfig.series=[{data:dataMth[i].data}];      //内容
                    $('#main_wrap>div:eq('+i+')').highcharts(newConfig);
                }
            }
        }
        else{
            $scope.console=data.message;
        }

    });
});