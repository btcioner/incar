/**
 * Created by liz on 14-03-30.
 */


function driveDataCtrl($scope, $http){

    $scope.driveDiv = true;
    $scope.oneDetailDiv = false;
    $scope.oneMinuteDetailDiv = false;


    //请求行车数据列表
    $scope.pageRecord = 10;
    $scope.currentPage = 1;
    $scope.obd_num="";
    $scope.city_name="";
    $scope.org_name="";
    $scope.queryString="";

    //筛选框初始值 todo--要从数据库读出来
    $scope.city = [{name:"请选择"},{name:"武汉"},{name:"北京"}]
    $scope.org= [{name:"请选择"},{name:'4S店A'},{name:'4S店C1'},{name:'奥体中心4S店'}]


    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $http.post(baseurl+'GetDriveInfoAll?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString).success(function(data){
            if(data.status == "ok")
            {
                if(data.drvInfos.length == 0)
                {
                    $scope.tips="暂无数据！";
                }
               // $.changeContentHeight("850px");
                $scope.drvInfos = data.drvInfos;
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
          $scope.queryString = "&obd_code="+$scope.obd_num+"&city="+$scope.city_name+"&org="+$scope.org_name;
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




    //paging redirct
    $scope.changePage=function(changeId,id)
    {
        $scope.currentPage = changeId;
        switch(id)
        {
            case 1:
                GetFirstPageInfo();
                break;
            case 2:
                $scope.GetDriveDetail($scope.chooseOC,$scope.drive_id);
                break;
        }
    }
    //get owner and car info  缺少所属4s店
    function GetOwnerInfo(obd_code)
    {
        $http.get(baseurl + 'obd/'+obd_code).success(function(data){
            if(data.status == "ok")
            {
               $scope.deviceDetail = data.obd;
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
                alert("请求无响应");
        });
    }
    //查看一个OBD一次行程的数据
    $scope.GetDriveDetail = function(obd_code,drive_id)
    {
        $scope.chooseOC = obd_code;
        $scope.drive_id = drive_id;
        $scope.postData = {token:$scope.token,code:obd_code,drive_id:drive_id};
        GetOwnerInfo(obd_code);
        $http.post(baseurl + 'GetDriveDetail?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord,$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                if(data.details.length== 0)
                {
                    alert("暂无行程数据");
                }
                else{
                   // $.changeContentHeight("630px");
                    $scope.driveDiv = false;
                    $scope.oneDetailDiv = true;
                    $scope.details = data.details;
                    PagingInfo(data.totalCount);
                }
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
                alert("请求无响应");
            });
    }


    //一分钟内的行车数据流记录
    $scope.GetOneMinuteDetail = function(index)
    {
        if($scope.details[index].CarCondition.detail == null || $scope.details[index].CarCondition.detail.length == 0)
        {
             alert("暂无详细数据");
        }
        else
        {
           // $.changeContentHeight("1000px");
            $scope.omdds = $scope.details[index].CarCondition.detail;
            $scope.oneDetailDiv = false;
            $scope.oneMinuteDetailDiv = true;
        }
    }

   //返回操作
    $scope.gotoBack = function(id)
    {
        $scope.currentPage = 1;
        switch(id)
        {
            case 1: //行程返回行车
                $scope.driveDiv = true;
                $scope.oneDetailDiv = false;
                GetFirstPageInfo();
                break;
            case 2: //数据流数据返回行程
                $scope.oneDetailDiv = true;
                $scope.oneMinuteDetailDiv = false;
                $scope.GetDriveDetail($scope.chooseOC,$scope.drive_id);
                break;

        }
    }




    //删除
    $scope.deleteRecord = function(index){
        if(confirm("确定要删除吗？")){
            $scope.users.splice(index, 1);
        }
    }
}