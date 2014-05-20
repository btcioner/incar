/**
 * Created by Liz on 14-03-26.
 */


function customerCtrl($scope, $http){

    $scope.customerListDiv = true;
    $scope.customerAddDiv = false;
    $scope.customerModifyDiv = false;
    $scope.comName = "";
    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.city_name="";
    $scope.org_name="";
    $scope.queryString="";
    $scope.openid="";


    //筛选框初始值 todo--要从数据库读出来
    $scope.allCity = [{name:"请选择"},{name:"武汉"},{name:"北京"}]
    $scope.org= [{name:"请选择"},{name:'4S店A'},{name:'4S店C1'},{name:'奥体中心4S店'}]


    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $http.get(baseurl + 'cmpx/4s?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString).success(function(data){
            if(data.status == "ok")
            {
                if(data.s4s.length == 0)
                {
                    $scope.tips="暂无数据！";
                }
                $scope.s4s = data.s4s;
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


    //按条件筛选行车数据行车数据
    $scope.SearchDriveInfo = function()
    {
        if($scope.city_name=="请选择")$scope.city_name="";
        if($scope.org_name=="请选择")$scope.org_name="";
        $scope.queryString = "&city="+$scope.city_name+"&name="+$scope.org_name;
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

    //分页跳转页面
    $scope.changePage=function(changeId)
    {
        $scope.currentPage = changeId ;
        GetFirstPageInfo()
   }

    //新增
    $scope.add = function(){
        $scope.customerListDiv = false;
        $scope.customerAddDiv = true;
    }

   //新增确定
    $scope.addConfirm = function(){
        var sha1_password =hex_sha1($scope.password);//SHA1进行加密
        $scope.postData={"name":$scope.comName,"class":"4S","status":1,"openid":"","city":$scope.city,"admin_pwd":sha1_password,
                           "admin_name":$scope.account,"admin_nick":$scope.admin_nick,"admin_phone":$scope.admin_phone,"openid":$scope.openid};
        $http.post(baseurl + 'cmpx/4s',$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                $scope.s4s[$scope.s4s.length]= {
                    id:$scope.s4s[$scope.s4s.length-1].id + 1,
                    name:$scope.comName,
                    status:"1",
                    openid:"",
                    city:$scope.city,
                    admin_name:$scope.account,
                    admin_nick:$scope.admin_nick,
                    admin_phone:$scope.admin_phone
                }
                GetFirstPageInfo();
                alert("添加成功");
                $scope.customerListDiv = true;
                $scope.customerAddDiv = false;
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
           alert("请求没响应");
          })
    }

    //返回按钮
   $scope.gotoBack = function(id)
   {
       switch(id)
       {
           case 2:
               $scope.customerListDiv = true;
               $scope.customerAddDiv = false;
                break;
           case 1:
               $scope.customerListDiv = true;
               $scope.customerModifyDiv = false;
                break;
       }
   }

    //修改按钮
    $scope.modify = function(id){
        $scope.index = id;
        $scope.customerListDiv = false;
        $scope.customerModifyDiv = true;
        $scope.oneCustomerInfo = $scope.orgs[id];
        $scope.id = $scope.orgs[id].id;
    }

    //修改确认
    $scope.modifyConfirm = function(oneCustomerInfo){
       $scope.oneCustomerInfo = oneCustomerInfo;
       $scope.postData={"name":$scope.oneCustomerInfo.name,"class":"4S","status":1,"openid":"","city":$scope.oneCustomerInfo.city,
                          "admin_nick":$scope.oneCustomerInfo.admin_nick,"admin_phone":$scope.oneCustomerInfo.admin_phone};
       $http.put(baseurl + 'organization/'+$scope.id, $scope.postData).success(function(data){
              if(data.status == "ok")
              {
                  alert("修改成功");
                  $scope.customerListDiv = true;
                  $scope.customerModifyDiv = false;
              }
           else{
                  alert(data.status);
              }
        }).error(function(data){
                  alert("请求没响应");
            })
    }

    //查看详情
   $scope.findDetail = function(index)
   {
       $http.get(baseurl + 'organization/'+index+"/obd").success(function(data){
           if(data.status == "ok")
           {
                if(data.devs.length == 0)
                {
                    alert("暂无行车数据");
                }
               else
                {
                   // alert(data.devs.length);
                }
           }
           else{
               alert(data.status);
           }
       }).error(function(data){
             alert("请求没响应");
       })
   }

    //删除
    $scope.deleteRecord = function(index){
        if(confirm("确定要删除吗？")){
            $scope.users.splice(index, 1);
        }
    }



}