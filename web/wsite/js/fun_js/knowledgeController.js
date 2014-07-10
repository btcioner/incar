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
    $scope.filename = "";

    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $scope.randomTime = new Date();
        getAjaxLink(baseurl + 'manual?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&t="+$scope.randomTime,"","get",1);
//        $http.get(baseurl + 'manual?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.randomTime).success(function(data){
//
//        }).error(function(data){
//                alert("请求无响应");
//        })
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
        $("#loading_0").css("display","none");
        $("#loaded_0").css("display","none");
        $("#imghead1").attr("src","../../data/200x200.jpg");
        $("#edit_pro_img_1").val("");
        $("#formId_edit3").ajaxForm(function(data){
            $("#loading_0").css("display","none");
            $("#loaded_0").css("display","block");
            $scope.filename = data.split("</pre>")[0].split(">")[1].split("\"")[9];
        });
        $scope.knowledgeListDiv = false;
        $scope.addKnowledgeDiv = true;
    }

    //添加确认
    $scope.AddConfirm = function()
    {
        if($("#loading_0").css("display")=="block"){
            alert("正在上传，请稍后提交...");
        }else{
           $scope.postData={title:$scope.title,keyword:$scope.keyword,description:$scope.description,filename:$scope.filename};
            $http.post(baseurl + "manual",$scope.postData).success(function(data){
                if(data.status == "ok")
                {
                    alert("添加成功");
                    GetFirstPageInfo();
                    $scope.knowledgeListDiv = true;
                    $scope.addKnowledgeDiv = false;
                }
            }).error(function(data){
                    alert("请求无响应！");
                });
        }
    }

    //修改
    $scope.modify = function(id){
        $("#loading_1").css("display","none");
        $("#loaded_1").css("display","none");
        $scope.knowDetail = $scope.manual[id];
        $("#imghead").attr("src","../../"+$scope.knowDetail.filename);
        $("#formId_edit2").ajaxForm(function(data){
            $("#loading_1").css("display","none");
            $("#loaded_1").css("display","block");
            $scope.knowDetail.filename = data.split("</pre>")[0].split(">")[1].split("\"")[9];
        });
        $scope.knowledgeListDiv = false;
        $scope.modifyKnowledgeDiv = true;

       // $("#formId_edit").attr("action", "/wservice/manual/"+ $scope.knowDetail.id);
    }
    //修改确认
    $scope.ModifyConfirm = function()
    {
        if($("#loading_1").css("display")=="block"){
            alert("正在上传，请稍后提交...");
        }else{
            $http.post(baseurl + "manual/"+$scope.knowDetail.id,$scope.knowDetail).success(function(data){
                if(data.status == "ok")
                {
                    alert("修改成功!");
                    GetFirstPageInfo();
                    $scope.knowledgeListDiv = true;
                    $scope.modifyKnowledgeDiv = false;
                }
            }).error(function(data){
                alert("请求无响应！");
            });
        }
    }

    //返回操作
    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 1:
                $scope.knowledgeListDiv = true;
                $scope.modifyKnowledgeDiv = false;
                GetFirstPageInfo();
                break;
            case 2:
                $scope.knowledgeListDiv = true;
                $scope.addKnowledgeDiv = false;
                GetFirstPageInfo();
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

//利用$http封装访问，并解决防盗链问题。
    function getAjaxLink(url,query,type,id)
    {
        if($.cookie("nick") != "")
        {
            //通过AngularJS自带的http访问。
            $http({ method: type, url: url, data:query}).success(function(data){
                if(data.status =="没有登录")
                {
                    alert("登录已超时！");
                    window.location="../login.html";
                }
                else{
                    getIndexData(id,data);
                }
            }). error(function(data){
                    alert("请求无响应");
                });
        }
        else{
            alert("登录已超时！");
            window.location="../login.html";
        }
    }

//在访问之后对数据进行处理
    function getIndexData(id,data)
    {
        switch(id)
        {
            case 1:
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
                break;
        }
    }
}

