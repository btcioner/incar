/**
 * Created by Jesse Qu on 3/26/14.
 */

"use strict";

var mysql = require('mysql');
var util = require('util');

exports = module.exports = function() {
    if (! global.poolInCar) {

        var host = process.env.MySQLHost || '42.159.152.121';
        var user = process.env.MySQLUser || 'incarapp';
        var pwd = process.env.MySQLPwd || 'nodejs4WMQ';

        var dbname = process.env.MySQLDatabase || 'incar';

        var args = {
            host: host,
            user: user,
            password: pwd,
            database: dbname,
            timezone: '0000'
        };
        global.poolInCar = mysql.createPool(args);
        console.log(util.format("MySQL: %s@%s/%s", args.user, args.host, args.database));

        // 不知什么原因,每过几分钟,客户端就会lost connection
        // 临时解决办法,每过一段时间,随便发点什么给数据库
        // 使用其它语言编写的客户端连接Azure中的虚拟机也会出现此问题
        // 但连接Ali云上的虚拟机并不发生此问题,所以
        // 非常有可能是Azure平台的防火墙或是负载均衡中的设置强制断开5分钟没有数据的TCP连接
        // 参考 http://social.msdn.microsoft.com/Forums/silverlight/en-US/04589d2d-4acb-4f86-a2d0-957dc2a73a4f/endpoints-not-working-dns-scans-them
        setInterval(function(){
            var pool = global.poolInCar;
            pool.query("SELECT id FROM t_4s LIMIT 1", null, function(ex, result){});
        }, 120*1000);

        if(process.env.TraceSQL)
            console.info("设置环境变量TraceSQL=false即可关闭SQL输出");
        else
            console.info("设置环境变量TraceSQL=true可以开启SQL输出");
    }
    return global.poolInCar;
};
