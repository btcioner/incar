/**
 * Created by Jesse Qu on 3/25/14.
 */
'use strict';

var mysql = require('mysql');

function getOrgId(db, userName,sopenid, callback) {
    console.log("username:"+userName+":"+sopenid);
    var pool = db();
    pool.query('select s4_id from t_account where wx_oid like ?;',["%"+userName+":"+sopenid+"%"], function(err, rows){
        if (err) { callback(err); }
        else {
            if (rows && rows.length === 1) {
                         callback(null, rows[0].s4_id);
                        } else { callback(new Error('zero or multiple rows () returned for one wx user id.')); }
                    }
            });

}

var booking = {};

booking.getPromotionSlots = function(userName,sopenid, callback) {
    var pool = this.db();
    getOrgId(this.db, userName,sopenid, function(err, result) {
        if (err) { return callback(err); }
        pool.query('select id, slot_location location, slot_time time, benefit, description from t_promotion_slot where promotion_status = 1 and promotion_time > now() and storeId = ?;', [result], function(err, rows) {
            if (err) { return callback(err); }
            return callback(null, rows);
        });
    });
};
//need to insert into t_work
booking.applySlot = function(userName,sopenid, slot, callback) {
    var pool = this.db();
    console.log(slot);
    getOrgId(this.db, userName,sopenid, function(err, orgId) {
        if (err) { return callback(err); }
        else {
       pool.query('select id from t_account where wx_oid like ?;',['%'+userName+':'+sopenid+'%'],function(err,acc_row){
           if(err) { return callback(err); }
           else{
           pool.query('insert into t_slot_booking(storeId, slot_location, slot_time, promotion_id, channel, channel_specific, booking_time, booking_status, tc, ts) values (?,?,?,?,?,?, now(), 1,?,now());',
               [orgId, slot.location, slot.time, slot.id, 'weixin', userName+'@'+sopenid, userName+'@'+sopenid+'@weixin'], function(err, result) {
               if (err) { return callback(err); }
              else{
                pool.query('select id from t_slot_booking where channel_specific like ? order by ts desc limit 1',["%"+userName+'@'+sopenid+'%'],function(err,rows){
                    if(err){ console.log(err); return res.send(400, err);}
                    else if(rows){
                        pool.query('insert into t_work (work,step,work_ref_id,org_id,cust_id,working_time,json_args,created_time) values(?,?,?,?,?,?,?,now())',
                            ['care','applied',rows[0].id,orgId,acc_row[0].id,slot.time,''],function(err,result){
                                if(err){ console.log(err); return res.send(400, err);}
                                return callback(null, result);
                            });
                    }
                });
            }
          });
          }
        });
        }
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
booking.get4sDetail=function(sopenid,callback){
    var pool = this.db();
    pool.query('select name,description,brand,logo_url,address,hotline from t_4s where openid=?;',[sopenid],function(err,result){
        if(err) callback(err);
        else {
            if(result&&result.length===1) {
                      var data={};
                      data.name=result[0].name;
                      data.description=result[0].description;
                      data.brand=result[0].brand;
                      data.logo_url=result[0].logo_url;
                      data.address=result[0].address;
                      data.hotline=result[0].hotline;
                     callback(null,data);
            }else callback(new Error('The 4s is not exist.'))
        }
    });
};
booking.db = require('../../config/db');

exports = module.exports = booking;

