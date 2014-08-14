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
    title:{
        style:{color:"#FFFFFF"}
    },
    subtitle:{
        style:{color:"#FFFFFF"}
    },
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
        type: 'column',
        backgroundColor:'#B5B8BB',
        borderWidth:1
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
var cache={};
var app = angular.module("reportApp", []);
app.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode(true);
}]);
function showColumns(configs){
    for(var i=0;i<configs.length;i++){
        $('#main_wrap>div:eq('+i+')').highcharts(configs[i]);
    }
}
app.controller("myTravelReport", function($scope, $http, $location){
    var userStr = $location.search().user;
    var user=userStr.replace('@',':');
    $http.get('../travelReport/loadTravelReport?user='+user).success(function(data,status,headers,cfg){
        if(data.status=='success'){
            var staInfo=data.data;
            //$scope.s4Name=staInfo.s4Name;
            var results=staInfo.results;
            var allMonths=[];
            for(var monthKey in results){
                allMonths.push(monthKey);
                var dataMth=results[monthKey].dataMth;
                cache[monthKey]=[];
                for(var i=0;i<dataMth.length;i++){
                    var newConfig=cloneJSON(config);
                    newConfig.title.text=dataMth[i].title;        //标题
                    newConfig.subtitle.text=dataMth[i].unit;      //单位
                    newConfig.series=[{data:dataMth[i].data}];      //内容
                    cache[monthKey][i]=newConfig;
                }
            }
            showColumns(cache[allMonths[allMonths.length-1]]);
            $scope.allMonths=allMonths;
            $scope.switchMonth=function(index){
                showColumns(cache[allMonths[index]]);
            }
        }
        else{
            $('#main_wrap>div:eq(0)').html(data.message);
        }

    });
});