/**
 * Created by LM on 14-6-13.
 */
var later=require("later");
var tagModel=require("../tag/tag");
function buildTagsEveryMonth(){
    //var plan = later.parse.text('on the first day of the month');
    var schedule = later.parse.text('every 10 seconds');
    console.log('------------------------------------------\n----定时器开始运行:每月第一天重算标签-----\n------------------------------------------');
    var timer = later.setInterval(function(){
        console.log('当前时间:'+new Date()+',开始重算标签....');
        tagModel._buildTag(function(err){
            if(err){
                console.log("重算失败");
                timer.clear();
            }
            else{
                console.log("重算完成");
            }
        });
    }, schedule);
}
function startActivity(startTime){
   /* //var plan = later.parse.text('at 2014-6-14 16:25 pm');
    var schedule = {schedules: [{h:[17],m:[8],s:[0,10,20,30,40,50]}]};
    console.log("Now:"+new Date());
    var timer = later.setTimeout(function(){
        console.log(new Date());
    }, schedule);*/
    var schedule1 = {
        schedules:[{D:[15],M:[6],h: [10],m:[24],s:[0,10,20,30,40,50]}]
    };
    var schedule2 = {
        schedules:[{D:[15],M:[6],h: [10],m:[24],s:[0,10,20,30,40,50]}]
    };
    later.date.localTime();
    var timer1 = later.setInterval(function(){
        console.log('later1'+new Date());
    }, schedule1);
    var timer2 = later.setInterval(function(){
        console.log('later2'+new Date());
    }, schedule2);
}
startActivity();