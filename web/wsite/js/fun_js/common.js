/**
 *
 *  created by Liz on 2014/04/02
 *  for public js function
 */
var baseurl="/wservice/";

(function($){
    $.getUrlParam = function(name)
    {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r!=null) return unescape(r[2]); return null;
    }
    //把日期转换成可读日期
    $.changeDate = function(date)
    {
        var year = new Date(Date.parse(date)).getFullYear();
        var month = (new Date(Date.parse(date)).getMonth()) + 1;
        var day = new Date(Date.parse(date)).getDate();
        var hour = new Date(Date.parse(date)).getHours();
        var minute = new Date(Date.parse(date)).getMinutes();
        if(month < 10) month= "0" + month;
        if(hour < 10) hour = "0" + hour;
        if(minute < 10) minute= "0" + minute;
        if(date == "0000-00-00 00:00:00") return null;
        return (year+"-"+month+"-"+day+" "+hour+":"+minute);
    }

    //修改OBD设备的状态  0--未激活  1--已激活  2--故障
    $.changeStatus = function(status)
    {
        if(status == "1") return "已激活";
        else if(status == "0" || status == null) return "未激活";
        else if(status == "2") return "故障";
    }

    //修改用户的状态 0--冻结 1--正常
    $.changeUserStatus = function(status)
    {
        if(status == "1") return "正常";
        else if(status == "0" || status == null) return "冻结";
    }
    $.changeSlotStatus = function(status)
    {
        if(status == "1") return "有效";
        else if(status == "0" || status == null) return "失效";
    }
})(jQuery);

