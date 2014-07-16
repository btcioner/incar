/**
 * Created by Jesse Qu on 3/21/14.
 */
/**
 * Modified  by Zhoupeng on 5/12/14.
 */
'use strict';

var ejs = require('ejs');
//var fuel = require('./fuel');
//var drive = require('./drive');
//var carbon = require('./carbon');
var myDrive = require('./myDrive');
var myCar = {};

 /*myCar.fuelReport = function(userName, serverName, callback){
    // 模板将来要从数据库来读取
    var tpl = [
        '最近一次驾驶：\n',
        '    平均油耗 <%=fuelDataLastTime.fuel %> 升/百公里\n',
        '    行驶里程 <%=fuelDataLastTime.mileage %> 公里\n',
        '    总计油耗 <%=fuelDataLastTime.totalFuel %> 升\n',
        '\n',
        '本周驾驶：\n',
        '    平均油耗 <%=fuelDataLastWeek.fuel %> 升/百公里\n',
        '    行驶里程 <%=fuelDataLastWeek.mileage %> 公里\n',
        '    总计油耗 <%=fuelDataLastWeek.totalFuel %> 升\n',
        '\n',
        '本月驾驶：\n',
        '    平均油耗 <%=fuelDataLastMonth.fuel %> 升/百公里\n',
        '    行驶里程 <%=fuelDataLastMonth.mileage %> 公里\n',
        '    总计油耗 <%=fuelDataLastMonth.totalFuel %> 升\n',
        '\n'
    ].join('');

    var compiled = ejs.compile(tpl);

    fuel.getReport(userName, serverName, function(err, result) {
        if (err) { callback(err);}
        else {
            if (result.fuelDataLastTime.fuel !== undefined && result.fuelDataLastTime.fuel !== null) { result.fuelDataLastTime.fuel = result.fuelDataLastTime.fuel.toFixed(2); }
            if (result.fuelDataLastTime.mileage !== undefined && result.fuelDataLastTime.mileage !== null) { result.fuelDataLastTime.mileage = result.fuelDataLastTime.mileage.toFixed(2); }
            if (result.fuelDataLastTime.totalFuel !== undefined && result.fuelDataLastTime.totalFuel !== null) { result.fuelDataLastTime.totalFuel = result.fuelDataLastTime.totalFuel.toFixed(2); }
            if (result.fuelDataLastWeek.fuel !== undefined && result.fuelDataLastWeek.fuel !== null) { result.fuelDataLastWeek.fuel = result.fuelDataLastWeek.fuel.toFixed(2); }
            if (result.fuelDataLastWeek.mileage !== undefined && result.fuelDataLastWeek.mileage !== null) { result.fuelDataLastWeek.mileage = result.fuelDataLastWeek.mileage.toFixed(2); }
            if (result.fuelDataLastWeek.totalFuel !== undefined && result.fuelDataLastWeek.totalFuel !== null) { result.fuelDataLastWeek.totalFuel = result.fuelDataLastWeek.totalFuel.toFixed(2); }
            if (result.fuelDataLastMonth.fuel !== undefined && result.fuelDataLastMonth.fuel !== null) { result.fuelDataLastMonth.fuel = result.fuelDataLastMonth.fuel.toFixed(2); }
            if (result.fuelDataLastMonth.mileage !== undefined && result.fuelDataLastMonth.mileage !== null) { result.fuelDataLastMonth.mileage = result.fuelDataLastMonth.mileage.toFixed(2); }
            if (result.fuelDataLastMonth.totalFuel !== undefined && result.fuelDataLastMonth.totalFuel !== null) { result.fuelDataLastMonth.totalFuel = result.fuelDataLastMonth.totalFuel.toFixed(2); }
            callback(null, compiled(result));
        }
    });
};
*/
/*
myCar.carbonReport = function(userName, serverName, callback){
    // 模板将来要从数据库来读取
    var tpl = [
        '最近一次行驶碳排放参考量为：<%=carbonDataLastTime.carbon %>kg\n',
        '\n',
        '本周行驶碳排放总量参考量为：<%=carbonDataLastWeek.carbon %>kg\n',
        '                优于其他<%=carbonDataLastWeek.percentage %>%车主\n',
        '\n',
        '本月行驶碳排放总量参考量为：<%=carbonDataLastMonth.carbon %>kg\n',
        '                优于其他<%=carbonDataLastWeek.percentage %>车主\n',
        '\n'
    ].join('');

    var compiled = ejs.compile(tpl);

    carbon.getReport(userName, serverName, function(err, result) {
        if (err) { callback(err);}
        else {
            if (result.carbonDataLastTime.carbon !== undefined && result.carbonDataLastTime.carbon !== null) { result.carbonDataLastTime.carbon = result.carbonDataLastTime.carbon.toFixed(2); }
            if (result.carbonDataLastWeek.carbon !== undefined && result.carbonDataLastWeek.carbon !== null) { result.carbonDataLastWeek.carbon = result.carbonDataLastWeek.carbon.toFixed(2); }
            if (result.carbonDataLastMonth.carbon !== undefined && result.carbonDataLastMonth.carbon !== null) { result.carbonDataLastMonth.carbon = result.carbonDataLastMonth.carbon.toFixed(2); }

            if (result.carbonDataLastWeek.carbon === 0.00)
                result.carbonDataLastWeek.percentage = 100;
            if (result.carbonDataLastMonth.carbon === 0.00)
                result.carbonDataLastMonth.percentage = 100;

            callback(null, compiled(result));
        }
    });
};
*/
/*
myCar.driveBehaviorReport = function(userName, serverName, callback){
    // 模板将来要从数据库来读取
    var tpl = [
        '最近一次驾驶：\n',
        '    急加速次数 <%=speedupLatestTime%> 次\n',
        '    急减速次数 <%=speeddownLatestTime%> 次\n',
        '    急转弯次数 <%=turnLatestTime%> 次\n',
        '\n',
        '本周驾驶：\n',
        '    急加速次数 <%=speedupLatestWeek%> 次\n',
        '    急减速次数 <%=speeddownLatestWeek%> 次\n',
        '    急转弯次数 <%=turnLatestWeek%> 次\n',
        '\n',
        '本月驾驶：\n',
        '    急加速次数 <%=speedupLatestMonth%> 次\n',
        '    急减速次数 <%=speeddownLatestMonth%> 次\n',
        '    急转弯次数 <%=turnLatestMonth%> 次\n',
        '\n'
    ].join('');

    var compiled = ejs.compile(tpl);

    drive.getReport(userName, serverName, function(err, result) {
        if (err) { callback(err);}
        else {
            callback(null, compiled(result));
        }
    });
};
*/
myCar.myDriveReport= function(userName, serverName, callback){
    var tpl = [
        '最近一次驾驶：\n\n',
        '    平均油耗 <%=fuelDataLastTime.fuel %> 升/百公里\n',
        '    行驶里程 <%=fuelDataLastTime.mileage %> 公里\n',
        '    总计油耗 <%=fuelDataLastTime.totalFuel %> 升\n',
        '\n',
       /* '本周驾驶：\n',
        '    平均油耗 <%=fuelDataLastWeek.fuel %> 升/百公里\n',
        '    行驶里程 <%=fuelDataLastWeek.mileage %> 公里\n',
        '    总计油耗 <%=fuelDataLastWeek.totalFuel %> 升\n',
        '\n',
        '本月驾驶：\n',
        '    平均油耗 <%=fuelDataLastMonth.fuel %> 升/百公里\n',
        '    行驶里程 <%=fuelDataLastMonth.mileage %> 公里\n',
        '    总计油耗 <%=fuelDataLastMonth.totalFuel %> 升\n',
        '\n',*/
        //  '最近一次行驶' +
            '    碳排放参考量为：<%=carbonDataLastTime.carbon %>kg\n',
        '\n',
       /* '本周行驶碳排放总量参考量为：<%=carbonDataLastWeek.carbon %>kg\n',
        '                优于其他<%=carbonDataLastWeek.percentage %>%车主\n',
        '\n',
        '本月行驶碳排放总量参考量为：<%=carbonDataLastMonth.carbon %>kg\n',
        '                优于其他<%=carbonDataLastWeek.percentage %>%车主\n',
        '\n',
        '最近一次驾驶：\n',*/
        '    急加速次数 <%=speedupLatestTime%> 次\n',
        '    急减速次数 <%=speeddownLatestTime%> 次\n',
        '    急转弯次数 <%=turnLatestTime%> 次\n',
        /*'\n',
        '本周驾驶：\n',
        '    急加速次数 <%=speedupLatestWeek%> 次\n',
        '    急减速次数 <%=speeddownLatestWeek%> 次\n',
        '    急转弯次数 <%=turnLatestWeek%> 次\n',
        '\n',
        '本月驾驶：\n',
        '    急加速次数 <%=speedupLatestMonth%> 次\n',
        '    急减速次数 <%=speeddownLatestMonth%> 次\n',
        '    急转弯次数 <%=turnLatestMonth%> 次\n',
        '\n'*/
    ].join('');
    var compiled = ejs.compile(tpl);

    myDrive.getReport(userName, serverName, function(err, result) {
        if (err) { callback(err);}
        else {
            if (result.fuelDataLastTime.fuel !== undefined && result.fuelDataLastTime.fuel !== null) {
                result.fuelDataLastTime.fuel /= 100; // 原单位为 升/万千米
                result.fuelDataLastTime.fuel = result.fuelDataLastTime.fuel.toFixed(2);
            }
            if (result.fuelDataLastTime.mileage !== undefined && result.fuelDataLastTime.mileage !== null) {
                result.fuelDataLastTime.mileage /= 1000; // 原单位为 米
                result.fuelDataLastTime.mileage = result.fuelDataLastTime.mileage.toFixed(2);
            }
            if (result.fuelDataLastTime.totalFuel !== undefined && result.fuelDataLastTime.totalFuel !== null) {
                result.fuelDataLastTime.totalFuel /= 10000000; // 原单位为 千万分之一升
                result.fuelDataLastTime.totalFuel = result.fuelDataLastTime.totalFuel.toFixed(2);
            }
           // if (result.fuelDataLastWeek.fuel !== undefined && result.fuelDataLastWeek.fuel !== null) { result.fuelDataLastWeek.fuel = result.fuelDataLastWeek.fuel.toFixed(2); }
            //if (result.fuelDataLastWeek.mileage !== undefined && result.fuelDataLastWeek.mileage !== null) { result.fuelDataLastWeek.mileage = result.fuelDataLastWeek.mileage.toFixed(2); }
           // if (result.fuelDataLastWeek.totalFuel !== undefined && result.fuelDataLastWeek.totalFuel !== null) { result.fuelDataLastWeek.totalFuel = result.fuelDataLastWeek.totalFuel.toFixed(2); }
           // if (result.fuelDataLastMonth.fuel !== undefined && result.fuelDataLastMonth.fuel !== null) { result.fuelDataLastMonth.fuel = result.fuelDataLastMonth.fuel.toFixed(2); }
            //if (result.fuelDataLastMonth.mileage !== undefined && result.fuelDataLastMonth.mileage !== null) { result.fuelDataLastMonth.mileage = result.fuelDataLastMonth.mileage.toFixed(2); }
            //if (result.fuelDataLastMonth.totalFuel !== undefined && result.fuelDataLastMonth.totalFuel !== null) { result.fuelDataLastMonth.totalFuel = result.fuelDataLastMonth.totalFuel.toFixed(2); }
            if (result.carbonDataLastTime.carbon !== undefined && result.carbonDataLastTime.carbon !== null) {
                result.carbonDataLastTime.carbon /= 100000; // 原单位为 十万分之一千克
                result.carbonDataLastTime.carbon = result.carbonDataLastTime.carbon.toFixed(2);
            }
            //if (result.carbonDataLastWeek.carbon !== undefined && result.carbonDataLastWeek.carbon !== null) { result.carbonDataLastWeek.carbon = result.carbonDataLastWeek.carbon.toFixed(2); }
           // if (result.carbonDataLastMonth.carbon !== undefined && result.carbonDataLastMonth.carbon !== null) { result.carbonDataLastMonth.carbon = result.carbonDataLastMonth.carbon.toFixed(2); }

           // if (result.carbonDataLastWeek.carbon === 0.00)
           //     result.carbonDataLastWeek.percentage = 100;
          //  if (result.carbonDataLastMonth.carbon === 0.00)
           //     result.carbonDataLastMonth.percentage = 100;

            callback(null, compiled(result));
        }
    });
}
myCar.myDriveRecord= function(userName, serverName, callback){
    var tpl = [
        '点击查看所有行车记录'
    ].join('');
    var compiled = ejs.compile(tpl);

    callback(null, compiled({}));
}
exports = module.exports = myCar;