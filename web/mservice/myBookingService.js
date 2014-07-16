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
    // console.log(postData);
    var db = this.db;
    var user=postData.user;
    var sid=postData.sid;
    search(db, user,sid,function(err, data) {
        if (err) { res.send(200,err); }
        else {
            // console.log(data);
            res.send(data);
        }
    });
}

function search(db, uid,sid,callback) {
    var pool = db();
    var sql = "SELECT S.id, S.slot_time, S.booking_status, S.ts, W.json_args\n" +
        "FROM t_slot_booking S\n" +
        "\tLEFT OUTER JOIN t_work W ON W.work_ref_id = S.id\n" +
        "WHERE S.channel_specific = ?";
    pool.query(sql, [uid],function(err,rows){
            if(err){callback(err);}
            else{
                if(rows){
                    var booking=new Array();
                    for(var i=0;i<rows.length;i++){
                        var data={};
                        data.id=rows[i].id;
                        data.bookingtime=rows[i].slot_time;
                        data.bookingStatus=rows[i].booking_status;
                        data.ts=rows[i].ts;
                        try{
                            // 从json_args里提取车牌号,因为slot_booking里没有保存此信息
                            if(rows[i].json_args){
                                var json_args = JSON.parse(rows[i].json_args);
                                data.license = json_args.license;
                            }
                        }
                        catch(ex){
                            // ignore
                            console.log(ex);
                        }
                        booking.push(data);
                    }
                    callback(null,booking);
                }else callback(new Error("Booking data error."));
            }
        });
}
