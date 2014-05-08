/**
 * Created by Jesse Qu on 5/8/14.
 */

'use strict';

var mysql = require('mysql');
// var WXAPI = require('../weixin').API;

var wxToken = {};

wxToken.getServiceToken = function(appName, callback) {

    var pool = this.db();

    var sqlWithParameters = [
        'select wx_status from t_4s ',
        'where (wx_app_name = ?);'
    ].join('');

    var sql = mysql.format(sqlWithParameters, [appName]);

    return pool.query(sql, function(err, rows){
        if (err) { return callback(err); }
        else {
            if (rows) {
                if (rows.length === 0) {
                    return callback(null, { wxServiceToken: null });
                } else if (rows.length === 1) {
                    if (rows[0].wx_status === 1) {
                        return callback(null, { wxServiceToken: 'wx_token__' + appName });
                    }
                    else {
                        return callback(null, { wxServiceToken: 0 });
                    }
                } else { return callback(new Error('multiple rows returned from a db query! - ' + sql)); }
            }
            else {
                return callback(new Error('null or undefined returned from a db query! - ' + sql));
            }
        }
    });
};

wxToken.db = require('../../config/db');

exports = module.exports = wxToken;

