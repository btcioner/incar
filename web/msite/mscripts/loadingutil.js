var LoadingUtils = {
		Open:function(){
			var top=  $(this).offset()==undefined?0:$(this).offset().top;
			var left=  $(this).offset()==undefined?0:$(this).offset().left;
			
			var appender=null;
			if($(this).parent().length==0)
			{
				appender="body";
			}else
			{
				appender=$(this);
			}
			$("<div class=\"mask\"></div>").css({
				display : "block",
				width : $(this).outerWidth(),//100%
				height : $(this).outerHeight(),//height
				top:top,
				left:left
			}).appendTo(appender);//body
			$("<div class=\"mask-msg\" style=\"font-size:60px\"></div>").html("<img src='../mimages/loading.gif'><br>正在处理，请稍候...")
					.appendTo(appender).css({
						display : "block",
						left : ($(this).outerWidth()-153) / 2+left,
						top :  ($(this).outerHeight()-42) / 2+top,
					});
		},
		Close:function(){
			$(".mask").remove();
			$(".mask-msg").remove();
		}
}