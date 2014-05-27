/**
 * Created by Liz on 14-04-08.
 */

function s_fuelMatchCtrl($scope,$http)
{

   $scope.matchListDiv = true;
   $scope.matchModifyDiv = false;
   $scope.matchPreviewDiv = false;
   $scope.matchPublishedDiv = false;
   $scope.matchAddDiv = false;
   $scope.flagid = "";

    //点击添加按钮
    $scope.add = function()
    {
        $scope.matchListDiv = false;
        $scope.matchAddDiv = true;
    }

    //创建节油大赛
    $scope.AddConfirm = function()
    {
        $scope.matchListDiv = true;
        $scope.matchAddDiv = false;
    }
   //预览
    $scope.preview = function(id)
    {
        $scope.matchListDiv = false;
        $scope.matchPreviewDiv = true;
    }
    //发布
    $scope.publish = function(id)
    {
        $scope.matchListDiv = true;
        $scope.matchPreviewDiv = false;
    }
    //修改按钮
    $scope.modify = function(id)
    {
        $scope.matchListDiv = false;
        $scope.matchModifyDiv = true;
    }
    //修改确认
    $scope.modifyConfirm = function(id)
    {
        $scope.matchListDiv = true;
        $scope.matchModifyDiv = false;
    }
    //取消
    $scope.cancelMatch = function(id)
    {
        alert("确定要取消吗？");

    }
    //查看
    $scope.InfoView = function(sta)
    {
        switch(sta)
        {
            case "已发布":
                $scope.matchPublishedDiv = true;
                $scope.matchListDiv = false;
                break;
            case "已开始":
                $scope.matchStartedDiv = true;
                $scope.matchListDiv = false;
                break;
            case "已结束":
                $scope.matchFinishedDiv = true;
                $scope.matchListDiv = false;
                break;
            case "已公布":
                $scope.matchPrizedDiv = true;
                $scope.matchListDiv = false;
                break;
        }
    }
    //发布结果按钮
    $scope.publishResult = function(id)
    {
        $scope.matchFinishedDiv = false;
        $scope.matchPubResultDiv = true;
    }
     //发布结果确认
    $scope.publishConfirm = function()
    {
        $scope.matchFinishedDiv = true;
        $scope.matchPubResultDiv = false;
    }

    //点击姓名获取客户详情
    $scope.getCustDetail = function(id)
    {
        $scope.flagid = id;
        $scope.cusDetailDiv = true;
        $scope.cusTabDiv = true;
        switch(id)
        {
            case 1:
                $scope.matchFinishedDiv = false;
                break;
            case 2:
                $scope.matchPublishedDiv = false;
                break;
            case 3:
                $scope.matchPrizedDiv = false;
                break;
            case 4:
                $scope.matchStartedDiv = false;
                break;
        }
    }

    //
    $scope.detailTab = function(id)
    {
        for(var i=1;i<7;i++)
        {
            $("#tab"+i).hide();

            if(i==id)
            {
                $("#tab"+i).show();
                $("#tab"+id).removeClass();
                $("#tab"+id).addClass("tab-pane active");
            }
        }
        switch(id)
        {
            case 1:

                break;
            case 2:

                break;
            case 3:

                break;
            case 4:

                break;
            case 5:
                $scope.driveDiv = true;
                $scope.paging1 = true;
                $scope.paging2 = false;
                $scope.oneDetailDiv = false;
                $scope.detailInfoDiv = false;
                $scope.oneMinuteDetailDiv = false;

                break;
            case 6:

                break;
        }
    }

    //取消和返回
    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.matchListDiv = true;
                $scope.matchAddDiv = false;
                break;
            case 2:
                $scope.matchListDiv = true;
                $scope.matchPreviewDiv = false;
                break;
            case 3:
                $scope.matchListDiv = true;
                $scope.matchModifyDiv = false;
                break;
            case 4:
                $scope.matchListDiv = true;
                $scope.matchPublishedDiv = false;
                break;
            case 5:
                $scope.matchListDiv = true;
                $scope.matchStartedDiv = false;
                break;
            case 6:
                $scope.matchListDiv = true;
                $scope.matchFinishedDiv = false;
                break;
            case 7:
                $scope.matchListDiv = true;
                $scope.matchPrizedDiv = false;
                break;
            case 8:
                $scope.matchFinishedDiv = true;
                $scope.matchPubResultDiv = false;
                break;
        }
    }
    $scope.callBack = function(id,tid)
    {
        $scope.cusDetailDiv = false;
        $scope.cusTabDiv = false;
        switch(id)
        {
            case 1:
                $scope.matchFinishedDiv = true;
                break;
            case 2:
                $scope.matchPublishedDiv = true;
                break;
            case 3:
                $scope.matchPrizedDiv = true;
                break;
            case 4:
                $scope.matchStartedDiv = true;
                break;

        }
    }
}