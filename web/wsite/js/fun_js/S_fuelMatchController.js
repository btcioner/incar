/**
 * Created by Liz on 14-04-08.
 */

function s_fuelMatchCtrl($scope,$http,$routeParams)
{
    $scope.matchListDiv = true;
    $scope.matchModifyDiv = false;
    $scope.matchPreviewDiv = false;
    $scope.matchPublishedDiv = false;
    $scope.matchAddDiv = false;
    $scope.flagid = "";
    $scope.currentPage = 1;//首页
    $scope.currentPage_1 = 1;//已发布
    $scope.currentPage_2 = 1;//已开始
    $scope.currentPage_3 = 1;//已结束
    $scope.currentPage_4 = 1;//已公布
    $scope.pageRecord = 10;
    $scope.statusSelect =[{id:0,name:"请选择"},{id:1,name:"已创建"},{id:2,name:"已发布"},{id:3,name:"已开始"},{id:4,name:"已结束"},{id:5,name:"已公布"}];
    $scope.ser_status ="";
    $scope.monthSelect =[{id:0,name:"请选择"},{id:1,name:"一月"},{id:2,name:"二月"},{id:3,name:"三月"},{id:4,name:"四月"},{id:5,name:"五月"}
                          ,{id:6,name:"六月"},{id:7,name:"七月"},{id:8,name:"八月"},{id:9,name:"九月"},{id:10,name:"十月"},{id:11,name:"十一月"}
                          ,{id:12,name:"十二月"}]
    $scope.ser_month = "";
    $scope.ser_title = "";
    $scope.queryString = "";
    $scope.seriesCode = "";
    $scope.disp = "";
    if($routeParams.id != null)
    {
        $scope.queryString = "&status="+$routeParams.id;
    }

    function initAddData()
    {
        $scope.title = "";
        $scope.brief = "";
        $scope.tm_announce = "";
        $scope.tm_start = "";
        $scope.tm_end = "";
        $scope.min_milage = "";
        $scope.logo_url = "";
        $scope.titleMove = "";
        $scope.checkboxId_1 = false;
    }
    $scope.tags = "";
    GetFirstPageInfo();//get fist driveData for first page；
    function GetFirstPageInfo()
    {
        $scope.tips="";
        $scope.randomTime = new Date();
        $http.get(baseurl +"4s/"+$.cookie("s4_id")+"/template/1/activity?page="+$scope.currentPage+"&pagesize="+$scope.pageRecord+$scope.queryString+"&t="+$scope.randomTime).success(function(data){
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
                            data.activities[i].tdStyle1 = true;
                            data.activities[i].tdStyle2 = false;
                        }
                        else{
                            data.activities[i].tdStyle1 = false;
                            data.activities[i].tdStyle2 = true;
                        }
                    }
                }
                $scope.fuelMatch = data.activities;
                PagingInfo(data.totalCount);
            }
        }).error(function(data){
             alert("请求无响应");
        })
        $scope.queryString ="";
    }

    //按条件筛选行车数据行车数据
    $scope.SearchDriveInfo = function(flagId)
    {
       switch(flagId)
       {
           case 1://首页查询
               if($scope.ser_status == 0)$scope.ser_status = "";
               if($scope.ser_month == 0)$scope.ser_month = "";
               $scope.queryString = "&status="+$scope.ser_status+"&month="+$scope.ser_month+"&title="+$scope.ser_title;
               GetFirstPageInfo();
               break;
           case 2://开始
               $scope.queryString = "&series="+$scope.seriesCode+"&disp="+$scope.disp;
               getSignUpList("",2);
               break;
           case 3://结束
               $scope.queryString = "&series="+$scope.seriesCode+"&disp="+$scope.disp;
               getSignUpList("",3);
               break;
           case 4://公布
               $scope.queryString = "&series="+$scope.seriesCode+"&disp="+$scope.disp;
               getSignUpList("&enough_mileage=true",4);
               break;
       }
    }

    //get paging param info
    function PagingInfo(totalCount)
    {
        $scope.totalCount = totalCount;
        $scope.totalPage = Math.ceil( $scope.totalCount /  $scope.pageRecord);
        $scope.totalOption=[{}];
        for(var i = 0 ;i< $scope.totalPage;i++)
        {
            $scope.totalOption[i]={size:i+1};
        }
    }

    //分页跳转页面--change--每个需要分页的currentPage都定义成不用的
    $scope.changePage=function(id,flagId)
    {
        if(flagId == "index")
        {
            $scope.currentPage = id ;
            GetFirstPageInfo();
        }
        else if(flagId == "announce")
        {
            $scope.currentPage_1 = id ;
            getSignUpList("",1);
        }
        else if(flagId == "start")
        {
            $scope.currentPage_2 = id ;
            getSignUpList("",2);
        }
        else if(flagId == "end")
        {
            $scope.currentPage_3 = id ;
            getSignUpList("",3);
        }
        else if(flagId == "publish")
        {
            $scope.currentPage_4 = id ;
            getSignUpList("&enough_mileage=true",4);
        }
    }

    //点击添加按钮
    $scope.add = function()
    {
        initAddData();
        $("#imghead").attr("src","../../data/200x200.jpg");
        $("#edit_pro_img").val("");
        $("#formId_edit2").ajaxForm(function(data){
            $scope.logo_url = data.split("</pre>")[0].split(">")[1].split("\"")[9];
        });

        KindEditor.ready(function(K) {
            editor = K.create('#content_0', {
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
        editor.html("");
        getAllTags("");
        $scope.matchListDiv = false;
        $scope.matchAddDiv = true;
    }
    //获取所有客户标签接口
    function getAllTags(tags)
    {
        var tagArr = tags.split(",");
        $scope.randomTime = new Date();
        $http.get("/tag/tagList/"+ $.cookie("s4_id")+"/"+ $.cookie("brand_id")+"?t="+$scope.randomTime).success(function(data){

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

    //标题改变
    $scope.titleChange = function()
    {
        if($scope.title.length < 50)
        {
            $scope.titleMove = $scope.title;
        }
        else{
            $scope.titleMove = $scope.title.substring(0,50);
        }
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
    //创建节油大赛
    $scope.AddConfirm = function()
    {
//      获取编辑器里面的内容 alert(editor.html());
        getAllChooseTag();
        $scope.postData={title:$scope.title,brief:editor.html(),tm_announce:$scope.tm_announce,tm_start:$scope.tm_start,
        tm_end:$scope.tm_end,min_milage:$scope.min_milage,logo_url:$scope.logo_url,tags:$scope.tags};
        $http.post(baseurl +"4s/"+$.cookie("s4_id")+"/template/1/activity",$scope.postData).success(function(data){
            if(data.status == "ok")
            {
               alert("添加成功!");
               GetFirstPageInfo();
               $scope.matchListDiv = true;
               $scope.matchAddDiv = false;
            }
        }).error(function(data){
                alert("请求无响应");
        })
        editor.remove();
//        $scope.matchListDiv = true;
//        $scope.matchAddDiv = false;

    }
   //预览
    $scope.preview = function(id,index)
    {
        $scope.fuleMatchDetail = $scope.fuelMatch[index];
        $("#brief").text('');

        $("#brief").append($scope.fuleMatchDetail.brief);
        $scope.matchListDiv = false;
        $scope.matchPreviewDiv = true;
    }
    //发布
    $scope.publish = function(id)
    {
        $scope.matchListDiv = true;
        $scope.matchPreviewDiv = false;
    }
    //管理
    $scope.manager = function(fm_id,index,fm_status)
    {
        $scope.fuleMatchDetail = $scope.fuelMatch[index];
        $scope.checkboxId_1 = false;
       switch(fm_status)
       {
           case 1:
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

               $scope.matchListDiv = false;
               $scope.matchModifyDiv = true;
               getAllTags( $scope.fuleMatchDetail.tags);
               editor.html('');
               editor.insertHtml($scope.fuleMatchDetail.brief);
               break;
           case 2: //已发布
               getSignUpList("",1);
               $scope.matchPublishedDiv = true;
               $scope.matchListDiv = false;
               break;
           case 3://已开始
               getSignUpList("",2);
               getSeries();
               $scope.matchStartedDiv = true;
               $scope.matchListDiv = false;
               break;
           case 4://已结束
               getSignUpList("",3);
               getSeries();
               $scope.matchFinishedDiv = true;
               $scope.matchListDiv = false;
               break;
           case 5://已公布
               getSignUpList("&enough_mileage=true",4);
               getSeries();
               $scope.matchPrizedDiv = true;
               $scope.matchListDiv = false;
               break;
       }
    }

    //获取车系
    function getSeries()
    {
        $scope.randomTime = new Date();
        $http.get(baseurl+'4s/'+ $.cookie("s4_id")+'/activity/'+$scope.fuleMatchDetail.id+'/s_p'+"?t="+$scope.randomTime).success(function(data){
            $scope.s_p = data.s_p;
        });
    }

    //提取公共的用户报名信息
    function getSignUpList(queryString,statusId)
    {
        $scope.tips = "";
        switch(statusId)
        {
            case 1://已发布
                $scope.currentPage_var = $scope.currentPage_1;
                break;
            case 2:
                $scope.currentPage_var = $scope.currentPage_2;
                break;
            case 3:
                $scope.currentPage_var = $scope.currentPage_3;
                break;
            case 4:
                $scope.currentPage_var = $scope.currentPage_4;
                break;

        }
        $scope.randomTime = new Date();
        $http.get(baseurl +"4s/"+$.cookie("s4_id")+"/activity/"+ $scope.fuleMatchDetail.id+"/cust?page="+$scope.currentPage_var+"&pagesize="+$scope.pageRecord+queryString+$scope.queryString+"&t="+$scope.randomTime).success(function(data){
            if(data.status == "ok")
            {
                if(data.members.length == 0)
                {
                    $scope.tips = "暂无数据";
                }
                else{
                    for(var i=0;i<data.members.length;i++)
                    {
                        if(data.members[i].mileage >= $scope.fuleMatchDetail.min_milage)
                        {
                            data.members[i].milageFlag ="是";
                        }
                        else
                        {
                            data.members[i].milageFlag ="否";
                        }
                    }

                }

                $scope.members = data.members;
                PagingInfo(data.totalCount);
            }
           }).error(function(data){
                alert("请求无响应");
            })
        if(queryString !="")
        {
            $("#awardsInfo").text('');
            $("#awardsInfo").append($scope.fuleMatchDetail.awards);
        }
        $scope.queryString = "";
    }

    //修改确认
    $scope.modifyConfirm = function()
    {
        getAllChooseTag();
        $scope.fuleMatchDetail.tags = $scope.tags;
        $scope.fuleMatchDetail.brief = editor.html();
        $http.put(baseurl +"4s/"+$.cookie("s4_id")+"/activity/"+$scope.fuleMatchDetail.id,$scope.fuleMatchDetail).success(function(data){
            if(data.status == "ok")
            {
                alert("修改成功!");
                GetFirstPageInfo();
                editor.remove();
                $scope.matchListDiv = true;
                $scope.matchModifyDiv = false;
            }
        }).error(function(data){
                alert("请求无响应");
            })
    }
    //取消
    $scope.cancelMatch = function(fm_id,index)
    {
        if(confirm("您确定是否要删除该比赛！"))
        {
            $http.delete(baseurl +"4s/"+$.cookie("s4_id")+"/activity/"+fm_id).success(function(data){
                if(data.status == "ok")
                {
                    alert("删除成功！");
                    $scope.fuelMatch.splice(index, 1);
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

    //发布结果按钮
    $scope.publishResult = function(id)
    {
        KindEditor.ready(function(K) {
            editor = K.create('#content_2', {
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

        $scope.matchFinishedDiv = false;
        $scope.matchPubResultDiv = true;
    }
     //发布结果确认
    $scope.publishConfirm = function()
    {
        if(confirm("是否确定要发布?"))
        {
            $scope.postData={"awards":editor.html(),"status":5};
            $http.put(baseurl +"4s/"+$.cookie("s4_id")+"/activity/"+$scope.fuleMatchDetail.id, $scope.postData).success(function(data){
                if(data.status == "ok")
                {
                    alert("发布结果成功!");
                    GetFirstPageInfo();
                }
            }).error(function(data){
                    alert("请求无响应");
                })
            $scope.matchFinishedDiv = false;
            $scope.matchPubResultDiv = false;
            $scope.matchListDiv = true;
        }
    }

    //点击姓名获取客户详情
    $scope.getCustDetail = function(index,id)
    {
        $scope.flagid = id;
        $scope.cusDetail = $scope.members[index];
        getReservationRecord();
        $scope.cusDetailDiv = true;
        $scope.cusTabDiv = true;
        switch(id)
        {
            case 1:
                $scope.matchFinishedDiv = false;
                break;
            case 2:
                $scope.matchPublishedDiv = false;
                break;
            case 3:
                $scope.matchPrizedDiv = false;
                break;
            case 4:
                $scope.matchStartedDiv = false;
                break;
        }
    }

    //
    $scope.detailTab = function(id)
    {
        for(var i=1;i<7;i++)
        {
            $("#tab"+i).hide();

            if(i==id)
            {
                $("#tab"+i).show();
                $("#tab"+id).removeClass();
                $("#tab"+id).addClass("tab-pane active");
            }
        }
        switch(id)
        {
            case 1:
                getReservationRecord();
                break;
            case 2:

                break;
            case 3:
                getCareRecord();
                break;
            case 4:

                break;
            case 5:
                $scope.driveDiv = true;
                $scope.paging1 = true;
                $scope.paging2 = false;
                $scope.oneDetailDiv = false;
                $scope.detailInfoDiv = false;
                $scope.oneMinuteDetailDiv = false;
                getDriveList();
                break;
            case 6:
                getCustomTagList();
                $scope.randomTime = new Date();
                $http.get('/tag/getTagsByCarId/'+$scope.cusDetail.carId+"?t="+$scope.randomTime).success(function(data){
                    $scope.systemTag = data.systemTag;
                    $scope.customTag = data.customTag;
                    for(var i=0;i<$scope.customTags.length;i++)
                    {
                        var flag = false;
                        for(var j=0;j<$scope.customTag.length;j++)
                        {
                            if($scope.customTags[i].tagId = $scope.customTag[j].tagId)
                                flag=true;
                        }
                        if(flag) $scope.customTags[i].tagFlag = true;
                        else  $scope.customTags[i].tagFlag = "";
                    }
                }).error(function(data){
                        alert("请求无响应");
                    })
                break;
        }
    }

    //查询行车数据
    function getDriveList()
    {
        $scope.tips="";
        $scope.queryString="&org_id="+ $.cookie("s4_id")+"&obd_code="+$scope.cusDetail.obd_code;
        $scope.randomTime = new Date();
        $http.get(baseurl+'cmpx/drive_info?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+$scope.queryString+"&t="+$scope.randomTime).success(function(data){
            if(data.status == "ok")
            {
                if(data.drvInfos.length == 0)
                {
                    $scope.tips="暂无数据！";
                }

                $scope.drvInfos = data.drvInfos;
                for(var i=0;i<data.drvInfos.length;i++)
                {
                    $scope.drvInfos[i].carStatus = $.changeCarStatus( $scope.drvInfos[i].carStatus);
                    $scope.drvInfos[i].fireTime = $.changeDate($scope.drvInfos[i].fireTime);
                    $scope.drvInfos[i].flameOutTime = $.changeDate($scope.drvInfos[i].flameOutTime);
                }
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

    //get owner and car info  缺少所属4s店
    function GetOwnerInfo(obd_code)
    {
        $scope.randomTime = new Date();
        $http.get(baseurl + '4s/'+$.cookie("s4_id")+'/car?obd_code='+obd_code+"&t="+$scope.randomTime).success(function(data){
            if(data.status == "ok")
            {
                $scope.carInfo = data.cars[0];
                $http.get(baseurl + '4s/'+$.cookie("s4_id")+'/car/'+$scope.carInfo.id+'/cust?obd_code='+obd_code+"&t="+$scope.randomTime).success(function(data){
                    if(data.status=="ok")
                    {
                        $scope.custInfo = data.custs[0];
                    }else{
                        alert(data.status);
                    }
                }).error(function(data){
                        alert("请求无响应");
                    });
            }
            else{
                alert(data.status);
            }
        }).error(function(data){
                alert("请求无响应");
            });
    }
    //查看一个OBD一次行程的数据
    $scope.GetDriveDetail = function(obd_code,drive_id,id)
    {
        $scope.chooseOC = obd_code;
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
                    alert("暂无行程数据");
                }
                else{
                    for(var i=0;i<data.details.length;i++)
                    {
                        data.details[i].createTime = $.changeDate(data.details[i].createTime);
                    }
                    $scope.driveDiv = false;
                    $scope.detailInfoDiv = true;
                    $scope.oneDetailDiv = true;
                    $scope.paging2 = true;
                    $scope.paging1 = false;
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
        if($scope.details[index].detail == null || $scope.details[index].detail.length == 0)
        {
            alert("暂无详细数据");
        }
        else
        {
            $scope.omdds = $scope.details[index].detail;
            $scope.oneDetailDiv = false;
            $scope.detailInfoDiv = false;
            $scope.paging1 = false;
            $scope.paging2 = false;
            $scope.oneMinuteDetailDiv = true;
        }
    }

    //获取该车主的保养记录
    function getReservationRecord()
    {
        $scope.tips="";
        $scope.randomTime = new Date();
        $http.get(baseurl+'organization/'+$.cookie("s4_id")+'/work/care?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&step=done&car_id="+$scope.cusDetail.carId+"&t="+$scope.randomTime).success(function(data){
            $scope.careList = data.works;
            PagingInfo(data.totalCount);
            if(data.works.length > 0)
            {
                for(var i=0;i< $scope.careList.length;i++)
                {
                    $scope.careList[i].working_time =  $.changeDate($scope.careList[i].working_time);
                    $scope.careList[i].created_time =  $.changeDate($scope.careList[i].created_time);
                    $scope.careList[i].updated_time =  $.changeDate($scope.careList[i].updated_time);
                    $scope.careList[i].step = $.changeWorkStatus($scope.careList[i].step);
                }
            }
            else{
                $scope.tips="暂无数据";
            }

        }).error(function(data){
                alert("请求无响应");
            });
    }
    //获取该车主的关怀记录
    function getCareRecord()
    {
        $scope.tips="";
        $scope.randomTime = new Date();
        $http.get(baseurl+'organization/'+$.cookie("org_id")+'/care_tel_rec?page='+$scope.currentPage+'&pagesize='+$scope.pageRecord+"&car_id="+$scope.cusDetail.carId+"&t="+$scope.randomTime).success(function(data){
            $scope.recordList = data.records;
            PagingInfo(data.totalCount);
            if(data.records.length > 0)
            {
                for(var i=0;i<data.records.length;i++)
                {
                    $scope.recordList[i].log_time = $.changeDate($scope.recordList[i].log_time);
                }
            }
            else{
                $scope.tips = "暂无数据";
            }
        }).error(function(data){
                alert("请求无响应");
            });
    }

    //给车打标签
    $scope.markTags = function(tagId)
    {
        $scope.postData={"carId":$scope.cusDetail.carId,"tags":tagId};
        $http.put('/tag/markTags/',$scope.postData).success(function(data){
            if(data.status =="success")
            {

            }
        }).error(function(data){
                alert("请求无响应");
            })
    }

    //获取自定义标签列表
    function getCustomTagList()
    {
        $scope.tips="";
        $scope.randomTime = new Date();
        $http.get('/tag/tagListCustom/'+ $.cookie("s4_id")+"?t="+$scope.randomTime).success(function(data){
            $scope.customTags = data[0].tags;
            PagingInfo( $scope.customTags.length);
        }).error(function(data){
                alert("请求无响应");
            })
    }

    //取消和返回
    $scope.gotoBack = function(id)
    {
        switch(id)
        {
            case 1://添加-首页
                editor.remove();
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchAddDiv = false;
                break;
            case 2://预览-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchPreviewDiv = false;
                break;
            case 3://修改-首页
                editor.remove();
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchModifyDiv = false;
                break;
            case 4://已发布-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchPublishedDiv = false;
                break;
            case 5://已开始-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchStartedDiv = false;
                break;
            case 6://结束-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchFinishedDiv = false;
                break;
            case 7://公布-首页
                GetFirstPageInfo();
                $scope.matchListDiv = true;
                $scope.matchPrizedDiv = false;
                break;
            case 8://发布结果-结束
                getSignUpList("",3);
                $scope.matchFinishedDiv = true;
                $scope.matchPubResultDiv = false;
                break;
            case 9:
                $scope.driveDiv = true;
                $scope.paging1 = true;
                $scope.paging2 = false;
                $scope.oneDetailDiv = false;
                $scope.detailInfoDiv = false;
                $scope.oneMinuteDetailDiv = false;
                getDriveList();
                break;
            case 10:
                $scope.driveDiv = false;
                $scope.paging1 = false;
                $scope.paging2 = true;
                $scope.oneDetailDiv = true;
                $scope.detailInfoDiv = true;
                $scope.oneMinuteDetailDiv = false;
                $scope.GetDriveDetail($scope.chooseOC,$scope.drive_id,$scope.index);
                break;
        }
    }
    $scope.callBack = function(id,tid)
    {
        $scope.cusDetailDiv = false;
        $scope.cusTabDiv = false;
        switch(id)
        {
            case 1:
                $scope.matchFinishedDiv = true;
                break;
            case 2:
                $scope.matchPublishedDiv = true;
                break;
            case 3:
                $scope.matchPrizedDiv = true;
                break;
            case 4:
                $scope.matchStartedDiv = true;
                break;
        }
    }
    //全选
    $scope.getAllSelect = function(id)
    {

        for(var i=0;i<$scope.tagsGroup.length;i++)
        {
            for(var j=0;j<$scope.tagsGroup[i].tags.length;j++)
            {
                if(!$scope.checkboxId_1)
                {
                    $scope.tagsGroup[i].tags[j].tagFlag = true;
                }
               else{
                    $scope.tagsGroup[i].tags[j].tagFlag = false;
                }
            }
        }
    }
}
