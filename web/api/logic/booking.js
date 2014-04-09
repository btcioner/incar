/**
 * Created by Jesse Qu on 3/25/14.
 */
'use strict';

var mysql = require('mysql');

function getOrgId(db, userName, callback) {
    var pool = db();
    pool.query('select sopenid from t_wx_user where openid = ?;',[userName], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                pool.query('select orgId from t_wx_service_account where openid = ?;',[rows[0].sopenid], function(err, rows){
                    if (err) { callback(err); }
                    else {
                        if (rows && rows.length === 1) {
                            callback(null, rows[0].orgId);
                        } else { callback(new Error('zero or multiple rows () returned for one wx user id.')); }
                    }
                });
            } else {
                callback(new Error('zero or multiple rows(sopenid) returned for one wx user openid.'));
            }
        }
    });
}

var booking = {};

booking.getPromotionSlots = function(userName, callback) {
    var pool = this.db();
    getOrgId(this.db, userName, function(err, result) {
        if (err) { return callback(err); }
        pool.query('select id, slot_location location, slot_time time, benefit, description from t_promotion_slot where promotion_status = 1 and promotion_time < now() and storeId = ?;', [result], function(err, rows) {
            if (err) { return callback(err); }
            return callback(null, rows);
        });
    });
};

booking.applySlot = function(userName, slot, callback) {
    var pool = this.db();
    console.log(slot);
    getOrgId(this.db, userName, function(err, orgId) {
        if (err) { return callback(err); }
        pool.query('insert into t_slot_booking(storeId, slot_location, slot_time, promotion_id, channel, channel_specific, booking_time, booking_status, tc, ts) values (?,?,?,?,?,?, now(), 1,?,now());', [orgId, slot.location, slot.time, slot.id, 'weixin', userName, userName+'@weixin'], function(err, result) {
            if (err) { return callback(err); }
            return callback(null, result);
        });
    });
};


booking.db = require('../../config/db');

exports = module.exports = booking;

