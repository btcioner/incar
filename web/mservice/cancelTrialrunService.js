/**
 * Created by zhoupeng on 14-6-7.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function(service) {
    service.post.cancelTrialrun = cancelTrialrun;

}

function cancelTrialrun(req, res) {
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
    pool.query('update t_trialrun set bookStatus=4 where id=?;',
        [id],function(err,rows){
            if(err){console.log(err);callback(err);}
            else{
               callback(null,1);
          }
        });
}
