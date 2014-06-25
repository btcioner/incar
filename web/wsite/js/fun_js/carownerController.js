/**
 * Created by Liz on 14-04-03.
 */

function carOwnersCtrl($scope, $http){
    $scope.carOwnerDiv = true;
    $scope.carOwnerModifyDiv = false;
    $scope.carOwnerAddDiv = false;
    $scope.detailDiv = false;
    $scope.oneDetailDiv = false;
    $scope.oneMinuteDetailDiv = false;

    $scope.currentPage = 1;
    $scope.pageRecord = 10;
    $scope.city_name="";
    $scope.s4_id = "";
    $scope.queryString="";
    $scope.brandCode = "";
    $scope.acc_nick = ""
    $scope.acc_phone = "";
    $scope.queryNick = "";
    $scope.queryPhone = "";
    $scope.obd_code="";
    $scope.car_license="";

    //筛选框初始值 todo--要从数据库读出来
    $scope.allCity = [{name:"请选择"},{name:"武汉"},{name:"北京"}]

    GetFirstPageInfo();//get fist driveData for first page；
    getPrepareFun();
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $scope.randomTime = "&t="+new Date();
        getAjaxLink(baseurl + 'cmpx/carowner?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString+$scope.randomTime,"","get",1);
//        $http.get(baseurl + 'cmpx/carowner?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString+$scope.randomTime).success(function(data){
//
//        }).error(function(data){
//        alert("请求无响应");
//        })

    }
    //预备函数
    function getPrepareFun()
    {
        $http.get(baseurl+'brand').success(function(data){
            $scope.carBrand = data.brands;
        });
        $http.get(baseurl+'4s').success(function(data){
            $scope.s4s = data.s4s;
        });
    }



    //按条件筛选行车数据行车数据
    $scope.SearchDriveInfo = function()
    {
        if($scope.city_name=="请选择")$scope.city_name = "";
        $scope.queryString = "&org_city="+$scope.city_name+"&org_id="+$scope.s4_id+"&brand_id="+$scope.brandCode+"&acc_nick="+$scope.queryNick+"&acc_phone="+$scope.queryPhone+"&license="+$scope.car_license;
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
    $scope.changePage=function(changeId,id)
    {
        $scope.currentPage = changeId ;
        switch(id)
        {
            case 1://设备列表
                GetFirstPageInfo();
                break;
            case 2: //行车数据
                $scope.GetDriveInfo($scope.choosedOC);
                break;
            case 3://行程数据
                $scope.GetDriveDetail($scope.choosedOC,$scope.drive_id,$scope.index);
                break;
        }
        $scope.currentPage = 1;

    }

    //修改
    $scope.modify = function(index){
        $scope.carOwnerDiv = false;
        $scope.carOwnerModifyDiv = true;
        $scope.carOwnerDetail = $scope.carowners[index];
    }

    //修改确认
    $scope.ModifyConfirm = function()
    {
        $scope.postData={nick:$scope.carOwnerDetail.acc_nick,phone:$scope.carOwnerDetail.acc_phone};
        //4s/:s4_id/cust/:cust_id
        $http.put(baseurl + '4s/'+$scope.carOwnerDetail.org_id+'/cust/'+$scope.carOwnerDetail.acc_id,$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                alert("修改成功");
                GetFirstPageInfo();
                $scope.carOwnerDiv = true;
                $scope.carOwnerModifyDiv = false;
            }
            else{
                alert(data.status);
            }
        }).error(function(data){
                alert("请求没响应");
        });
    }

    //添加按钮
    $scope.add = function(){
        $scope.acc_name="";
        $scope.acc_nick="";
        $scope.acc_phone="";
        $scope.brand_id="";
        $scope.series_id="";
        $scope.series_id="";
        $scope.obd_code=="";
        $scope.carOwnerDiv = false;
        $scope.carOwnerAddDiv = true;
    }

    //添加确认
    $scope.AddConfirm = function()
    {
        var sha1_password =hex_sha1($scope.acc_pwd);//SHA1进行加密
        $scope.postData ={"org_id":$scope.org_id,
                           "acc_name":$scope.acc_name,
                           "acc_pwd":sha1_password,
                           "acc_nick":$scope.acc_nick,
                           "acc_phone":$scope.acc_phone,
                           "brand_id":$scope.brand_id,
                           "series_id":$scope.series_id,
                           "car_license":$scope.car_license,
                           "obd_code":$scope.obd_code};
        $http.post(baseurl + 'carowner',$scope.postData).success(function(data){
            if(data.status == "ok")
            {
                alert("添加成功！");
                GetFirstPageInfo();
//                $scope.carowners[$scope.carowners.length]={
//                    "acc_id": $scope.carowners[$scope.carowners.length-1].id + 1,
//                    "org_id":$scope.org_id,
//                    "acc_name":$scope.acc_name,
//                    "acc_nick":$scope.acc_nick,
//                    "acc_phone":$scope.acc_phone,
//                    "car_brand":$scope.brand_id,
//                    "car_series":$scope.series_id,
//                    "car_license":$scope.series_id,
//                    "obd_code":$scope.obd_code
//                }
                $scope.carOwnerDiv = true;
                $scope.carOwnerAddDiv = false;

            }
            else{
                alert(data.status);
            }
        }).error(function(data){
                alert("请求没响应");
            })
    }

    //get owner and car info  缺少所属4s店
    function GetOwnerInfo(obd_code)
    {
        $scope.randomTime = new Date();
        $http.get(baseurl + 'obd/'+obd_code+"?t="+$scope.randomTime).success(function(data){
            if(data.status == "ok")
            {
                $scope.deviceDetail = data.car;
                $scope.deviceDetail.obdNum = obd_code;
                $scope.deviceDetail.act_type = $.changeStatus($scope.deviceDetail.act_type);
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
                alert("请求无响应");
            });
    }
    //查看一个OBD的行车数据
    $scope.GetDriveInfo = function(obd_code)
    {
        $scope.choosedOC = obd_code;
        GetOwnerInfo(obd_code);
        $scope.randomTime = new Date();
        $http.get(baseurl + 'cmpx/drive_info?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord +'&obd_code='+obd_code+"&t="+$scope.randomTime)
            .success(function(data){
                if(data.status == "ok")
                {
                    if(data.drvInfos.length == 0)
                    {
                        alert("暂无行车数据");
                    }
                    else
                    {
                        $scope.drvInfos = data.drvInfos;
                        for(var i=0;i<data.drvInfos.length;i++)
                        {
                            $scope.drvInfos[i].carStatus = $.changeCarStatus( $scope.drvInfos[i].carStatus);
                            $scope.drvInfos[i].fireTime = $.changeDate($scope.drvInfos[i].fireTime);
                            $scope.drvInfos[i].flameOutTime = $.changeDate($scope.drvInfos[i].flameOutTime);
                        }
                        $scope.detailDiv = true;
                        $scope.carOwnerDiv = false;

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
    //查看一个OBD一次行程的数据
    $scope.GetDriveDetail = function(obd_code,drive_id,id)
    {
        $scope.tips="";
        $scope.choosedOC = obd_code;
        $scope.drive_id = drive_id;
        $scope.index = id;
        GetOwnerInfo(obd_code);
        $scope.driveDetail = $scope.drvInfos[id];
        $scope.randomTime = new Date();
        $http.get(baseurl + 'cmpx/drive_detail/'+obd_code+'/'+drive_id+'?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&t="+$scope.randomTime).success(function(data){
            if(data.status == "ok")
            {
                if(data.details.length== 0)
                {
                    $scope.tips = "暂无数据";
                }
                else
                {
                    for(var i=0;i<data.details.length;i++)
                    {
                        data.details[i].createTime = $.changeDate(data.details[i].createTime);
                    }
                }
                $scope.detailDiv = false;
                $scope.oneDetailDiv = true;
                $scope.details = data.details;
                PagingInfo(data.totalCount);
            }
            else
            {
                alert(data.status);
            }
        }).error(function(data){
                alert("请求无响应");
            });
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

    //在访问之后对数据进行处理
    function getIndexData(id,data)
    {
        switch(id)
        {
            case 1:
                if(data.status == "ok")
                {
                    if(data.carowners.length == 0)
                    {
                        $scope.tips="暂无数据！";
                    }
                    $scope.carowners = data.carowners;
                    PagingInfo(data.totalCount);
                }
                else
                {
                    alert(data.status);
                }
                break;
        }
    }

    //一分钟内的行车数据流记录
    $scope.GetOneMinuteDetail = function(index)
    {
        if($scope.details[index].detail == null || $scope.details[index].detail.length == 0)
        {
            alert("暂无详细数据");
        }
        else
        {
            $scope.omdds = $scope.details[index].detail;
            $scope.oneDetailDiv = false;
            $scope.oneMinuteDetailDiv = true;
        }
    }

    //返回按钮
    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 2:
                $scope.carOwnerDiv = true;
                $scope.carOwnerAddDiv = false;
                GetFirstPageInfo();
                break;
            case 1:
                $scope.carOwnerDiv = true;
                $scope.carOwnerModifyDiv = false;
                GetFirstPageInfo();
                break;
            case 3://行程数据返回
                $scope.oneDetailDiv = false;
                $scope.detailDiv = true;
                $scope.GetDriveInfo($scope.choosedOC);
                break;
            case 4://行车数据返回
                $scope.detailDiv = false;
                $scope.carOwnerDiv=true;
                GetFirstPageInfo();
                break;
            case 5://数据流记录
                $scope.oneMinuteDetailDiv = false;
                $scope.oneDetailDiv = true;
                $scope.GetDriveDetail($scope.choosedOC,$scope.drive_id,$scope.index);
                break;
        }
    }

}