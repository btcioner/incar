/**
 * Created by Liz on 14-04-08.
 */


 function s_activityCtrl($scope, $http){
    $scope.newsListDiv = true;
    $scope.newsAddDiv = false;
    $scope.titleMove = "";
    $scope.news_name = "";
    $scope.contentMove = "";
    $scope.news_content = "";
    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.title = "";
    $scope.brief = "";
    $scope.logo_url = "";
    $scope.tags = "";
    $scope.queryString = "";
    $scope.statusSelect =[{id:0,name:"请选择"},{id:1,name:"已创建"},{id:2,name:"已发布"}];
    $scope.ser_status = "";
    $scope.ser_title = "";

        GetFirstPageInfo();//get fist driveData for first page；
        function GetFirstPageInfo()
        {
            $scope.tips="";
            $http.get(baseurl +"4s/"+$.cookie("s4_id")+"/template/2/activity?page="+$scope.currentPage+"&pagesize="+$scope.pageRecord+$scope.queryString).success(function(data){
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
                                data.activities[i].tdStyle1 = "display:block";
                                data.activities[i].tdStyle2 = "display:none";
                            }
                            else{
                                data.activities[i].tdStyle1 = "display:none";
                                data.activities[i].tdStyle2 = "display:block";
                            }
                        }
                    }
                    $scope.activityList = data.activities;
                    PagingInfo(data.totalCount);
                }
            }).error(function(data){
                    alert("请求无响应");
            })
            $scope.queryString ="";
        }

    //条件筛选
    $scope.SearchDriveInfo = function()
    {
        if($scope.ser_status == 0)$scope.ser_status = "";
        $scope.queryString = "&status="+$scope.ser_status+"&title="+$scope.ser_title;
        GetFirstPageInfo();
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

    //添加按钮
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
        $scope.newsListDiv = false;
        $scope.newsAddDiv = true;
    }

        //获取所有客户标签接口
        function getAllTags(tags)
        {
            var tagArr = tags.split(",");
            $http.get("/tag/tagList/"+ $.cookie("s4_id")+"/8").success(function(data){

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


        //添加确认
    $scope.addConfirm = function()
    {
        getAllChooseTag();
        $scope.postData={title:$scope.title,brief:editor.html(),logo_url:$scope.logo_url,tags:$scope.tags};
        $http.post(baseurl +"4s/"+$.cookie("s4_id")+"/template/2/activity",$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                alert("添加成功!");
                GetFirstPageInfo();
                $scope.newsListDiv = true;
                $scope.newsAddDiv = false;
            }
        }).error(function(data){
                alert("请求无响应");
            })
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

   //修改按钮
    $scope.modify = function(id)
    {
        $scope.activityDetail = $scope.activityList[id];
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

        $scope.newsListDiv = false;
        $scope.newsModifyDiv = true;

        getAllTags( $scope.activityDetail.tags);
        editor.insertHtml($scope.activityDetail.brief);

    }

    //修改确认
    $scope.modifyConfirm = function()
    {
        getAllChooseTag();
        $scope.activityDetail.tags = $scope.tags;
        $scope.activityDetail.brief = editor.html();
        $http.put(baseurl +"4s/"+$.cookie("s4_id")+"/activity/"+$scope.activityDetail.id,$scope.activityDetail).success(function(data){
            if(data.status == "ok")
            {
                alert("修改成功!");
                GetFirstPageInfo();
                $scope.newsListDiv = true;
                $scope.newsModifyDiv = false;
            }
        }).error(function(data){
                alert("请求无响应");
        })
    }
    //预览
    $scope.preview = function(id)
    {
        alert(id);
        $scope.fuleMatchDetail = $scope.activityList[id];
        alert($scope.fuleMatchDetail.brief);
        $("#brief").text('');
        $("#brief").append($scope.fuleMatchDetail.brief);
        $scope.newsListDiv = false;
        $scope.newsPreviewDiv = true;
    }

    //发布确认
    $scope.publishConfirm = function(id)
    {
       if(confirm("确定要发布此活动资讯吗？"))
       {
           $http.put(baseurl +"4s/"+$.cookie("s4_id")+"/activity/"+id,{tm_announce:new Date()}).success(function(data){
               if(data.status == "ok")
               {
                   alert("发布成功!");
                   GetFirstPageInfo();
               }
           }).error(function(data){
                   alert("请求无响应");
            })
       }
    }

    $scope.cancelNews = function(fm_id,index)
    {
        if(confirm("您确定是否要删除该比赛！"))
        {
            $http.delete(baseurl +"4s/"+$.cookie("s4_id")+"/activity/"+fm_id).success(function(data){
                if(data.status == "ok")
                {
                    alert("删除成功！");
                    $scope.activityList.splice(index, 1);
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


    //标题改变
     $scope.tileChange = function()
     {
          $scope.titleMove = $scope.news_name;
         if($scope.news_name.length < 50)
         {
             $scope.titleMove = $scope.news_name;
         }
         else{
             $scope.titleMove = $scope.news_name.substring(0,50);
         }
     }
     //内容改变
     $scope.contentChange = function()
     {
         if($scope.news_content.length < 25)
         {
           $scope.contentMove = $scope.news_content;
         }
         else{
             $scope.contentMove = $scope.news_content.substring(0,25);
         }
     }

    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.newsListDiv = true;
                $scope.newsAddDiv = false;
                break;
            case 2:
                $scope.newsListDiv = true;
                $scope.newsModifyDiv = false;
                break;
            case 3:
                $scope.newsListDiv = true;
                $scope.newsPreviewDiv = false;
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