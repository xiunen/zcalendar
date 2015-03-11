(function($){
	//opts
	var Zcalendar = function(elem, opts){
		opts = opts || {};
		opts.context = elem;
		this.setConfig(opts);
		this.renderView();
	};
	Zcalendar.prototype.setConfig = function (opts){
		var defaultConfig = {
			date: (new Date()),
			viewType: "month",
			colors:["#C5D189","#96D189","#89D1B6","#89A9D1","#915EA1","#0039B3","#22458F","#63656B","#789153"],
			data:[]
		};
		this.config = $.extend(false, defaultConfig, this.config, opts);
		if(this.config.context){
			this.config.width = this.config.context.width();
		}
		this.config.cycle = 7;
		this.config.aDayMillis = 86400000;
		this.config.cycleMillis = this.config.cycle * this.config.aDayMillis;
		this.config.unitWidth = (this.config.width - this.config.cycle) / this.config.cycle;
	};
	Zcalendar.prototype.getWeekDates = function(date){
		var dates = [],
			day = date.getDay(),
			y = date.getFullYear(),
			m = date.getMonth(),
			d = date.getDate(), t;
		for(var i = 0 - day; i < this.config.cycle - day; i ++){
			t = new Date(y, m, d + i);
			dates.push(t);
		}
		return dates;
	};
	Zcalendar.prototype.getDates = function (start, end) {
		var dates = [],
			t = start.getTime(),
			endMillis = end.getTime(),
			cycleMillis = this.config.cycleMillis;
		while(t < end){
			dates.push(this.getWeekDates(new Date(t)));
			t += cycleMillis;
		}
		return dates;
	};
	Zcalendar.prototype.getMonthDates = function(date){
		var y = date.getFullYear(),
			m = date.getMonth(),
			d = date.getDate(),
			start = new Date(y,m,1),
			end = new Date(y,m+1,0),
			dates = this.getDates(start, end);
		if(dates.length == 4){
			dates.push(this.getWeekDates(new Date(dates[3][this.config.cycle - 1].getTime() + this.config.aDayMillis)));
			dates.unshift(this.getWeekDates(new Date(dates[0][0].getTime() - this.config.aDayMillis)));
		}else if(dates.length == 5){
			if(dates[0][0].getDate() !== 1){
				dates.push(this.getWeekDates(new Date(dates[4][this.config.cycle - 1].getTime() + this.config.aDayMillis)));
			}else{
				dates.unshift(this.getWeekDates(new Date(dates[0][0].getTime() - this.config.aDayMillis)));
			}
		}
		return dates;
	};
	
	Zcalendar.prototype.renderView = function(){
		var htmls = [], 
			html,
			format = 'M-d',
			dates = this.config.viewType == "month" ? this.getMonthDates(this.config.date) : [this.getWeekDates(this.config.date)];
		for(var i = 0, weekLen = dates.length; i < weekLen ; i ++){
			html = ['<tr>'];
			for(var j = 0, dateLen = dates[i].length; j < dateLen; j ++){
				html.push('<td class="zcalendar-center">'+this.formatDate(dates[i][j], format)+'</td>');
			}
			html.push('</tr>');
			html.push('<tr><td colspan="'+this.config.cycle+'" class="zcalendar-week-'+i+'"></td></tr>');
			htmls.push(html.join(''));
		}
		this.config.context.html('<table class="zcalendar-container">' + htmls.join('') + '</table>');
		this.showingDates = dates;
		this.setData();
	};
	
	Zcalendar.prototype.setData = function(data){
		data = data ? this.formatData(data) : this.formatData(this.config.data);
		if(!(data && data.length))return false;
		var html, _this = this,
			color = "#fff",
			width = (this.config.width - 3),
			_width,
			title = '',
			_dst = data[0].start.getTime(),	
			_det = data[data.length - 1].end.getTime(),
			_ist,
			_iet,
			_st,
			_et,
			_desc,
			format = 'M-d HH:mm',
			tpl = '<div class="zcalendar-data-item" style="background:$bgColor;width:$widthpx;" title="$desc">$title</div>';
		this.showingDates.map(function(item, index){
			html = [];
			_ist = item[0].getTime(),
			_iet = item[_this.config.cycle - 1].getTime() + _this.config.aDayMillis;
			if(_dst > _iet){
				html.push(tpl.replace("$bgColor", color).replace("$width",width).replace("$title",""));
			}else if(_det <  _ist){
				html.push(tpl.replace("$bgColor", color).replace("$width",width).replace("$title",""));
			}else{
			if(_dst >= _ist){
				if(_dst > _ist){
					_width = (_dst - _ist) * _this.config.unitWidth / _this.config.aDayMillis;
					html.push(tpl.replace("$bgColor", color).replace("$width",_width).replace("$title",""));
				}
			}
			data.map(function(_data){
				_st = _data.start.getTime();
				_et = _data.end.getTime();
				if(_st >= _ist && _et <= _iet){
					_desc = [_data.title,
						'从'
						+ _this.formatDate(_data._start, format)
						+ '到'
						+_this.formatDate(_data._end, format),
						_data.description];
					html.push(tpl.replace("$bgColor", _data.color).replace("$width",_data.width).replace("$title",_data.title).replace("$desc",_desc.join('&#13;')));
				}
			});
			if(_iet >= _det){
				if(_iet > _det){
					_width = (_iet - _det) * _this.config.unitWidth / _this.config.aDayMillis;
					html.push(tpl.replace("$bgColor", color).replace("$width",_width).replace("$title",""));
				}
			}
			}
			_this.config.context.find('.zcalendar-week-' + index).html(html.join(''));
		});
	};
	Zcalendar.prototype.splitDates = function (start, end) {
		var dates = [],
			sMillis = start.getTime(),
			eMillis = end.getTime(),
			s = sMillis,
			t = (new Date(start.getFullYear(), start.getMonth(), start.getDate())).getTime()  + (this.config.cycle - start.getDay()) * this.config.aDayMillis;
		dates.push(start);
		while(t < eMillis){
			dates.push(new Date(t));
			t += this.config.cycleMillis;
		}
		dates.push(end);
		return dates;
	};
	Zcalendar.prototype.formatData = function (data) {
		var colors = this.config.colors,
			colorLen = colors.length,
			dateReg = /[^0-9\s:]/g,
			dateReplacer = '/',
			retData = [],
			_this = this,
			cycleMillis = this.config.cycleMillis,
			data = data.map(function (item, index) {
				if(!item.color) {
					item.color = colors[index % colorLen];
				}
				if(item.start.substring){
					item.start = new Date(item.start.replace(dateReg, dateReplacer));
				}else if (!isNaN(item.start)){
					item.start = new Date(item.start);
				}
				if(item.end.substring){
					item.end = new Date(item.end.replace(dateReg, dateReplacer));
				}else if (!isNaN(item.end)){
					item.end = new Date(item.end);
				}
				item._start = item.start;
				item._end = item.end;
				item.title = item.title || "";
				item.description = item.description || "";
				var sDay = item.start.getDay(),
					eDay = item.end.getDay(),
					sMillis = item.start.getTime(),
					eMillis = item.end.getTime(),
					tmpArr;
				//span at least 2 weeks
				if (sDay <= eDay && (eMillis - sMillis) <= cycleMillis) {
					retData.push(item);
				}else{
					tmpArr = _this.splitDates(item.start, item.end);
					tmpArr = tmpArr.map(function(date, i, arr){
						return $.extend(false, item, {
							start: date,
							end: new Date((arr[i+1]||date).getTime())
						});
					});
					tmpArr.pop();
					retData = retData.concat(tmpArr);
				}
				return item;
			});
		return retData.map(function (item) {
			item.width = (item.end.getTime() - item.start.getTime()) * _this.config.unitWidth / _this.config.aDayMillis;
			return item;
		});
	};
	//format date
	Zcalendar.prototype.formatDate = function(date, format){
		format = format || 'yyyy-MM-dd HH:mm:ss';
		var obj = {};
		obj.yyyy = date.getFullYear();
		obj.yy = (date.getYear() + 1900 + '').substring(2);
		obj.M = date.getMonth() + 1;
		obj.MM = obj.M > 9 ? obj.M : ('0' +obj. M);
		obj.d = date.getDate();
		obj.dd = obj.d > 9 ? obj.d : ('0' + obj.d);
		obj.H = date.getHours();
		obj.HH = obj.H > 9 ? obj.H : ('0' + obj.H);
		obj.m = date.getMinutes();
		obj.mm = obj.m > 9 ? obj.m : ('0' + obj.m);
		obj.s = date.getSeconds();
		obj.ss = obj.s > 9 ? obj.s : ('0' + obj.s);
		var order = ['yyyy', 'MM', 'dd', 'HH', 'mm', 'ss', 'yy', 'M', 'd', 'H', 'm', 's'];
		for(var i = 0, len = order.length; i < len; i ++){
			if(order[i] in obj){
				format = format.replace(order[i], obj[order[i]]);
			}
		}
		return format;
	};
	function loadStyle(){
		var style_id = 'zcalendar-style',
			style = $('#' + style_id),
			styles = [], height = 30;
		if(!style.length){
			styles = [
				'table.zcalendar-container{border:1px solid #ccc;border-spacing: 0;border-collapse: collapse;width:100%}',
				'table.zcalendar-container td{border:1px solid #ccc;}',
				'[class^="zcalendar-week-"]{height:'+height+'px;min-height:'+height+'px}',
				'.zcalendar-inline{display:inline-block;}',
				'.zcalendar-center{text-align:center;}',
				'.zcalendar-data-item{height:'+height+'px;line-height:'+height+'px;margin:5px 0 3px 0;display:inline-block;overflow:hidden;color:#fff;word-wrap: break-word;word-break: break-all;border-right:1px solid #ddd;margin-right:-1px;}',
				'.zcalendar-data-item:last-child{border-right:none;}'
			];
			style = $('<style/>');
			style.attr('id', style_id);
			style.html(styles.join("\n"));
			style.appendTo($('head'));
		}
	}
	$.fn.extend({
		zcalendar: function(opts){
			loadStyle();
			return this.each(function(){
				var elem = $(this);
				elem.data('zcalendar', new Zcalendar(elem, opts));
			});
		}
	});
})($);