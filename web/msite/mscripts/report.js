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
    colors: ['#85BB43','#F4AC20'],
    chart: {
        type: 'column',
        backgroundColor:'#DADCE2',
        borderColor:'#F8F8F8',
        borderWidth:1
    },
    title:{
        style:{color:"#77787C",fontSize:14}
    },
    subtitle:{
        style:{color:"#A1A2A6"}
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
    xAxis: {
        type: 'category'
    },
    yAxis: {
        type: 'linear',
        labels:{enabled:false},
        title:'',
        gridLineWidth:0
    },
    legend: {
        enabled: false
    },
    plotOptions: {
        series: {
            borderWidth: 1,
            dataLabels: {
                enabled: true
            }
        }
    }
};
/*var config={
    title:{
        style:{color:"#77787C"}
    },
    subtitle:{
        style:{color:"#A1A2A6"}
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
        backgroundColor:'#DADCE2',
        borderColor:'#F8F8F8',
        borderWidth:1
    },
    colors: ['#85BB43','#F4AC20'],
    xAxis: {
        categories: ['我','大家'],
        lineColor: '#FFFFFF'
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
    },
    plotOptions: {
        series: {
            borderWidth: 0,
            dataLabels: {
                enabled: true,
                inside:true
            }
        }
    }
};*/
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
                    newConfig.series=[{colorByPoint: true,data:dataMth[i].data}];    //内容
                    cache[monthKey][i]=newConfig;
                }
            }
            showColumns(cache[allMonths[allMonths.length-1]]);
            $scope.allMonths=allMonths;
            $scope.selectedRow=allMonths.length-1;
            $('#menu_box>ul.menu>li>a:eq('+(allMonths.length-1)+')').addClass("highlights");
            $scope.switchMonth=function(index){
                $scope.selectedRow=index;
                showColumns(cache[allMonths[index]]);
            }
        }
        else{
            $scope.noData=true;
        }

    });
});