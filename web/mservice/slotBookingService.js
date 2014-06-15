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
    //console.log(postData);
    postData.bookingDate = new Date(Date.parse(postData.bookingDate));
    postData.timeSlot=new Date( postData.bookingDate);
    postData.timeSlot.setHours(postData.bookingTime.split(":")[0],postData.bookingTime.split(":")[1]);
    delete postData.bookingDate;
    delete postData.bookingTime;
    console.log(postData);

    getOrgId(self.db, postData.user.split('@')[0], function(err, orgId) {
        if (err) { console.log(err); return res.send(400, err); }
        self.db().query('insert into t_slot_booking(storeId, slot_location, slot_time, channel, channel_specific, booking_time, booking_status, tc, ts) values (?,?,?,?,?, now(), 1,?,now());',
            [orgId, '未指定', postData.timeSlot, 'weixin', postData.user, postData.user+'@weixin'], function(err, result) {
            if (err) { console.log(err); return res.send(400, err); }
            else{
                self.db().query('select id from t_slot_booking where channel_specific like ? order by ts desc limit 1',["%"+postData.user+'%'],function(err,rows){
                    if(err){ console.log(err); return res.send(400, err);}
                    else if(rows){
                        self.db.query('insert into t_work (work,step,work_ref_id,org_id,cust_id,working_time,created_time) value(?,?,?,?,?,?,now())',
                            ['care','applied',rows[0].id,orgId,postData.acc_id,postData.timeSlot],function(err,result){
                              if(err){ console.log(err); return res.send(400, err);}
                                return res.send(200, result);
                        });
                    }
                });
            }
           });
    });
}

function getOrgId(db, userName, callback) {
    var pool = db();
    pool.query('select s4_id from t_account where wx_oid like ?;',["%"+userName+"%"], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                    callback(null, rows[0].s4_id);
                        } else { callback(new Error('zero or multiple rows (t_account.s4_id) returned for one wx user id in booking slot.')); }
                    }
            });
}


