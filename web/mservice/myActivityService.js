/**
 * Created by zhoupeng on 14-6-7.
 */

'use strict';

var mysql = require('mysql');

exports = module.exports = function (service) {
    service.post.myActivity = myActivity;

}

function myActivity(req, res) {
    var postData = req.body;
    var db = this.db;
    var user = postData.user;
    var acc_id = postData.acc_id;
    var s4id = postData.s4_id;
    // console.log("postData:"+postData.user+","+postData.acc_id+","+postData.s4_id);
    search(db, acc_id, s4id, function (err, result) {
        if (err) {
            res.send(500, err);
        }
        else {
            console.log(result);
            res.send(result);
        }
    });
}

function search(db, acc_id, s4id, callback) {
    var myActData = new Array();
    var pool = db();
    pool.query('select act_id,status  from  t_activity_member where cust_id = ?;',
        [acc_id], function (err, rows) {
            if (err) {
                callback(err);
            }
            else {
                if (rows) {
                    console.log("my activity account:" + rows.length);
                    var act_detail = {
                        n: 0,
                        end: function () {
                            if (act_detail.n == rows.length) {
                                callback(null, myActData);
                            }
                        }
                    }
                    for (var i = 0; i < rows.length; i++) {
                        //console.log("value:"+rows[i].act_id+"_"+s4id);
                        var st = rows[i].status;
                        pool.query('select A.id,A.title,A.status,A.tm_announce,T.template\n' +
                                'from t_activity A left outer join t_activity_template T on A.s4_id = T.s4_id and A.template_id = T.id\n' +
                                'where A.id = ? and A.s4_id=? order by A.tm_announce desc',
                            [rows[i].act_id, s4id], function (err, result) {
                                if (err) {
                                    console.error(err);
                                }
                                else {
                                    if (result && result.length == 1) {
                                        var act_data = {};
                                        act_data.id = result[0].id;
                                        act_data.title = result[0].title;
                                        act_data.status = result[0].status;
                                        act_data.tm_announce = result[0].tm_announce;
                                        act_data.template = result[0].template;
                                        act_data.myStatus = st;
                                        myActData.push(act_data);
                                    } else callback(console.error("t_activity data error."));
                                }
                                act_detail.n++;
                                act_detail.end();
                            });
                    }
                } else callback(new Error("t_activity_member data error."));
            }
        });
}
