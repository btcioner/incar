/**
 * Created by Jesse Qu on 3/26/14.
 */

"use strict";

var mysql = require('mysql');

exports = module.exports = function() {
    if (! global.poolInCar) {

        var host = process.env.INCAR_MySQLHost || '114.215.172.92';
        var user = process.env.INCAR_MySQLUser || 'incarapp';
        var pwd = process.env.INCAR_MySQLPwd || 'nodejs4WMQ';

        var dbname = process.env.INCAR_MySQLDatabase || 'incardev';

        global.poolInCar = mysql.createPool({
            host: host,
            user: user,
            password: pwd,
            database: dbname,
            timezone: '0000'
        });
    }
    return global.poolInCar;
};
