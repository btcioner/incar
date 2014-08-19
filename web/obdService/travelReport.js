/**
 * Created by LM on 14-7-9.
 */
var dao=require("../config/dao");
function getMonthStartAndEnd(year,month){
    var start=new Date();
    if(year)start.setFullYear(year);
    if(month)start.setMonth(month-1);
    start.setDate(1);
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    var end=new Date(start.valueOf()-1000);
    start.setMonth(start.getMonth()-1);
    return [start,new Date()];
}

/*select
 t.name as s4Name,
 s1.obdCode,s1.year,s1.month,
 s1.mileageMth as milMe,
 s1.countMth as countMe,
 s1.avgOilMth as avgMe,
 s1.speedMth as spdMe,
 s2.mileageMth as milAll,
 s2.countMth as countAll,
 s2.avgOilMth as avgAll,
 s2.speedMth as spdAll
 FROM t_account a
 left join t_car_user cu on cu.acc_id=a.id
 left join t_car c on cu.car_id=c.id
 left join t_4s t on a.s4_id=t.id
 inner join t_obd_statistics s1 on s1.obdCode=c.obd_code
 inner join t_obd_statistics s2
 on s1.year=s2.year
 and s1.month=s2.month
 and s1.s4Id=s2.s4Id
 and s1.type <> s2.type and s1.type=1
 and s1.markTime>DATE_ADD(now(), INTERVAL '-4' MONTH)
 and a.wx_oid='o1fUut3BkIo8XM6-8HG-3ORAtvls:gh_895980ee6356'
 order by s1.year,s1.month;*/
exports.loadTravelReport=function(req,res){
    var query=req.query;
    var user=query.user;
    var sql="select t.name as s4Name," +
        "s1.obdCode,s1.year,s1.month," +
        "s1.mileageMth as milMe," +
        "s1.countMth as countMe," +
        "s1.avgOilMth as avgMe," +
        "s1.speedMth as spdMe," +
        "s2.mileageMth as milAll," +
        "s2.countMth as countAll," +
        "s2.avgOilMth as avgAll," +
        "s2.speedMth as spdAll " +
        "FROM t_account a " +
        "left join t_car_user cu on cu.acc_id=a.id " +
        "left join t_car c on cu.car_id=c.id " +
        "left join t_4s t on a.s4_id=t.id " +
        "inner join t_obd_statistics s1 on s1.obdCode=c.obd_code " +
        "inner join t_obd_statistics s2 on s1.year=s2.year and s1.month=s2.month and s1.s4Id=s2.s4Id and s1.type <> s2.type and s1.type=1 and s1.markTime>DATE_ADD(now(), INTERVAL '-4' MONTH) " +
        "where a.wx_oid=? " +
        "order by s1.year,s1.month";
    dao.findBySql(sql,[user],function(info){
        if(info.err){
            console.log("查询用车报告时出现错误："+info.err);
            res.json(info)
        }
        else{
            var rows=info.data;
            var results={};
            if(rows.length>0){
                var s4Name='';
                for(var i=0;i<rows.length;i++){
                    var year=rows[i].year;
                    var month=rows[i].month;
                    s4Name=rows[i].s4Name;
                    var dataMth={year:year,month:month,s4Name:s4Name,
                        dataMth:[
                        {
                            title:'行驶里程',
                            unit:'公里',
                            data:[{name:'我',y:rows[i].milMe},{name:'大家',y:rows[i].milAll}]
                        },{
                            title:'用车频率',
                            unit:'次',
                            data:[{name:'我',y:rows[i].countMe},{name:'大家',y:rows[i].countAll}]
                        },{
                            title:'平均油耗',
                            unit:'升/百公里',
                            data:[{name:'我',y:rows[i].avgMe},{name:'大家',y:rows[i].avgAll}]
                        },{
                            title:'平均车速',
                            unit:'公里/小时',
                            data:[{name:'我',y:rows[i].spdMe},{name:'大家',y:rows[i].spdAll}]
                        }]
                    };
                    results[month]=dataMth;
                }
                info.data={s4Name:s4Name,results:results};
                console.log(JSON.stringify(info));
                res.json(info);
            }
            else{
                res.json({status:'failure',message:"暂无数据"});
            }
        }

    });
};