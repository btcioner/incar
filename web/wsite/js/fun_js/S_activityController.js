/**
 * Created by Liz on 14-04-08.
 */


angular.module("SActivityApp").
    controller("s_activityCtrl", function($scope, $http){
    $scope.newsListDiv = true;
    $scope.newsAddDiv = false;
    $scope.titleMove = "";
    $scope.news_name = "";
    $scope.contentMove = "";
    $scope.news_content = "";

    //添加按钮
    $scope.add = function()
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
        $scope.newsListDiv = false;
        $scope.newsAddDiv = true;
    }

    //添加确认
    $scope.addConfirm = function()
    {
        $scope.newsListDiv = true;
        $scope.newsAddDiv = false;
    }

   //修改按钮
    $scope.modify = function(id)
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
        $scope.newsListDiv = false;
        $scope.newsModifyDiv = true;
    }

    //修改确认
    $scope.modifyConfirm = function(id)
    {
        $scope.newsListDiv = true;
        $scope.newsModifyDiv = false;
    }
    //预览
    $scope.preview = function(id)
    {
        $scope.newsListDiv = false;
        $scope.newsPreviewDiv = true;
    }

    //发布确认
    $scope.publishConfirm = function(id)
    {
        confirm("确定要发布此活动资讯吗？");
    }

    $scope.cancelNews = function(id)
    {
        confirm("确定要删除此活动资讯吗？");
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
})