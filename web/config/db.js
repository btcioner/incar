/**
 * Created by Jesse Qu on 3/26/14.
 */

"use strict";

var mysql = require('mysql');

exports = module.exports = function() {
    if (! global.poolInCar) {

        var host = process.env.MySQLHost || '42.159.156.49';
        var user = process.env.MySQLUser || 'incarapp';
        var pwd = process.env.MySQLPwd || 'nodejs4WMQ';

        var dbname = process.env.MySQLDatabase || 'incarex';

        global.poolInCar = mysql.createPool({
            host: host,
            user: user,
            password: pwd,
            database: dbname,
            timezone: '-0800'
        });
    }
    return global.poolInCar;
};
