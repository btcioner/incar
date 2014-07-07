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
    $scope.account="";
    $scope.password="";
    $scope.city="";
    $scope.s4_name="";
    $scope.brand_id="";
    $scope.admin_phone="";
    $scope.admin_nick="";
    $scope.short_name = "";
    //筛选框初始值 todo--要从数据库读出来
    $scope.allCity = [{name:"请选择"},{name:"武汉"},{name:"北京"}];

    GetFirstPageInfo();//get fist driveData for first page；
    getPrepareFun();//获取预备函数
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $scope.randomTime = new Date();
        getAjaxLink(baseurl + 'cmpx/4s?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString+"&t="+$scope.randomTime,"","get",1);
    }
    //在访问之后对数据进行处理
    function getIndexData(id,data)
    {
      switch(id)
      {
          case 1: //获取4s店首页
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
            break;
        case 2: //确认修改
            if(data.status == "ok")
            {
                getAjaxLink(baseurl + '4s/'+$scope.id+'/staff/'+$scope.admin_id,$scope.postData1,"put",3);
            }
            else{
                alert(data.status);
            }
            break;
          case 3://确认修改2
              if(data.status == "ok")
              {
                  alert("修改成功");
                  GetFirstPageInfo();//get fist driveData for first page；
                  $scope.customerListDiv = true;
                  $scope.customerModifyDiv = false;
              }
              break;
          case 4://确认添加
              if(data.status == "ok")
              {
                  alert("添加成功");
                  GetFirstPageInfo();
                  $scope.customerListDiv = true;
                  $scope.customerAddDiv = false;
              }
              else
              {
                  alert(data.status);
              }
              break;
      }
    }

    //利用$http封装访问，并解决防盗链问题。
    function getAjaxLink(url,query,type,id)
    {
        if($.cookie("nick") != "" && $.cookie("nick") != null)
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

    //预备函数
    function getPrepareFun()
    {
        $http.get(baseurl+'4s').success(function(data){
            $scope.s4s_all = data.s4s;
        });
        $http.get(baseurl+'brand').success(function(data){
            $scope.carBrand = data.brands;
        });

    }


    //按条件筛选行车数据行车数据
    $scope.SearchDriveInfo = function()
    {
         if($scope.city_name=="请选择")$scope.city_name="";
         $scope.queryString = "&city="+$scope.city_name+"&name="+$scope.s4_name;
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
        $scope.comName="";
        $scope.city="";
        $scope.password="";
        $scope.account="";
        $scope.admin_nick="";
        $scope.admin_phone="";
        $scope.openid="";
        $scope.customerListDiv = false;
        $scope.customerAddDiv = true;
        $scope.wx_oauth_addr = "";
        $scope.wx_app_id  ="";
        $scope.wx_app_name = "";
        $scope.wx_app_secret = "";
    }

   //新增确定
    $scope.addConfirm = function(){

        var sha1_password =hex_sha1($scope.password);//SHA1进行加密
        $scope.postData={"name":$scope.comName,"class":"4S","status":1,"city":$scope.city,"admin_pwd":sha1_password,
            "admin_name":$scope.account,"admin_nick":$scope.admin_nick,"admin_phone":$scope.admin_phone,"openid":$scope.openid,
            brand:$scope.brand_id,short_name:$scope.short_name,wx_oauth_addr:$scope.wx_oauth_addr,wx_app_name:$scope.wx_app_name,
            wx_app_id:$scope.wx_app_id,wx_app_secret:$scope.wx_app_secret};
        getAjaxLink(baseurl + 'cmpx/4s',$scope.postData,"post",4);

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
        $scope.oneCustomerInfo = $scope.s4s[id];
        $scope.id = $scope.s4s[id].id;
        $scope.admin_id=$scope.s4s[id].admin_id;
        $scope.customerListDiv = false;
        $scope.customerModifyDiv = true;
    }

    //修改确认
    $scope.modifyConfirm = function(oneCustomerInfo){
       $scope.oneCustomerInfo = oneCustomerInfo;
       $scope.postData={"name":$scope.oneCustomerInfo.name,"class":"4S","status":1,"openid":$scope.oneCustomerInfo.openid,"city":$scope.oneCustomerInfo.city,
                        short_name:$scope.oneCustomerInfo.short_name,brand:$scope.oneCustomerInfo.brand,wx_oauth_addr:$scope.oneCustomerInfo.wx_oauth_addr,
                        wx_app_id:$scope.oneCustomerInfo.wx_app_id,wx_app_name:$scope.oneCustomerInfo.wx_app_name,wx_app_secret:$scope.oneCustomerInfo.wx_app_secret};
       $scope.postData1={"nick":$scope.oneCustomerInfo.admin_nick,"phone":$scope.oneCustomerInfo.admin_phone}

       getAjaxLink(baseurl + '4s/'+$scope.id,$scope.postData,"put",2);
    }

}