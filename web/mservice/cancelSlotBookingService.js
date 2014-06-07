/**
 * Created by zhoupeng on 14-6-7.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.cancelSlotBooking = cancelSlotBooking;

}

function cancelSlotBooking(req, res) {
    var postData = req.body;
    console.log(postData);
    var db = this.db;
    var id=postData.id;
    cancel(db,id,function(err, data) {
        if (err) { res.send(200,err); }
        else {
            res.send(data);
        }
    });
}

function cancel(db,id,callback) {
    var pool = db();
    pool.query('update t_slot_booking set bookingStatus=4 where id=?;',
        [id],function(err,rows){
            if(err){callback(err);}
            else{
                callback(null,1);
            }
        });
}
