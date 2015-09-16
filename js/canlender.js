function PopCalendar(option){
	var opt = option;
	this.container = typeof(opt.container) === "string" ? $("#"+opt.container) : opt.container;
	this.curcontent = this.container.find(".digital");
	this.elemData =null;
	var myDate = new Date();
	var myDate2 = new Date();
	this.today = [myDate2.getFullYear(),myDate2.getMonth()+1,myDate2.getDate()];
	this.curDate = opt.curDate ||[myDate.getFullYear(),myDate.getMonth()+1,myDate.getDate()];	/*日期年月日*/
	this.dataUrl=opt.dataUrl;
	this.forbiddenDate=[];
	this.errorDate=[];			//重复的日期
	this.callbackData=opt.dataUrl;	//返回的所有的排课数据
	this.nextMonth= new Date(this.curDate[0], this.curDate[1]+2, 0).getMonth();
	this.nextMonth=(this.nextMonth==0)?12:this.nextMonth;		//下一个月的月份
	this.nextYear=(this.nextMonth==1)?(this.curDate[0]+1):this.curDate[0];		//下一个月的年份
	this.func=opt.func ||function(){};
	this.init();
}
PopCalendar.prototype = {
	init : function(){
		var that = this;
		this.container.bind("click", function(e){
			var target = $(e.target);
			if(target.hasClass("prev-btn")){
				that.curDate[1] = that.curDate[1] - 1;
				that.nextYear=that.curDate[0];
				that.nextMonth=that.curDate[1]+1;
				if(that.curDate[1] < 1){
					that.curDate[1] = 12;						/*月份*/
					that.curDate[0] = that.curDate[0] - 1;		/*日期*/
					that.nextYear=that.curDate[0]+1;
					that.nextMonth=1;
				}
				that.twoMonthShow();
				return false;
			}

			if(target.hasClass("next-btn")){
				that.curDate[1] = that.curDate[1] + 1;
				if(that.curDate[1] == 12){
					that.nextMonth=1;
					that.nextYear=that.curDate[0] + 1;
				}
				else if(that.curDate[1] > 12){
					that.curDate[1] = 1;
					that.curDate[0] = that.curDate[0] + 1;
					that.nextYear=that.curDate[0];
					that.nextMonth=that.curDate[1]+1;
				}
				else{
					that.nextYear=that.curDate[0];
					that.nextMonth=that.curDate[1]+1;
				}
				that.twoMonthShow();
				return false;
			}
		});
		this.twoMonthShow();
	},
	/*初始化时，获得当前年月日*/
	creatDataInit:function(){
		this.container.find(".head .year").text(this.curDate[0] + "年");
		this.container.find(".cur-month").text(this.curDate[1] + "月");
		this.container.find(".next-month").text( this.nextMonth+ "月");
	},
	/*创建两个月的排课信息*/
	twoMonthShow:function(){
		this.creatDataInit();
		this.createMonth(this.curDate[0],this.curDate[1],this.curcontent);
		this.elemData =this.container.find('.digital');
		this.elemClick(this.func);
		this.setForbiddenDate(this.forbiddenDate);
		this.showErrorData();
	},
	/*创建单月的日历表*/
	createMonth :function(year,month ,wrap){
		var curMonthdata=this.curMonthData(this.callbackData,year,month);
		var classVal = "",curVal, count, activeParam,state;
		var tmpStr = "";
		var obj,obj1;
		var curD = new Date(this.curDate[0], this.curDate[1]-1, 1).getDay(),  /*当前月1号星期几 0到6*/
		totalD = new Date(this.curDate[0], this.curDate[1], 0).getDate(),	/*一个月中的某一天 (1 ~ 31) ，返回当前月的最后一天*/
		preTotalD = new Date(this.curDate[0], this.curDate[1]-1, 0).getDate(),/*上一个月的天数*/

		obj=this.connectTwoMonth(year,month ,curD,totalD,preTotalD,0,0);

		nextD=new Date(this.nextYear, this.nextMonth-1, 1).getDay(),  /*下一个月1号星期几 0到6*/
		nextTotalD = new Date(this.nextYear, this.nextMonth, 0).getDate(),	/*下一个月中的某一天 (1 ~ 31) ，返回当前月的最后一天*/
		nextPreTotalD = new Date(this.nextYear, this.nextMonth-1, 0).getDate();/*上一个月的天数*/
		obj1=this.connectTwoMonth(this.nextYear,this.nextMonth ,nextD,nextTotalD,nextPreTotalD,1,obj.dayNum);
		tmpStr=obj.tmpStr+obj1.tmpStr;
		wrap.html(tmpStr);
	},
	connectTwoMonth:function(year,month ,curD,totalD,preTotalD,up,dayNum){
		var that=this;
		var tmpStr="";
		var dayNum=dayNum;
		var dataList=this.curMonthData(this.callbackData,year,month);
		curD=(curD==0)?7:curD;
		if(up==0){
			if(curD==1){
				for(var i=7; i>0; i--){
					tmpStr += '<a href="javascript:;" >'+(preTotalD+1-i)+'</a>';
					dayNum=7;
				}
			}
			else{
				for(var i=curD; i>1; i--){
					tmpStr += '<a href="javascript:;" class="disabled">'+(preTotalD+2-i)+'</a>';
					dayNum=curD-1;
				}
			}
		}
		for(var i=0; i<totalD; i++){
			classVal ="";
			if((that.today[0] >year) || (that.today[0] ==year && that.today[1] >month ) || (that.today[0] ==year && that.today[1] ==month && (i+1)<that.today[2] )){
				classVal+=" past";
			}
			curVal = i+1;
			activeParam = "";
			state=1;
			count = "";
			for(var d in dataList){
				if(dataList[d] == (i+1)){
					classVal += " active";
					state=year+'-'+month+'-'+dataList[d];
					activeParam = 'data-state="' + state + '"';
					break;
				}
			}
			tmpStr += '<a class="' + classVal + '"' + activeParam + 'href="javascript:;" data-date="'+year+'-'+month+'-'+curVal+'">'+ curVal+ '</a>';
		}
		dayNum+=totalD;
		if(up==1){
			var restday=70-dayNum;
			for(var i=0; i<restday; i++){
				tmpStr += '<a href="javascript:;" class="disabled">'+(i+1)+'</a>';
			}
			dayNum=70;
		}
		return {tmpStr,dayNum};
	},
	/*获取当月所有排课的日期*/
	curMonthData: function(arr,year,month){
		var k=$.grep(arr,function(elem, index) {
			var checkData = new RegExp(year+"-"+month+"-");
			var data=elem.match(checkData);
			return data;
		});
		var m=$.map(k, function(n){
		  return n.split('-')[2];
		});
		return m;
	},
	/*点击某个日期，将日期存到数组数组中*/
	elemClick:function(func){
		var that=this;
		this.elemData.children('a').on('click',function(event) {
			var elem =$(this);
			if(elem.hasClass('disabled') || elem.hasClass('past') ||elem.hasClass('foribid')){
			 	return false;
			}
			else if(elem.hasClass('error') ){
				elem.addClass('on');
			 	return false;
			}
			else{
			 	if(elem.attr('data-state')!=undefined){
			 		var dataAttr=elem.attr('data-state');
			 		elem.removeAttr('data-state').removeClass('active');
					var dataIndex=$.inArray(dataAttr, that.callbackData);
			 		if(dataIndex!=-1){
			 			that.callbackData.splice(dataIndex, 1);
			 		}
			 	}
			 	else{
			 		var dataAttr=elem.attr('data-date');
			 		elem.attr('data-state',dataAttr).addClass('active');
			 		var dataIndex=$.inArray(dataAttr, that.callbackData);
			 		if(dataIndex==-1){
				 		that.callbackData.push(dataAttr);
				 	}
			 	}
			 	that.func();
			}
		});
		this.elemData.on('mouseover','a',function(event) {
			var elem=$(this);
			var dataState=elem.attr('data-state');
			if(dataState!=undefined){
				elem.attr("title","取消排课");
			}
			else{
				elem.attr("title","选中排课");
			}
		});
		this.elemData.on('mouseleave','a',function(event) {
			var elem=$(this);
			elem.removeAttr('title');
		});
	},
	/*返回排课后的数据*/
	paikeData :function(){
		return this.callbackData;
	},
	/*清除所有排课*/
	clearPaike:function(){
		this.callbackData=[];
		this.twoMonthShow();
	},
	/*设置当前显示的接连两个月中的某些日期不可点*/
	setForbiddenDate:function(arr){
		this.forbiddenDate=arr;
		this.foribidDate(this.curDate[0],this.curDate[1],$(".digital"));
	},
	/*设置某个月中的日子不可选*/
	foribidDate:function(year,month,dom){
		var that=this;
		dom.children('a').each(function(index, el) {
			var elem=$(this);
			var dataIndex=that.forbiddenDate.indexOf(elem.attr("data-date"));
			if(dataIndex>-1){
				if(elem.attr('data-state')!=undefined){
					var i=$.inArray(elem.attr('data-state'), that.callbackData);
					if(i>-1){
						that.callbackData.splice(i, 1);
					}
					elem.removeAttr('data-state').removeClass('active');
				}
				elem.addClass('foribid');
			}
		});
	},

	/*设置某个月的中日子恢复可点击状态*/
	cancelForibidDate:function(arr){
		for(var i=0;i<arr.length;i++){
			var dataIndex=$.inArray(arr[i], this.forbiddenDate);
			if(dataIndex!=-1){
	 			this.forbiddenDate.splice(dataIndex, 1);
	 		}
		}
		var that=this;
		$('.foribid').each(function(index, el) {
			var elem=$(this);
			var monthData=elem.attr("data-date");
			var dataIndex=$.inArray(monthData,arr);
			if(dataIndex!=-1){
	 			elem.removeClass('foribid');
	 		}
		});
	},
	errorDataShow:function(arr){
		this.errorDate=arr;
		for(var i=0;i<this.errorDate.length;i++){
			var dataIndex=$.inArray(arr[i], this.callbackData);
			if(dataIndex!=-1){
	 			this.callbackData.splice(dataIndex, 1);
	 		}
		}
		this.showErrorData();
	},
	showErrorData:function(){
		var that=this;
		this.elemData.children('a').each(function(index, el) {
			var elem=$(this);
			var monthData=elem.attr("data-date");
			var dataIndex=$.inArray(monthData,that.errorDate);
			if(dataIndex!=-1){
	 			elem.removeClass('active').addClass('error').removeAttr('data-state');
	 		}
		});
	}
}