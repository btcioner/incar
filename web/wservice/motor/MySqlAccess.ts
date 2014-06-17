/// <reference path="../dts/node.d.ts" />

module Service{
    export module MySqlAccess{
        var mysql:any = require('mysql');
        var findPool:any = require('../config/db.js');

        // 获取全局连接池对象,如果没有,就会创建一个
        export function RetrievePool() : any{
            var poolInCar = findPool();

            if(process.env.TraceSQL){
                if(!poolInCar.TraceCount){
                    poolInCar.TraceCount = 1;
                    poolInCar.queryRawFn = poolInCar.query;

                    poolInCar.query = (sql, args, cb)=>{
                        var pack = {
                            bTraceOutSQL : false,
                            snSQL : (poolInCar.TraceCount++),
                            tmA : new Date()
                        };
                        setTimeout(()=>{
                            // 如果1000毫秒内没有输出SQL语句,那么立即输出SQL语句
                            if(!pack.bTraceOutSQL){
                                TraceSQL(sql, args, pack.snSQL, pack.tmA);
                                pack.bTraceOutSQL = true;
                            }
                        }, 1000);
                        poolInCar.queryRawFn(sql, args, (ex, result)=>{
                            var tmB = new Date();
                            if(pack.bTraceOutSQL){
                                // 如果已经输出了SQL语句,那么只需再输出耗时即可
                                TraceTime(pack.snSQL, tmB.getTime() - pack.tmA.getTime(), result);
                            }
                            else{
                                // 如果尚未输出SQL语句,那么输出全部
                                TraceSQL(sql, args, pack.snSQL, pack.tmA, tmB, result);
                                pack.bTraceOutSQL = true;
                            }

                            // 如果出错,那么输出错误
                            if(ex) console.info(">>>>> SQL#%d \033[31m%s\033[0m", pack.snSQL, ex.message);
                            // 传递原始回调
                            cb(ex, result);
                        });
                    };
                }
            }

            return poolInCar;
        }

        // 调试用
        export function TraceSQL(sql:string, args:any, sn:number, tmStart:Date, tmEnd?:Date, result?:any):string{
            var sqlfull = mysql.format(sql, args);
            var strTM = util.format("%s-%s-%s %s:%s:%s",
                tmStart.getFullYear(), tmStart.getMonth(), tmStart.getDate(),
                tmStart.getHours(), tmStart.getMinutes(), tmStart.getSeconds());
            if(tmEnd){
                var tmSpan = tmEnd.getTime() - tmStart.getTime();
                var affected = 0;
                var strAffected = "\033[32m";
                if(result){
                    if(result.affectedRows) affected = result.affectedRows;
                    else if(result.length) affected = result.length;
                    if(affected > 1) strAffected += affected + "\033[0mrows";
                    else strAffected += affected + "\033[0mrow";
                }
                console.info(">>>>> SQL#%d \033[32m%s %d\033[0mms %s> \033[33m%s\033[0m", sn, strTM, tmSpan, strAffected, sqlfull);
            }
            else {
                console.info(">>>>> SQL#%d \033[32m%s\033[0m > \033[33m%s\033[0m", sn, strTM, sqlfull);
            }
            return sqlfull;
        }

        // 调试用
        export function TraceTime(sn:number, tmSpan:number, result:any):void{
            var affected = 0;
            var strAffected = "\033[32m";
            if(result){
                if(result.affectedRows) affected = result.affectedRows;
                else if(result.length) affected = result.length;
                if(affected > 1) strAffected += affected + "\033[0mrows";
                else strAffected += affected + "\033[0mrow";
            }
            console.info(">>>>> SQL#%d \033[32m%d\033[0mms > %s", sn, tmSpan, strAffected);
        }

        // 存储一系列id到一个临时表中
        export function StoreIds(tmpName:string, ids:number[], cb:(ex:TaskException, tmpName:string)=>void):void{
            var idsForceNumber = Array();
            ids.forEach((obj)=>{   idsForceNumber.push(Number(obj));      });
            var dac = MySqlAccess.RetrievePool();
            dac.query("DROP TABLE IF EXISTS ?? ;", tmpName, (ex, result)=>{
                dac.query("CREATE TABLE ?? (id INT UNSIGNED PRIMARY KEY) ENGINE = MEMORY", [tmpName], (ex, result)=>{
                    if(ex){ cb(new TaskException(-1, "数据库错误,创建临时表失败", ex), null); return; }
                    else{
                        var strV = "(" + idsForceNumber.join("),(") + ")";
                        dac.query("INSERT INTO tmp_ids VALUES " + strV, null, (ex, result)=>{
                            if(ex){ cb(new TaskException(-1, "数据库错误,插入数据失败", ex), null); return; }
                            else{
                                cb(null, tmpName);
                            }
                        });
                    }
                });
            });
        }
    }
}

