/**
 * Created by Liz on 14-03-25.
 */

//4s店设置页面
function s_systemCtrl($scope, $http){
    $scope.modifyDiv = false;
    $scope.settingListDiv = true;

    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
         $http.get(baseurl + "4s/"+ $.cookie("s4_id")).success(function(data){
              $scope.s4 = data.s4;
         }).error(function(data){
           alert("请求无响应！");
        });
    }

    //修改
    $scope.modify = function()
    {
        $("#formId_edit2").ajaxForm(function(data){
            $scope.s4.logo_url = data.split("</pre>")[0].split(">")[1].split("\"")[9];
        });
        $scope.modifyDiv = true;
        $scope.settingListDiv = false;
    }
    //保存修改
    $scope.modifyConfirm = function()
    {
        $http.put(baseurl + "4s/"+ $.cookie("s4_id"),$scope.s4).success(function(data){
           if(data.status == "ok")
           {
               alert("修改成功!");
               GetFirstPageInfo();
               $scope.modifyDiv = false;
               $scope.settingListDiv = true;
           }
        }).error(function(data){
                alert("请求无响应！");
        });
    }

    //返回or取消
    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.modifyDiv = false;
                $scope.settingListDiv = true;
            break;
        }
    }
}

//预览图片
function changeImg(file,plugId,formId,preId,imgId)
{
    var filepath = $("#"+plugId).val();
    var extStart=filepath.lastIndexOf(".");
    var ext=filepath.substring(extStart,filepath.length).toUpperCase();
    if(ext!=".BMP"&&ext!=".PNG"&&ext!=".JPG"&&ext!=".JPEG"){
        alert("图片限于bmp,png,jpeg,jpg格式");
        $("#"+plugId).val("");
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