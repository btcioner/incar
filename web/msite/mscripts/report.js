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

    $scope.tips = "";
    $scope.cover_show = false;
    $scope.upbox_show = false;

    $scope.closeUpbox = function(){
        $scope.tips = "";
        $scope.cover_show = false;
        $scope.upbox_show = false;
    }
    $scope.openUpbox = function(tips){

        $scope.tips = tips;
        $scope.cover_show = true;
        $scope.upbox_show = true;
    }

    countPageClick("1","5", userStr);//原文点击记录

    //原文点击记录--by jl 07/21/14
    function countPageClick  (countType,pageId,wx_oid){
        $http.post('/mservice/countData', {countType:countType,pageId:pageId,wx_oid:wx_oid})
            .success(function(data){
                if(data.status == "ok")
                {
                    console.log(data.status);
                }else{
                    $scope.openUpbox(data.status);
                }
            })
            .error(function(data){
                $scope.openUpbox(data.status);
            });
    };

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
//            $scope.openUpbox("亲，每月一日产生上月报告，现在没有你的用车报告!");
            $scope.noData=true;

        }

    });
});

var wxShare = function(){
    var base = window.location.href.match(/\w+:\/\/[^\/]+/);
    var pic = $("meta[name=wx-share-pic]").attr("content");
    WeixinJSBridge.on("menu:share:timeline", function(argv){
        var dataShared = {
            img_url:base + pic,
            link:window.location.href,
            title:$("title").text(),
            desc:''
        };
        WeixinJSBridge.invoke("shareTimeline", dataShared);
    });

    WeixinJSBridge.on("menu:share:appmessage", function(argv){
        var dataShared = {
            img_url:base + pic,
            link:window.location.href,
            title:$("title").text(),
            desc:''
        };
        WeixinJSBridge.invoke("sendAppMessage", dataShared);
    });

    WeixinJSBridge.on("menu:share:weibo", function(argv){
        var dataShared = {
            url:window.location.href,
            content:$("title").text()
        };
        WeixinJSBridge.invoke("shareWeibo", dataShared);
    });
};

// 微信分享
if(typeof WeixinJSBridge !== "undefined"){
    wxShare();
}
else{
    $(document).on("WeixinJSBridgeReady", function(){
        wxShare();
    });
}