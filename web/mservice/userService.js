/**
 * Created by Jesse Qu on 3/25/14.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.enroll = enrollUser;
}

function enrollUser(req, res) {

    var postData = req.body;
    var pool = this.db();

    postData.owner_flag = parseInt(postData.owner_flag);
    // console.log(postData);

    pool.query('select id from t_wx_user where openid = ?;',[postData.user], function(err, users){
        if (err) { return res.send(400, err); }
        if (users && users.length === 1) {

            return pool.query('select COUNT(*) totalRows from t_wx_user_obd where wx_user_id = ? and obd_code = ?;', [users[0].id, postData.obd_code], function(err, mappings){
                if (err) { return res.send(400, err); }
                if (mappings && mappings.length === 1) {
                    if (mappings[0].totalRows === 0) {

                        if (postData.owner_flag === 1) {
                            return pool.query('select COUNT(*) totalOwners from t_wx_user_obd where owner_flag = 1 and obd_code = ?;', [postData.obd_code], function(err, owners){
                                if (err) { return res.send(400, err); }
                                if (owners && owners.length === 1) {
                                    if (owners[0].totalOwners === 1) {
                                        return res.send(400, new Error('this obd device has already had an owner.'));
                                    }
                                    else {
                                        var sqlWithParameters = 'insert into t_wx_user_obd (wx_user_id, obd_code, owner_flag, enroll_time) values (?, ?, 1, now());';
                                        var sql = mysql.format(sqlWithParameters, [ users[0].id, postData.obd_code] );

                                        // console.log(sql);
                                        return pool.query(sql, function(err, result) {
                                            if (err) { return res.send(400, err); }
                                            return res.send(200, result);
                                        });
                                    }
                                }
                                else {
                                    return res.send(400, new Error('zero or multiple rows returned for specific wx user openid and obd_code when enrollment.'));
                                }
                            });
                        }
                        else {
                            var sqlWithParameters = 'insert into t_wx_user_obd (wx_user_id, obd_code, owner_flag, enroll_time) values (?, ?, 0, now());';
                            var sql = mysql.format(sqlWithParameters, [ users[0].id, postData.obd_code] );

                            // console.log(sql);
                            return pool.query(sql, function(err, result) {
                                if (err) { return res.send(400, err); }
                                return res.send(200, result);
                            });
                        }
                    }
                    else {
                        return res.send(400, new Error('binding is already existed for specific wx user openid and obd_code when enrollment.'));
                    }
                }
                else {
                    return res.send(400, new Error('zero or multiple rows returned for specific wx user openid and obd_code when enrollment.'));
                }
            });
        } else {
            return res.send(400, new Error('zero or multiple rows returned for one specific wx user openid when enrollment.'));
        }
    });
}
