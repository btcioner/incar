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
                        var snSQL = (poolInCar.TraceCount++);
                        var tmA = new Date();
                        TraceSQL(sql, args, snSQL, tmA);
                        poolInCar.queryRawFn(sql, args, (ex, result)=>{
                            var tmB = new Date();
                            TraceTime(snSQL, tmB.getTime() - tmA.getTime());
                            if(ex) console.info(">>>>> SQL#%d \033[31m%s\033[0m", snSQL, ex.message);
                            cb(ex, result);
                        });
                    };
                }
            }

            return poolInCar;
        }

        // 调试用
        export function TraceSQL(sql:string, args:any, sn:number, tmStart:Date):string{
            var sqlfull = mysql.format(sql, args);
            var strTM = util.format("%s-%s-%s %s:%s:%s",
                tmStart.getFullYear(), tmStart.getMonth(), tmStart.getDate(),
                tmStart.getHours(), tmStart.getMinutes(), tmStart.getSeconds());
            console.info(">>>>> SQL#%d \033[32m%s\033[0m > \033[33m%s\033[0m", sn, strTM, sqlfull);
            return sqlfull;
        }

        // 调试用
        export function TraceTime(sn:number, tmSpan:number):void{
            console.info(">>>>> SQL#%d \033[32m%d\033[0mms", sn, tmSpan);
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

