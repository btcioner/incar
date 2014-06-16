/**
 *
 *  created by Liz on 2014/04/02
 *  for public js function
 */
var baseurl="/wservice/";

(function($){

    $.getAjaxLink = function(url,query,type)
    {
        var tempData = {};
        if($.cookie("nick") != "")
        {
            $.ajax({
                url: url,
                type: type,
                dataType: 'json',
                data:query,
                success: function(data){
//                  return data;
                },
                error: function(data){
                    alert("请求无响应");
                }
           });
        }
        else{
            alert("登录已超时！");
            window.location="../login.html";
        }
    }
    //通过Ajax异步访问。
//            $.ajax({
//                url: url,
//                type: type,
//                dataType: 'json',
//                data:query,
//                success: function(data){
//                    if(data.status =="没有登录")
//                    {
//                        alert("登录已超时！");
//                        window.location="../login.html";
//                    }
//                    else{
//                        $scope.$apply(function () {
//                         getIndexData(id,data);
//                        });
//                    }
//                },
//                error: function(data){
//                    alert("请求无响应");
//                }
//            });

    $.getUrlParam = function(name)
    {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r!=null) return unescape(r[2]); return null;
    }
    //把日期转换成可读日期
    $.changeDate2 = function(date)
    {
        if(date == "0000-00-00 00:00:00" || date == null) return null;
        var year = date.substring(0,4);
        var month = date.substring(5,7);
        var day = date.substring(8,10);

        return (year+"-"+month+"-"+day);

    }
    $.changeDate = function(date)
    {
//        if(date == "0000-00-00 00:00:00" || date == null) return null;
//        var year = new Date(Date.parse(date)).getFullYear();
//
//        var month = (new Date(Date.parse(date)).getMonth()) + 1;
//        var day = new Date(Date.parse(date)).getDate();
//        var hour = new Date(Date.parse(date)).getHours();
//        var minute = new Date(Date.parse(date)).getMinutes();
//        if(month < 10) month= "0" + month;
//        if(day < 10) day= "0" + day;
//        if(hour < 10) hour = "0" + hour;
//        if(minute < 10) minute= "0" + minute;
//
//        return (year+"-"+month+"-"+day+" "+hour+":"+minute);
        if(date == "0000-00-00 00:00:00" || date == null) return null;
        var year = date.substring(0,4);
        var month = date.substring(5,7);
        var day = date.substring(8,10);
        var time = date.substring(11,16)
        return (year+"-"+month+"-"+day+" "+time);
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
        if(status == 1) return "正常";
        if(status == 0 || status == null) return "冻结";
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
        switch(status)
        {
            case 1:
                return "已创建";
                break;
            case 2:
                return "已发布";
                break;
            case 3:
                return "已申请";
                break;
            case 4:
                return "已结束";
                break;
        }
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

    $.changeCareStatus = function(step)
    {
        if(step == "refused") return "已拒绝";
        else return "已预约";
    }

    $.changeCarStatus = function(status)
    {
        switch(status)
        {
            case 1:
                return "发动机点火时";
                break;
            case 2:
                return "发动机运行中";
                break;
            case 3:
                return "发动机熄火时";
                break;
            case 4:
                return "发动机熄火后";
                break;
            case 5:
                return "车辆不能检测";
                break;
        }
    }
})(jQuery);

