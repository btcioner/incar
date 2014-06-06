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
    $scope.currentPage = 1;//首页
    $scope.currentPage_1 = 1;//已发布
    $scope.currentPage_2 = 1;//已开始
    $scope.currentPage_3 = 1;//已结束
    $scope.currentPage_4 = 1;//已公布
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
    $scope.statusSelect =[{id:0,name:"请选择"},{id:1,name:"已创建"},{id:2,name:"已发布"},{id:3,name:"已开始"},{id:4,name:"已结束"},{id:5,name:"已公布"}];
    $scope.ser_status ="";
    $scope.monthSelect =[{id:0,name:"请选择"},{id:1,name:"一月"},{id:2,name:"二月"},{id:3,name:"三月"},{id:4,name:"四月"},{id:5,name:"五月"}
                          ,{id:6,name:"六月"},{id:7,name:"七月"},{id:8,name:"八月"},{id:9,name:"九月"},{id:10,name:"十月"},{id:11,name:"十一月"}
                          ,{id:12,name:"十二月"}]
    $scope.ser_month = "";
    $scope.ser_title = "";
    $scope.queryString = "";
    $scope.seriesCode = "";

    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $http.get(baseurl +"4s/"+$.cookie("s4_id")+"/template/1/activity?page="+$scope.currentPage+"&pagesize="+$scope.pageRecord+$scope.queryString).success(function(data){
            if(data.status == "ok")
            {
                if(data.activities.length ==0)
                {
                    $scope.tips="暂无数据";
                }
                else{
                    for(var i=0;i<data.activities.length;i++)
                    {
                        if(data.activities[i].status == "1")
                        {
                           data.activities[i].text1="预览";
                           data.activities[i].text2="修改";
                           data.activities[i].text3="删除";
                           data.activities[i].operation="modify";
                        }
                        else{
                            data.activities[i].text1="查看";
                            data.activities[i].text2="管理";
                            data.activities[i].text3="";
                            data.activities[i].operation="manager";
                        }
                    }
                }
                $scope.fuelMatch = data.activities;
                PagingInfo(data.totalCount);
            }
        }).error(function(data){
             alert("请求无响应");
        })
        $scope.queryString ="";
    }

    //按条件筛选行车数据行车数据
    $scope.SearchDriveInfo = function(flagId)
    {
       switch(flagId)
       {
           case 1://首页查询
               if($scope.ser_status == 0)$scope.ser_status = "";
               if($scope.ser_month == 0)$scope.ser_month = "";
               $scope.queryString = "&status="+$scope.ser_status+"&month="+$scope.ser_month+"&title="+$scope.ser_title;
               GetFirstPageInfo();
               break;
           case 2://开始
               $scope.queryString = "&series="+$scope.seriesCode;
               getSignUpList("",2);
               break;
           case 3://结束
               $scope.queryString = "&series="+$scope.seriesCode;
               getSignUpList("",3);
               break;
           case 4://公布
               $scope.queryString = "&series="+$scope.seriesCode;
               getSignUpList("&enough_mileage=true",4);
               break;
       }
    }

    //get paging param info
    function PagingInfo(totalCount,statusId)
    {
        $scope.totalCount = totalCount;
        $scope.totalPage = Math.ceil( $scope.totalCount /  $scope.pageRecord)
        $scope.totalOption=[{}];
        for(var i = 0 ;i< $scope.totalPage;i++)
        {
            $scope.totalOption[i]={size:i+1};
        }
    }

    //分页跳转页面--change--每个需要分页的currentPage都定义成不用的
    $scope.changePage=function(id,flagId)
    {
        if(flagId == "index")
        {
            $scope.currentPage = id ;
            GetFirstPageInfo();
        }
        else if(flagId == "announce")
        {
            $scope.currentPage_1 = id ;
            getSignUpList("",1);
        }
        else if(flagId == "start")
        {
            $scope.currentPage_2 = id ;
            getSignUpList("",2);
        }
        else if(flagId == "end")
        {
            $scope.currentPage_3 = id ;
            getSignUpList("",3);
        }
        else if(flagId == "publish")
        {
            $scope.currentPage_4 = id ;
            getSignUpList("&enough_mileage=true",4);
        }
    }

    //点击添加按钮
    $scope.add = function()
    {
        $("#formId_edit2").ajaxForm(function(data){
            $scope.logo_url = data.split("</pre>")[0].split(">")[1].split("\"")[9];
        });
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

        getAllTags("");
        $scope.matchListDiv = false;
        $scope.matchAddDiv = true;
    }
    //获取所有客户标签接口
    function getAllTags(tags)
    {
        var tagArr = tags.split(",");
        $http.get("/tag/tagList/8").success(function(data){

            $scope.tagsGroup = data;
            for(var i=0;i<$scope.tagsGroup.length;i++)
            {
                for(var j=0;j<$scope.tagsGroup[i].tags.length;j++)
                {
                    if(tags == "")
                    {
                      $scope.tagsGroup[i].tags[j].tagFlag="";
                    }
                    else{
                        var flag = false;
                       for(var m=0;m<tagArr.length-1;m++)
                       {
                           if($scope.tagsGroup[i].tags[j].tagId == tagArr[m])
                           {
                              flag = true;
                           }
                       }
                        if(flag)  $scope.tagsGroup[i].tags[j].tagFlag=true;
                        else $scope.tagsGroup[i].tags[j].tagFlag="";
                    }
                }
            }
        }).error(function(data){
                alert("请求无响应");
        });
    }

    //标题改变
    $scope.titleChange = function()
    {
        if($scope.title.length < 50)
        {
            $scope.titleMove = $scope.title;
        }
        else{
            $scope.titleMove = $scope.title.substring(0,50);
        }
    }
    //获取所有已选择的标签
    function getAllChooseTag()
    {
        $scope.tags = "";
        for(var i=0;i<$scope.tagsGroup.length;i++)
        {
            for(var j=0;j<$scope.tagsGroup[i].tags.length;j++)
            {
                if($scope.tagsGroup[i].tags[j].tagFlag==true){

                    $scope.tags =$scope.tags + $scope.tagsGroup[i].tags[j].tagId +",";

                }
            }
        }
    }
    //创建节油大赛
    $scope.AddConfirm = function()
    {
//      获取编辑器里面的内容 alert(editor.html());
        getAllChooseTag();
        $scope.postData={title:$scope.title,brief:editor.html(),tm_announce:$scope.tm_announce,tm_start:$scope.tm_start,
        tm_end:$scope.tm_end,min_milage:$scope.min_milage,logo_url:$scope.logo_url,tags:$scope.tags};
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
    //管理
    $scope.manager = function(fm_id,index,fm_status)
    {
        $scope.fuleMatchDetail = $scope.fuelMatch[index];
       switch(fm_status)
       {
           case 1:
               $("#formId_edit3").ajaxForm(function(data){
                   $scope.fuleMatchDetail.logo_url = data.split("</pre>")[0].split(">")[1].split("\"")[9];
               });
               KindEditor.ready(function(K) {
                   editor = K.create('#content_1', {
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
               getAllTags( $scope.fuleMatchDetail.tags);
              // alert(editor.html());
               editor.insertHtml($scope.fuleMatchDetail.brief);

               break;
           case 2: //已发布
               getSignUpList("",1);
               $scope.matchPublishedDiv = true;
               $scope.matchListDiv = false;
               break;
           case 3://已开始
               getSignUpList("",2);
               getSeries();
               $scope.matchStartedDiv = true;
               $scope.matchListDiv = false;
               break;
           case 4://已结束
               getSignUpList("",3);
               getSeries();
               $scope.matchFinishedDiv = true;
               $scope.matchListDiv = false;
               break;
           case 5://已公布
               getSignUpList("&enough_mileage=true",4);
               getSeries();
               $scope.matchPrizedDiv = true;
               $scope.matchListDiv = false;
               break;
       }
    }

    //获取车系
    function getSeries()
    {
        $http.get(baseurl+'brand/8/series').success(function(data){
            $scope.carSeries = data.series;
        });
    }

    //提取公共的用户报名信息
    function getSignUpList(queryString,statusId)
    {
        $scope.tips = "";
        switch(statusId)
        {
            case 1://已发布
                $scope.currentPage_var = $scope.currentPage_1;
                break;
            case 2:
                $scope.currentPage_var = $scope.currentPage_2;
                break;
            case 3:
                $scope.currentPage_var = $scope.currentPage_3;
                break;
            case 4:
                $scope.currentPage_var = $scope.currentPage_4;
                break;

        }
        $http.get(baseurl +"4s/"+$.cookie("s4_id")+"/activity/"+ $scope.fuleMatchDetail.id+"/cust?page="+$scope.currentPage_var+"&pagesize="+$scope.pageRecord+queryString+$scope.queryString).success(function(data){
            if(data.status == "ok")
            {

                if(data.members.length == 0)
                {
                    $scope.tips = "暂无数据";
                }
                else{
                    for(var i=0;i<data.members.length;i++)
                    {
                        if(data.members[i].mileage >= $scope.fuleMatchDetail.min_milage)
                        {
                            data.members[i].milageFlag ="是";
                        }
                        else
                        {
                            data.members[i].milageFlag ="否";
                        }
                    }

                }

                $scope.members = data.members;
                PagingInfo(data.totalCount);
            }
           }).error(function(data){
                alert("请求无响应");
            })
        if(queryString !="")
        {
            $("#awardsInfo").text('');
            $("#awardsInfo").append($scope.fuleMatchDetail.awards);
        }
        $scope.queryString = "";
    }

    //修改确认
    $scope.modifyConfirm = function()
    {
        getAllChooseTag();
        $scope.fuleMatchDetail.tags = $scope.tags;
        $scope.fuleMatchDetail.brief = editor.html();
        $http.put(baseurl +"4s/"+$.cookie("s4_id")+"/activity/"+$scope.fuleMatchDetail.id,$scope.fuleMatchDetail).success(function(data){
            if(data.status == "ok")
            {
                alert("修改成功!");
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchModifyDiv = false;
            }
        }).error(function(data){
                alert("请求无响应");
            })
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
//    $scope.InfoView = function(sta)
//    {
//        switch(sta)
//        {
//            case "已发布":
//                $scope.matchPublishedDiv = true;
//                $scope.matchListDiv = false;
//                break;
//            case "已开始":
//                $scope.matchStartedDiv = true;
//                $scope.matchListDiv = false;
//                break;
//            case "已结束":
//                $scope.matchFinishedDiv = true;
//                $scope.matchListDiv = false;
//                break;
//            case "已公布":
//                $scope.matchPrizedDiv = true;
//                $scope.matchListDiv = false;
//                break;
//        }
//    }
    //发布结果按钮
    $scope.publishResult = function(id)
    {
        KindEditor.ready(function(K) {
            editor = K.create('#content_2', {
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
        $scope.postData={"awards":editor.html(),"status":5};
        $http.put(baseurl +"4s/"+$.cookie("s4_id")+"/activity/"+$scope.fuleMatchDetail.id, $scope.postData).success(function(data){
            if(data.status == "ok")
            {
                alert("发布结果成功!");
                GetFirstPageInfo();
            }
        }).error(function(data){
                alert("请求无响应");
            })
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
            case 1://添加-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchAddDiv = false;
                break;
            case 2://预览-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchPreviewDiv = false;
                break;
            case 3://修改-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchModifyDiv = false;
                break;
            case 4://已发布-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchPublishedDiv = false;
                break;
            case 5://已开始-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchStartedDiv = false;
                break;
            case 6://结束-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchFinishedDiv = false;
                break;
            case 7://公布-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchPrizedDiv = false;
                break;
            case 8://发布结果-结束
                getSignUpList("",3);
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

function changeImg(file,plugId,formId,preId,imgId)
{
    var filepath = $("#"+plugId).val();
    var extStart=filepath.lastIndexOf(".");
    var ext=filepath.substring(extStart,filepath.length).toUpperCase();
    if(ext!=".BMP"&&ext!=".PNG"&&ext!=".JPG"&&ext!=".JPEG"){
        alert("图片限于bmp,png,jpeg,jpg格式");
        $("#edit_pro_img").val("");
    }
    else{
            var MAXWIDTH  = 260;
            var MAXHEIGHT = 180;
            var div = document.getElementById(preId);
            if (file.files && file.files[0])
            {
                div.innerHTML ='<img id='+imgId+'>';

                var img = document.getElementById(imgId);

                img.onload = function(){
                 var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight);

                    img.width  =  rect.width;

                    img.height =  rect.height;

//                 img.style.marginLeft = rect.left+'px';

                    img.style.marginTop = rect.top+'px';
                }
                var reader = new FileReader();

                reader.onload = function(evt){img.src = evt.target.result;}

                reader.readAsDataURL(file.files[0]);
            }
            else //兼容IE
            {
                var sFilter='filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="';

                file.select();

                var src = document.selection.createRange().text;

                div.innerHTML = '<img id='+imgId+'>';

                var img = document.getElementById(imgId);

                img.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = src;

                var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight);

                status =('rect:'+rect.top+','+rect.left+','+rect.width+','+rect.height);

                div.innerHTML = "<div id=divhead style='width:"+rect.width+"px;height:"+rect.height+"px;margin-top:"+rect.top+"px;"+sFilter+src+"\"'></div>";

            }
        }

      $("#"+formId).submit();

}
function clacImgZoomParam( maxWidth, maxHeight, width, height ){

    var param = {top:0, left:0, width:width, height:height};

    if( width>maxWidth || height>maxHeight )
    {
        rateWidth = width / maxWidth;
        rateHeight = height / maxHeight;
        if( rateWidth > rateHeight )
        {
            param.width =  maxWidth;

            param.height = Math.round(height / rateWidth);
        }else

        {
            param.width = Math.round(width / rateHeight);
            param.height = maxHeight;
        }
    }


 //   param.left = Math.round((maxWidth - param.width) / 2);

   // param.top = Math.round((maxHeight - param.height) / 2);
    param.width = 150;
    param.height = 150;
    param.left = 0;
    param.top = 0;
    return param;

}