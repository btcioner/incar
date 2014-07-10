/**
 * Created by Jesse Qu on 3/25/14.
 */
'use strict';

var mysql = require('mysql');

function getOrgId(db, userName, sopenid, callback) {
    console.log("username:" + userName + ":" + sopenid);
    var pool = db();
    pool.query('select id from t_4s where openid = ? ;', [sopenid], function (err, rows) {
        if (err) {
            callback(err);
        }
        else {
            if (rows && rows.length === 1) {
                callback(null, rows[0].id);
            } else {
                callback(new Error('zero or multiple rows () returned for one wx user id.'));
            }
        }
    });

}

var booking = {};

booking.getPromotionSlots = function (userName, sopenid, callback) {
    var pool = this.db();
    getOrgId(this.db, userName, sopenid, function (err, result) {
        if (err) {
            return callback(err);
        }
        pool.query('select id, slot_location location, slot_time time, benefit, description from t_promotion_slot where promotion_status = 2 and slot_time > now() and storeId = ?;', [result], function (err, rows) {
            if (err) {
                return callback(err);
            }
            return callback(null, rows);
        });
    });
};

function doBooking(pool, wx_user, slot, callback) {
    var wx_oid_at = wx_user.wx_oid.replace(':', '@');
    pool.query('insert into t_slot_booking(storeId, slot_location, slot_time, promotion_id, channel, channel_specific, booking_time, booking_status, tc, ts) values (?,?,?,?,?,?, now(), 1,?,now());',
        [wx_user.s4_id, slot.location, slot.time, slot.id, 'weixin', wx_oid_at, wx_oid_at + '@weixin'], function (err, result) {
            if (err) {
                return callback(err);
            }
            else {
                var slot_booking_id = result.insertId; // rows[0].id
                pool.query('insert into t_work (work,step,work_ref_id,org_id,cust_id,working_time,json_args,created_time) values(?,?,?,?,?,?,?,now())',
                    ['care', 'applied', slot_booking_id, wx_user.s4_id, wx_user.id, slot.time, ''],
                    function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        pool.query('update t_promotion_slot set promotion_status=4 where id=?;', [slot.id], function (err, result) {
                            if (err) return callback(err);
                            return callback(null, result);
                    });

                });
            }
        });
}

//need to insert into t_work
booking.applySlot = function (userName, sopenid, slot, callback) {
    var pool = this.db();
    console.log(slot);
    getOrgId(this.db, userName, sopenid, function (err, orgId) {
        if (err) {
            return callback(err);
        }
        else {
            pool.query('select id from t_account where wx_oid = ?', [userName + ':' + sopenid], function (err, acc_row) {
                if (err) {
                    return callback(err);
                }
                else {
                    // 2014世界杯德国7-1大胜巴西纪念日
                    if (acc_row.length === 0) {
                        // 当前用户是一个仅仅关注的用户,需要由系统自动产生一个帐号
                        var wx_user = {
                            s4_id: orgId,
                            name: 'wx_' + userName,
                            pwd: '00000000',
                            wx_oid: userName + ':' + sopenid,
                            tel_pwd: '00000000',
                            nick: '微信匿名用户'
                        };
                        pool.query("INSERT INTO t_account SET ?", [wx_user], function (ex, result) {
                            if(ex) return callback(ex);
                            else{
                                wx_user.id = result.insertId;
                                doBooking(pool, wx_user, slot, callback);
                            }
                        });
                    }
                    else{
                        var wx_user = { id:acc_row[0].id, s4_id:orgId, wx_oid: userName + ':' + sopenid };
                        doBooking(pool, wx_user, slot, callback);
                    }
                }
            });
        }
    });
};
booking.getBrand = function (sopenid, callback) {
    var pool = this.db();
    pool.query('select brand from t_4s where openid=?;', [sopenid], function (err, result) {
        if (err) callback(err);
        else {
            if (result && result.length === 1) {
                pool.query('select brand from t_car_dictionary where brandCode=?;', [result[0].brand], function (err, rows) {
                    if (err) callback(err);
                    else callback(null, rows[0].brand);
                });
            } else callback(new Error('The 4s is not exist.'))
        }
    });
}
booking.get4sDetail = function (sopenid, callback) {
    var pool = this.db();
    pool.query('select name,description,brand,logo_url,address,hotline from t_4s where openid=?;', [sopenid], function (err, result) {
        if (err) callback(err);
        else {
            if (result && result.length === 1) {
                var data = {};
                data.name = result[0].name;
                data.description = result[0].description;
                data.brand = result[0].brand;
                data.logo_url = result[0].logo_url;
                data.address = result[0].address;
                data.hotline = result[0].hotline;
                callback(null, data);
            } else callback(new Error('The 4s is not exist.'))
        }
    });
};
booking.db = require('../../config/db');

exports = module.exports = booking;

