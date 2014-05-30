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
    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.title = "";
    $scope.brief = "";
    $scope.tm_announce = "";
    $scope.tm_start = "";
    $scope.tm_end = "";
    $scope.min_milage = "";
    $scope.logo_url = "";
    $scope.tags = "";
    $scope.titleMove = "";
    var editor;

    GetFirstPageInfo();//get fist driveData for first page；

    function GetFirstPageInfo()
    {
        $scope.tips="";
        $http.get(baseurl +"4s/"+$.cookie("s4_id")+"/template/1/activity?page="+$scope.currentPage+"&pagesize="+$scope.pageRecord).success(function(data){
            if(data.status == "ok")
            {
                if(data.activities.length ==0)
                {
                    $scope.tips="暂无数据";
                }
                $scope.fuelMatch = data.activities;
                PagingInfo(data.totalCount);
            }
        }).error(function(data){
             alert("请求无响应");
        })
    }

    //get paging param info
    function PagingInfo(totalCount)
    {
        $scope.totalCount = totalCount;
        $scope.totalPage = Math.ceil( $scope.totalCount /  $scope.pageRecord)
        $scope.totalOption=[{}];
        for(var i = 0 ;i< $scope.totalPage;i++)
        {
            $scope.totalOption[i]={size:i+1};
        }
    }

    //分页跳转页面
    $scope.changePage=function(id)
    {
        $scope.currentPage = id ;
        GetFirstPageInfo();
    }

    //点击添加按钮
    $scope.add = function()
    {
        KindEditor.ready(function(K) {
            editor = K.create('textarea[name="content"]', {
                width : 380,
                height : 350,
                minWidth : 380,
                minHeight : 350,
                allowFileManager : true,
                items : [
                    'bold','italic','underline','|','insertorderedlist','insertunorderedlist','|','image','|',
                    'removeformat','forecolor','hilitecolor'
                ]
            });
        });
        $scope.matchListDiv = false;
        $scope.matchAddDiv = true;
    }



    //标题改变
    $scope.titleChange = function()
    {
       // alert( $scope.title);
        if($scope.title.length < 50)
        {
            $scope.titleMove = $scope.title;
        }
        else{
            $scope.titleMove = $scope.title.substring(0,50);
        }
    }

    //创建节油大赛
    $scope.AddConfirm = function()
    {
       // 获取编辑器里面的内容 alert(editor.html());
        $scope.postData={title:$scope.title,brief:editor.html(),tm_announce:$scope.tm_announce,tm_start:$scope.tm_start,
        tm_end:$scope.tm_end,min_milage:$scope.min_milage,logo_url:$scope.logo_url,tags:"23,75,234,112"};
        $http.post(baseurl +"4s/"+$.cookie("s4_id")+"/template/1/activity",$scope.postData).success(function(data){
            if(data.status == "ok")
            {
               alert("添加成功!");
               GetFirstPageInfo();
               $scope.matchListDiv = true;
               $scope.matchAddDiv = false;
            }
        }).error(function(data){
                alert("请求无响应");
            })
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
    $scope.modify = function(fm_id,index)
    {
        var editor;
        KindEditor.ready(function(K) {
            editor = K.create('textarea[name="content"]', {
                width : 380,
                height : 350,
                minWidth : 380,
                minHeight : 350,
                allowFileManager : true,
                items : [
                    'bold','italic','underline','|','insertorderedlist','insertunorderedlist','|','image','|',
                    'removeformat','forecolor','hilitecolor'
                ]
            });
        });
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
    $scope.cancelMatch = function(fm_id,index)
    {
        if(confirm("您确定是否要删除该比赛！"))
        {
            $http.delete(baseurl +"4s/"+$.cookie("s4_id")+"/activity/"+fm_id).success(function(data){
                if(data.status == "ok")
                {
                    alert("删除成功！");
                    $scope.fuelMatch.splice(index, 1);
                    PagingInfo( $scope.totalCount-1);
                }
                else{
                    alert(data.status);
                }
            }).error(function(data){
                    alert("请求无响应");
            })
        }
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
        var editor;
        KindEditor.ready(function(K) {
            editor = K.create('textarea[name="content"]', {
                width : 380,
                height : 350,
                minWidth : 380,
                minHeight : 350,
                allowFileManager : true,
                items : [
                    'bold','italic','underline','|','insertorderedlist','insertunorderedlist','|','image','|',
                    'removeformat','forecolor','hilitecolor'
                ]
            });
        });
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

function changeImg(name)
{
    var filepath = $("#"+name).val();
    var extStart=filepath.lastIndexOf(".");
    var ext=filepath.substring(extStart,filepath.length).toUpperCase();
    if(ext!=".BMP"&&ext!=".PNG"&&ext!=".JPG"&&ext!=".JPEG"){
        alert("图片限于bmp,png,jpeg,jpg格式");
        $("#"+name).val("");
    }
    else{
//         $("#formId_edit").submit();
//          var ajax_option={
//            url:"/wservice/upload",//默认是form action
//
//            success:function(data){
//               alert(data.status);
//              }
//            };
//            $('#formId_edit').ajaxSubmit(ajax_option);



//       $.ajax({
//            cache: true,
//            type: "POST",
//            enctype:"multipart/form-data",
//            url:"/wservice/upload",
//            data:$('#formId_edit').serialize(),// 你的formid
//            async: false,
//            error: function(request) {
//            alert("Connection error");
//        },
//        success: function(data) {
//           alert(data.status);
//        }
//    });
    }
}