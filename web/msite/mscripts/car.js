// 发送给好友;
function weixinShareFriend(title,desc,link,imgUrl){
    WeixinJSBridge.on('menu:share:appmessage', function(argv){
        WeixinJSBridge.invoke('sendAppMessage',{
            //"appid":appId,
            "img_url":imgUrl,
            //"img_width":"640",
            //"img_height":"640",
            "link":link,
            "desc":desc,
            "title":title
        }, function(res) {})
    });
}

//分享到朋友圈
function weixinShareTimeline(title,desc,link,imgUrl){
    WeixinJSBridge.on('menu:share:timeline', function(argv){
        WeixinJSBridge.invoke('shareTimeline',{
            "img_url":imgUrl,
            //"img_width":"640",
            //"img_height":"640",
            "link":link,
            "desc": desc,
            "title":title
        }, function(res) {
            alert("分享成功");
        });
    });
}
//分享到腾讯微博
function weixinShareWeibo(title,link){
    var weiboContent = '';
    WeixinJSBridge.on('menu:share:weibo', function(argv){
        WeixinJSBridge.invoke('shareWeibo',{
            "content":title + link,
            "url":link
        }, function(res) {
            alert("分享成功");
        });
    });
}
//获取传入的参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
//读取本地文件url.xml中记录的webservice地址
   var xmlDoc = null, xmlhttp = null; var webserviceurl;
  function loadXML() {
    xmlhttp = window.XMLHttpRequest ? new window.XMLHttpRequest():new ActiveXObject("Microsoft.XMLHttp");
    if (xmlhttp == null) {
      alert("你的浏览器不支持 XMLHttpRequest");
      return;
    }
    xmlhttp.open("GET", "url.xml?" + Date.parse(new Date()), true);
    xmlhttp.setRequestHeader("Content-Type", "text/xml");
    xmlhttp.onreadystatechange = getmessage;
    xmlhttp.send(null);
  }
 function getmessage() {
	 if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      xmlDoc = xmlhttp.responseXML.documentElement;
      if (xmlDoc == null) {
        alert("返回的数据不正确。");
        return;
      }
    var nodes = xmlDoc.getElementsByTagName("hostname")
      //alert(nodes[0].textContent);
	  webserviceurl=nodes[0].textContent;
	 }
  }   
  //初始化汽车品牌及车系选项
 function initPro() {
 var option1 = '';

 $.getJSON("/msite/brandData",function(jsonData) {
  $.each(jsonData, function(index, indexItems) {
   option1 += "<option id=" + indexItems.id + ">"
     + indexItems.brand + "</option>";
  });
  $("#brand").append(option1);
  $("#brand").bind("change", function() {
   selectSeries(jsonData);
  })
 });
 function selectSeries(data) {
  var option2 = '';
  var selectedIndex = $("#brand :selected").text();
  $("#selectSeries").empty();
  if($("#brand :selected").val() == -1){
   $("#selectSeries").append("<option id=\"-1\">请选择</option>");
  }
  $.each(data, function(index, indexItems) {
   //var brandName = indexItems.name;
   $.each(indexItems.items, function(index, indexItems) {
    if (indexItems.parentNode != selectedIndex) {
     return;
    } else {
     option2 += "<option id=" + indexItems.id + ">"
       + indexItems.series + "</option>";
    }
   })
  });
  $("#selectSeries").append(option2);
 }
}

