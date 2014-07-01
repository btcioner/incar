/**
 * Created by LM on 14-2-28.
 */
'use strict';
var db = require('./db');

var findBySql=function(sql,args,callback){
    console.log("开始查询："+sql+'  '+args);
    var connection=db().getConnection(function(err,connection){
        if(err){
            console.log("获得connection出现错误:"+err);
            callback({data:[],status:'failure',message:'数据库连接错误，无法获得数据!',err:err});
        }
        else{
            connection.query(sql,args,function(err, rows){
                if (err){
                    console.log("查询错误:"+err);
                    callback({data:[],status:'failure',message:'查询错误,请检查SQL!',err:err});
                }
                else{
                    callback({data:rows,status:'success'});
                }
                connection.release();
            });
        }
    });
};
exports.findBySql=findBySql;
exports.findBySqlForPage=function(sql,args,cb,page,pageSize){
    if(page&&pageSize){
        var sqlCount="select count(*) as rowCount from ("+sql+") as t";
        var sqlPage="select * from ("+sql+") as t limit ?,?";
        findBySql(sqlCount,args,function(info){
            if(info.err){
                info.rowCount=0;
                cb(info);
            }
            else if(info.data.length>0){
                var rowCount=rows[0]['rowCount'];
                args.push((page-1)*pageSize);
                args.push(pageSize);
                findBySql(sqlPage,args,function(info){
                    info['rowCount']=rowCount;
                    cb(info);
                });
            }
            else{
                cb({rowCount:0,data:[],status:'failure'});
            }
        });
    }
    else{
        findBySql(sql,args,function(info){
            info['rowCount']=info['data'].length;
            cb(info);
        });
    }
};
//通过SQL添加数据，可以得到自动增长的ID
exports.insertBySql=function(sql,args,callback){
    console.log("开始执行："+sql+'  '+JSON.stringify(args));
    var connection=db().getConnection(function(err,connection){
        if(err){
            console.log("获得connection出现错误:"+err);
            callback({status:'failure',message:'数据库连接错误，无法获得数据!',err:err});
        }
        else{
            connection.query(sql,args,function(err,info){
                if (err){
                    console.log("SQL执行错误:"+err);
                    callback({status:'failure',message:'SQL执行错误,请检查SQL!',err:err});
                }
                else{
                    args.id=info.insertId;
                    callback({data:args,status:'success'});
                }
                connection.release();
            });
        }
    });
};
//通过SQL修改或删除
exports.executeBySql=function(sql,args,callback){
    console.log("开始执行："+sql+'  '+JSON.stringify(args));
    var connection=db().getConnection(function(err,connection){
        if(err){
            console.log("获得connection出现错误:"+err);
            callback({status:'failure',message:'数据库连接错误，无法获得数据!',err:err});
        }
        else{
            connection.query(sql,args,function(err){
                if (err){
                    console.log("SQL执行错误:"+err);
                    callback({status:'failure',message:'SQL执行错误,请检查SQL!',err:err});
                }
                else{
                    callback({status:'success'});
                }
                connection.release();
            });
        }
    });
};
//批处理SQL的递归方法
function executeBySqlRecursion (connection,sqlInfo,index,callback){
    var currentInfo=sqlInfo[index];
    var sql=currentInfo.sql;
    var args=currentInfo.args;
    connection.query(sql,args,function(err){
        if (err) {
            currentInfo.result='failure';
            throw err;
        }
        else{
            currentInfo.result='success';
            if(index<sqlInfo.length-1){
                executeBySqlRecursion(connection,sqlInfo,index+1,callback);
            }
            else{
                callback();
            }
        }
    });
}
//使用嵌套方式完成事务中多条增删改
exports.executeBySqls=function(sqlArray,argsArray,callback){
    if(sqlArray.length===argsArray.length){
        db().getConnection(function(err,connection){
            if(err){
                console.log("获得connection出现错误:"+err);
                callback({status:'failure',message:'数据库连接错误，无法获得数据!',err:err});
            }
            else{
                connection.beginTransaction(function(err) {
                    if(err){
                        console.log("事务开启失败:"+err);
                        callback({status:'failure',message:'事务开启失败!',err:err});
                    }
                    else{
                        var sqlInfo=[];
                        for(var i=0;i<sqlArray.length;i++){
                            sqlInfo.push({sql:sqlArray[i],args:argsArray[i],result:'not execute'});
                        }
                        try{
                            executeBySqlRecursion(connection,sqlInfo,0,function(){
                                connection.commit(function(err) {
                                    if (err) {
                                        connection.rollback(function() {
                                            callback({
                                                status:'failure',
                                                message:'回滚失败!',
                                                err:err,
                                                sqlInfo:sqlInfo
                                            });
                                        });
                                    }
                                    else{
                                        connection.release();
                                        callback({
                                            status:'success',
                                            sqlInfo:sqlInfo
                                        });
                                    }
                                });
                            });
                        }
                        catch(err){
                            connection.rollback(function() {
                                callback({
                                    status:'failure',
                                    message:'批处理SQL执行失败!',
                                    err:err,
                                    sqlInfo:sqlInfo
                                });
                            });
                        }
                    }
                });
            }
        });
    }
    else{
        callback({
            status:'failure',
            message:'参数错误,sql与args数量不符!'
        });
    }
};