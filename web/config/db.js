/**
 * Created by Jesse Qu on 3/26/14.
 */

"use strict";

var mysql = require('mysql');

exports = module.exports = function() {
    if (! global.poolInCar) {

        var host = process.env.MySQLHost || '42.159.152.121';
        var user = process.env.MySQLUser || 'incarapp';
        var pwd = process.env.MySQLPwd || 'nodejs4WMQ';

        var dbname = process.env.MySQLDatabase || 'incar';

        global.poolInCar = mysql.createPool({
            host: host,
            user: user,
            password: pwd,
            database: dbname,
            timezone: '0000'
        });

        // 不知什么原因,每过几分钟,客户端就会lost connection
        // 临时解决办法,每过一段时间,随便发点什么给数据库
        setInterval(function(){
            var pool = global.poolInCar;
            pool.query("SELECT id FROM t_4s WHERE 1 = 2 LIMIT 1", null, function(ex, result){});
        }, 120*1000);
    }
    return global.poolInCar;
};
