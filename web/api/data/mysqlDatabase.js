/**
 * Created by Jesse Qu on 3/20/14.
 */

'use strict';

var mysql = require('mysql');

var db = {};

(function (database) {
    function RetrievePool() {
        if (! global.poolInCar) {

            var host = process.env.MySQLHost || 'linuxsrv.winphone.us';
            var user = process.env.MySQLUser || 'incarapp';
            var pwd = process.env.MySQLPwd || 'nodejs4WMQ';

            var dbname = process.env.MySQLDatabase || 'incar';

            global.poolInCar = mysql.createPool({
                host: host,
                user: user,
                password: pwd,
                database: dbname
            });
        }
        return global.poolInCar;
    }

    database.RetrievePool = RetrievePool;

})(db);

// Expose the dataAccess object
exports = module.exports = db;


