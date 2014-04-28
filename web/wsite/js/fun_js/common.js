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
        if(date == "0000-00-00 00:00:00" || date == null) return null;
        var year = new Date(Date.parse(date)).getFullYear();
        if(isNaN(year)) return null;
        var month = (new Date(Date.parse(date)).getMonth()) + 1;
        var day = new Date(Date.parse(date)).getDate();
        var hour = new Date(Date.parse(date)).getHours();
        var minute = new Date(Date.parse(date)).getMinutes();
        if(month < 10) month= "0" + month;
        if(hour < 10) hour = "0" + hour;
        if(minute < 10) minute= "0" + minute;

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
    //把用户的状态从文字转成数字
    $.changeUserStatusToNum = function(status)
    {
        if(status == "正常") return "1";
        else if(status == "冻结" || status == null) return "0";
    }
    //改变工位状态
    $.changeSlotStatus = function(status)
    {
        if(status == "1") return "有效";
        else if(status == "0" || status == null) return "失效";
    }
    //把工位的状态从文字改成数字
    $.changeSlotStatusToNum = function(status)
    {
        if(status == "有效") return "1";
        else if(status == "失效" || status == null) return "0";
    }
    //改变预约保养和维修的状态
    $.changeWorkStatus = function(step)
    {
        switch(step)
        {
            case "applied":
                return "新申请";
                break;
            case "approved":
                return "已确认";
                break;
            case "rejected":
                return "已拒绝";
                break;
            case "cancelled":
                return "已取消";
                break;
            case "done":
                return "已完成";
                break;
            case "aborted":
                return "未到店";
                break;

        }
    }


})(jQuery);

