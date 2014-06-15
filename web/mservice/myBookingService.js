/**
 * Created by zhoupeng on 14-6-7.
 */


'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.myBooking = myBooking;

}

function myBooking(req, res) {
    var postData = req.body;
    console.log(postData);
    var db = this.db;
    var user=postData.user;
    var sid=postData.sid;
    search(db, user,sid,function(err, data) {
        if (err) { res.send(200,err); }
        else {
            console.log(data);
            res.send(data);
        }
    });
}

function search(db, uid,sid,callback) {
    var pool = db();
    pool.query('select  id,booking_time,booking_status,ts   from  t_slot_booking where channel_specific like ?;',
        ['%'+uid+'@'+sid+'%'],function(err,rows){
            if(err){callback(err);}
            else{
                if(rows){
                    var booking=new Array();
                    for(var i=0;i<rows.length;i++){
                        var data={};
                        data.id=rows[i].id;
                        data.bookingtime=rows[i].booking_time;
                        data.bookingStatus=rows[i].booking_status;
                        data.ts=rows[i].ts;
                        booking.push(data);
                    }
                    callback(null,booking);
                }else callback(new Error("Booking data error."));
            }
        });
}
