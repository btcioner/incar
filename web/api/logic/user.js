
var db = require('../../config/db');

exports = module.exports = (function(){
    var userSrv = {};
    userSrv.isRegisterOBD = function(oid, cb){
        // 如果没有传入oid,直接返回false
        if(!oid) cb(null, false);
        var sql = "SELECT C.obd_code\n" +
            "FROM t_account A\n" +
            "\tLEFT OUTER JOIN t_car_user U ON A.id = U.acc_id and A.s4_id = U.s4_id\n" +
            "\tLEFT OUTER JOIN t_car C ON C.id = U.car_id and C.s4_id = U.s4_id\n" +
            "WHERE A.wx_oid = ? and C.obd_code is not null";
        pool.query(sql, [oid], function (ex, result) {
            if(ex) {
                cb(ex, null);
                return;
            }

            if(result.length > 0){
                cb(null, true);
            }
            else{
                cb(null, false);
            }
        });
    };
    return userSrv;
})();