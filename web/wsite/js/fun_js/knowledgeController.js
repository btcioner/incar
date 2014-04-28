/**
 * Created by 003383 on 14-2-27.
 */

function knowledgeBaseCtrl($scope, $http){

    $scope.knowledgeListDiv = true;
    $scope.modifyKnowledgeDiv = false;
    $scope.addKnowledgeDiv = false;
    $scope.keyword="";
    $scope.title="";
    $scope.description="";
    $scope.photo="";
    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.id = "";

    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $http.get(baseurl + 'manual?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord).success(function(data){
            if(data.status == "ok")
            {
                if(data.manual.length == 0)
                {
                    $scope.tips="暂无数据！";
                }
                $scope.manual = data.manual;
                PagingInfo(data.totalCount);
            }
            else
            {
                alert(data.status);
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
    $scope.changePage=function(changeId)
    {
        $scope.currentPage = changeId;
        GetFirstPageInfo();
    }

    //新增
    $scope.add = function(){
        $scope.knowledgeListDiv = false;
        $scope.addKnowledgeDiv = true;
    }

    //添加确认
    $scope.AddConfirm = function()
    {
        $("#formId").ajaxForm(function(){
            alert("添加成功");
            $scope.manual[$scope.manual.length] = {
                id:$scope.manual[length-1].id +1,
                keyword:$scope.keyword,
                title:$scope.title,
                description:$scope.description,
                filename:$("#pro_img").val()
            }
            GetFirstPageInfo();
            $scope.knowledgeListDiv = true;
            $scope.addKnowledgeDiv = false;
        });
    }

    //修改
    $scope.modify = function(id){
        $scope.knowledgeListDiv = false;
        $scope.modifyKnowledgeDiv = true;
        $scope.knowDetail = $scope.manual[id];
        $("#formId_edit").attr("action", "/wservice/manual/"+ $scope.knowDetail.id);
    }
    //修改确认
    $scope.ModifyConfirm = function()
    {
        $("#formId_edit").ajaxForm(function(){
            alert("修改成功");
            GetFirstPageInfo();
            $scope.knowledgeListDiv = true;
            $scope.modifyKnowledgeDiv = false;
        });
    }

    //返回操作
    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.knowledgeListDiv = true;
                $scope.modifyKnowledgeDiv = false;
                break;
            case 2:
                $scope.knowledgeListDiv = true;
                $scope.addKnowledgeDiv = false;
                break;
        }
    }

    //delete function
    $scope.deleteRecord = function(index){
       if(confirm("确定要删除吗？")){
            $http({ method: "delete", url: baseurl + 'manual/'+$scope.manual[index].id}).success(function(data){
                if(data.status == "ok")
                {
                    alert("删除成功！");
                    $scope.manual.splice(index, 1);
                    PagingInfo( $scope.totalCount-1);
                }
                else{
                    alert(data.status);
                }
            }).error(function(data){
                    alert("请求没响应");
            });
        }
    }


}

function clickFileName(name)
{
    var filepath = $("#"+name).val();
    var extStart=filepath.lastIndexOf(".");
    var ext=filepath.substring(extStart,filepath.length).toUpperCase();
    if(ext!=".BMP"&&ext!=".PNG"&&ext!=".JPG"&&ext!=".JPEG"){
        alert("图片限于bmp,png,jpeg,jpg格式");
        $("#"+name).val("");
    }
}