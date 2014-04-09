/**
 * Created by C2 on 3/29/14.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.slotBooking = slotBooking;
}

function slotBooking(req, res) {

    var self = this;
    var postData = req.body;

    postData.bookingDate = new Date(Date.parse(postData.bookingDate));
    postData.bookingTime = new Date(Date.parse(postData.bookingTime));
    postData.timeSlot = new Date(postData.bookingDate.getFullYear(),postData.bookingDate.getMonth(),postData.bookingDate.getDate(),postData.bookingTime.getHours(), postData.bookingTime.getMinutes(), postData.bookingTime.getSeconds());
    delete postData.bookingDate;
    delete postData.bookingTime;
    console.log(postData);

    getOrgId(self.db, postData.user, function(err, orgId) {
        if (err) { console.log(err); return res.send(400, err); }
        return self.db().query('insert into t_slot_booking(storeId, slot_location, slot_time, channel, channel_specific, booking_time, booking_status, tc, ts) values (?,?,?,?,?, now(), 1,?,now());', [orgId, '未指定', postData.timeSlot, 'weixin', postData.user, postData.user+'@weixin'], function(err, result) {
            if (err) { console.log(err); return res.send(400, err); }
            return res.send(200, result);
        });
    });
}

function getOrgId(db, userName, callback) {
    var pool = db();
    pool.query('select sopenid from t_wx_user where openid = ?;',[userName], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                pool.query('select id from t_staff_org where openid = ?;',[rows[0].sopenid], function(err, rows){
                    if (err) { callback(err); }
                    else {
                        if (rows && rows.length === 1) {
                            callback(null, rows[0].id);
                        } else { callback(new Error('zero or multiple rows (t_staff_org.id) returned for one wx user id in booking slot.')); }
                    }
                });
            } else {
                callback(new Error('zero or multiple rows(sopenid) returned for one wx user openid in booking slot.'));
            }
        }
    });
}


