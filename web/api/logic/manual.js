/**
 * Created by Jesse Qu on 3/30/14.
 */
'use strict';

var mysql = require('mysql');
var config = require('./../../config/config');

var manual = {};

function trimString(strInput) {
    var	str = strInput.replace(/^\s\s*/, ''),
        ws = /\s/,
        i = str.length;
    while (ws.test(str.charAt(--i)));
    return str.slice(0, i + 1);
}

manual.retrieve = function(keyword, callback) {
    var pool = this.db();
    var pattern = '%'+ trimString(keyword) + '%';
    var sqlWithParameters = 'select title, description, filename from t_manual_content where keyword like ?;';
    var sql = mysql.format(sqlWithParameters, [pattern]);
    pool.query(sql, function(err, rows) {
        if (err) { return callback(err); }
        if (rows && rows.length !== 0) {
            var itemA = {};
            var itemB = {};
            itemA.title = rows[0].title;
            itemA.description = rows[0].description;
            itemA.picurl = config.baseUrl + '/data/manual/' + rows[0].filename;
            itemA.url = config.baseUrl + '/data/manual/' + rows[0].filename;
            itemB.title = rows[0].description;
            itemB.description = rows[0].description;
            itemB.picurl = '';
            itemB.url = config.baseUrl + '/data/manual/' + rows[0].filename;
            return callback(null, [itemA, itemB]);
        }
        else { return callback(new Error('no rows returned for the keyword you input.')); }
    });
};


manual.db = require('../../config/db');

exports = module.exports = manual;

