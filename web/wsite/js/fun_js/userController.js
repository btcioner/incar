/**
 * Created by Liz on 14-02-27.
 */


function userManageCtrl($scope, $http){

    $scope.userAddDiv = false;
    $scope.userListDiv = true;
    $scope.userModifyDiv = false;

    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.roleName="ADMIN";
    $scope.email="";

    $scope.roles = [{id:1,name:"ADMIN"},
        {id:2,name:"READ"},
        {id:3,name:"WRITE"}]

    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $http.get(baseurl+'organization/1/account?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord).success(function(data){
            if(data.status == "ok")
            {
                if(data.accounts.length == 0)
                {
                    $scope.tips="暂无数据！";
                }
                for(var i = 0;i<data.accounts.length;i++ )
                {
                    data.accounts[i].last_login_time= $.changeDate(data.accounts[i].last_login_time);
                    if(data.accounts[i].status == 0)
                    {
                        data.accounts[i]["class"] = "btn btn-info btn-mini";
                        data.accounts[i].text = "解冻";
                    };
                    if(data.accounts[i].status == 1){
                        data.accounts[i]["class"] = "btn btn-warning btn-mini";
                        data.accounts[i].text = "冻结";
                    }
                    data.accounts[i].status= $.changeUserStatus(data.accounts[i].status);

                }
                $scope.accounts = data.accounts;
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
        $scope.currentPage = changeId ;
        GetFirstPageInfo()
    }

    //添加
    $scope.add = function(){
        $scope.userAddDiv = true;
        $scope.userListDiv = false;
    }
    //添加确认
    $scope.AddConfirm = function()
    {

        var sha1_password =hex_sha1($scope.password);//SHA1进行加密

        $scope.postData ={name:$scope.account,pwd:sha1_password,nick:$scope.nick,role:$scope.roleName,phone:$scope.phone,email:$scope.email,status:1};
        $http.post(baseurl + 'organization/1/account',$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                alert("添加成功！");
                $scope.accounts[$scope.accounts.length]={
                    id: $scope.accounts[$scope.accounts.length-1].id + 1,
                    name:$scope.account,
                    nick:$scope.nick,
                    role:$scope.roleName,
                    phone:$scope.phone,
                    email:$scope.email,
                    status:"正常"
                }
                $scope.userAddDiv = false;
                $scope.userListDiv = true;
                GetFirstPageInfo();
            }
            else{
                alert(data.status);
            }
        }).error(function(data){
                alert("请求没响应");
            })
    }

    //修改
    $scope.modify = function(index){
        $scope.id = index;
        $scope.userModifyDiv = true;
        $scope.userListDiv = false;
        $scope.userDetail = $scope.accounts[index];

    }
    //修改确认
    $scope.ModifyConfirm = function()
    {
        $http.put(baseurl + 'organization/1/account/'+$scope.userDetail.id,$scope.userDetail).success(function(data){
            if(data.status == "ok")
            {
                $scope.postData ={role:$scope.userDetail.role};
                $http.put(baseurl + 'organization/1/account/'+$scope.userDetail.id+'/role/ADMIN', $scope.postData).success(function(data){
                    if(data.status == "ok")
                    {
                        alert("修改成功");
                        $scope.userModifyDiv = false;
                        $scope.userListDiv = true;
                    }
                    else{
                        alert(data.status);
                    }
                }).error(function(data){
                        alert("请求没响应");
                });
            }
            else{
                alert(data.status);
            }
        }).error(function(data){
                alert("请求没响应");
            });
    }

    //返回
    $scope.gotoBack = function(id)
    {
       switch(id)
       {
           case 1:
               $scope.userModifyDiv = false;
               $scope.userListDiv = true;
               break;
           case 2:
               $scope.userAddDiv = false;
               $scope.userListDiv = true;
               break;
       }
    }

    $scope.freeze = function(index)
    {
        if($("#freezeId"+index).html() == "冻结")
        {
           if(confirm("是否要冻结"))
           {
               $http.put(baseurl + 'organization/1/account/'+ $scope.accounts[index].id,{status:0}).success(function(data){
                   if(data.status == "ok")
                   {
                       $scope.accounts[index].status="冻结";
                       $("#freezeId"+index).removeClass("btn btn-warning btn-mini");
                       $("#freezeId"+index).addClass("btn btn-info btn-mini");
                       $("#freezeId"+index).html("解冻");
                   }
                   else{
                       alert(data.status);
                   }
               }).error(function(data){
                       alert("请求没响应");
               });
           }
        }else if($("#freezeId"+index).html() == "解冻")
        {
            if(confirm("是否要解冻"))
            {
                $http.put(baseurl + 'organization/1/account/'+ $scope.accounts[index].id,{status:1}).success(function(data){
                    if(data.status == "ok")
                    {
                        $scope.accounts[index].status="正常";
                        $("#freezeId"+index).removeClass("btn btn-info btn-mini");
                        $("#freezeId"+index).addClass("btn btn-warning btn-mini");
                        $("#freezeId"+index).html("冻结");
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
}