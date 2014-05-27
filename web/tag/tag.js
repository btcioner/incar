/**
 * Created by LM on 14-5-27.
 */
var dao=require("../core/dataAccess/dao");

function updateTagForUser(){

}



























var tagGroup=[
    {name:"车系",description:"车系",type:0},
    {name:"渠道",description:"车主的来源",type:0},
    {name:"车龄",description:"车的驾驶年限",type:0},
    {name:"用途",description:"标识车是商用还是家用",type:0},
    {name:"用车时段",description:"用来描述车主的用车时段",type:0},
    {name:"用车频率",description:"用来描述车主的用车频率",type:0},
    {name:"驾驶偏好",description:"用来描述车主的驾驶偏好",type:0}
];
function initTagGroup(){
    var sql="insert into t_tag_group set ?";
    for(var i=0;i<tagGroup.length;i++){
        dao.insertBySql(sql,tagGroup[i],function(info,args){
            args.id=info.insertId;
            console.log(args);
        });
    }
}
function initCarBrandForTag(){
    var sql="select * from t_car_dictionary";
    dao.findBySql(sql,[],function(rows){
        for(var i=0;i<rows.length;i++){
            var cd=rows[i];
            var code=cd.brandCode+'-'+cd.seriesCode;
            var name=cd.series;
            var description=cd.description;
            var tag={
                code:code,
                name:name,
                description:name,
                active:1,
                groupId:1
            };
            sql="insert into t_tag set ?";
            dao.insertBySql(sql,tag,function(info,args){
                args.id=info.insertId;
                console.log("成功添加车系标签："+JSON.stringify(args));
            });
        }
    });
}
function initOtherTag(){
    var tags=[
        {code:'app',name:"APP",description:"手机客户端",active:1,groupId:4},
        {code:'wx',name:"微信",description:"微信端",active:1,groupId:4},
        {code:'phone',name:"电话",description:"电话营销",active:1,groupId:4},

        {code:'age1-',name:"不到一年",description:"不到一年",active:1,groupId:3},
        {code:'age12',name:"一到两年",description:"一到两年",active:1,groupId:3},
        {code:'age23',name:"两到三年",description:"两到三年",active:1,groupId:3},
        {code:'age34',name:"三到四年",description:"三到四年",active:1,groupId:3},
        {code:'age45',name:"四到五年",description:"四到五年",active:1,groupId:3},
        {code:'age5+',name:"五年以上",description:"五年以上",active:1,groupId:3},

        {code:'work',name:"商用",description:"商业用车",active:1,groupId:2},
        {code:'home',name:"家用",description:"家庭用车",active:1,groupId:2},

        {code:'toWork',name:"上下班",description:"6:00-10:00,17:00-20:00使用",active:1,groupId:7},
        {code:'inWork',name:"工作时",description:"10:00-17:00使用",active:1,groupId:7},
        {code:'noWork',name:"非工作时段",description:"20:00-6:00使用",active:1,groupId:7},

        {code:'rateLittle',name:"极低",description:"很少很少",active:1,groupId:6},
        {code:'rateLess',name:"低",description:"很少",active:1,groupId:6},
        {code:'rateNormal',name:"一般",description:"一般",active:1,groupId:6},
        {code:'rateMore',name:"高",description:"很多",active:1,groupId:6},

        {code:'preLow',name:"保守",description:"保守",active:1,groupId:5},
        {code:'preMid',name:"普通",description:"普通",active:1,groupId:5},
        {code:'preHIgh',name:"豪放",description:"豪放",active:1,groupId:5}
    ];
    var sql="insert into t_tag set ?";
    for(var i=0;i<tags.length;i++){
        dao.insertBySql(sql,tags[i],function(info,args){
            args.id=info.insertId;
            console.log(args);
        });
    }
}
//initTagGroup();
//initCarBrandForTag();
//initOtherTag();