/**
 * Created by LM on 14-2-28.
 */
'use strict';
var db = require('./db');

exports.findBySql=function(sql,args,callback){
    var connection=db().getConnection(function(err,connection){
        if(err){
            console.log("获得connection出现错误:"+err);
            throw err;
        }
        connection.query(sql,args,function(err, rows, fields){
            if (err){
                console.log(err);
                rows=[];
            }
            callback(rows);
            connection.release();
        });
    });
};
exports.insertBySql=function(sql,args,callback){
    var connection=db().getConnection(function(err,connection){
        if(err){
            console.log("获得connection出现错误:"+err);
            throw err;
        }
        connection.query(sql,args,function(err,info){
            if (err){
                console.log(err);
                info={};
            }
            callback(info,args);
            connection.release();
        });
    });
};
exports.executeBySql=function(sqlArray,argsArray,callback){
    if(sqlArray.length!==argsArray.length)return;
    db().getConnection(function(err,connection){
        if(err){
            console.log("获得connection出现错误:"+err);
            throw err;
        }
        connection.removeAllListeners();
        connection.on("error",function(err){
            console.log("出现错误，已回滚"+err);
            connection.rollback(function(err){
                if (err) {
                    console.log("回滚失败，怎么会这样呢");
                    throw err;
                }
            });
            connection.release();
        });
        connection.beginTransaction(function(err) {
            if (err) throw err;
            for(var i=0;i<sqlArray.length;i++){
                connection.query(sqlArray[i],argsArray[i]);
            }
            connection.commit(function(err){
                if(err)throw err;
                callback();
                connection.release();
            });
        });
    });
};

/*使用嵌套方式完成事务中多条增删改
function executeBySqlRecursion (connection,sqlArray,argsArray,index,callback){
    connection.query(sqlArray[index],argsArray[index],function(err, result){
        if (err) {
            connection.rollback(function() {
                throw err;
            });
        }
        console.log(result);
        if(index<sqlArray.length-1){
            executeBySqlRecursion(connection,sqlArray,argsArray,index+1,callback);
        }
        else{
            callback();
        }
    });
}
exports.executeBySql=function(sqlArray,argsArray,callback){
    if(sqlArray.length!==argsArray.length)return;
    var connection=pool.getConnection(function(err,connection){
        connection.beginTransaction(function(err) {
            if (err) { throw err; }
            executeBySqlRecursion(connection,sqlArray,argsArray,0,function(){
                connection.commit(function(err) {
                    if (err) {
                        connection.rollback(function() {
                            throw err;
                        });
                    }
                    console.log('success!');
                    connection.release();
                    callback();
                });
            });
        });
    });
};*/
