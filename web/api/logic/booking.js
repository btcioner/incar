/**
 * Created by Jesse Qu on 3/25/14.
 */
'use strict';

var mysql = require('mysql');

function getOrgId(db, userName, callback) {
    console.log("username:"+userName);
    var pool = db();
    pool.query('select s4_id from t_account where wx_oid like ?;',["%"+userName+"%"], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                         callback(null, rows[0].s4_id);
                        } else { callback(new Error('zero or multiple rows () returned for one wx user id.')); }
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
        pool.query('insert into t_slot_booking(storeId, slot_location, slot_time, promotion_id, channel, channel_specific, booking_time, booking_status, tc, ts) values (?,?,?,?,?,?, now(), 1,?,now());',
            [orgId, slot.location, slot.time, slot.id, 'weixin', userName, userName+'@weixin'], function(err, result) {
            if (err) { return callback(err); }
            return callback(null, result);
        });
    });
};
booking.getBrand=function(sopenid,callback){
    var pool = this.db();
    pool.query('select brand from t_4s where openid=?;',[sopenid],function(err,result){
         if(err) callback(err);
        else {
             if(result&&result.length===1) {
                 pool.query('select brand from t_car_dictionary where brandCode=?;',[result[0].brand],function(err,rows){
                         if(err) callback(err);
                         else callback(null,rows[0].brand);
                 });
             }else callback(new Error('The 4s is not exist.'))
              }
    });
}

booking.db = require('../../config/db');

exports = module.exports = booking;

