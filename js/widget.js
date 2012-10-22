/**
 * @widget for alipay.com for high-end smartphone
 * @author alipay wireless UED F2Es
 * @time 04-05-2011
 * @version 1.0
 */

/**
 * delete global variable $ and jQuery
 * use AI
 */
window.AI = $ = jQuery;
//delete window.$;
//delete window.jQuery;

//AI.Widget入口
AI.Widget = {};

/**
 * 为AI扩展iOS和Android事件
 */
AI.ievents = 'touchstart touchend touchmove touchcancel '+ 
             'gesturestart gestureend gesturechange '+ 
			 'orientationchange '+ 
			 'webkitTransitionStart webkitTransitionEnd webkitAnimationStart webkitAnimationEnd '+ 
			 'storage ';
			 
AI.each(AI.ievents.split(' '),function (i,eventName){
	AI.fn[eventName] = function (data,fn){
	    //当设备旋转时，自动将orientationchange事件与resize事件同步
		if(eventName === 'orientationchange'){
			AI(window).resize(data,fn);
		}
		
		if(fn == null){
			fn = data;
			data = null;
		}
		
		return arguments.length > 0 ? this.bind(eventName,data,fn) : this.trigger(eventName);
	};
	
	if(AI.attrFn){
		AI.attrFn[eventName] = true;
	}
});

AI.extend(AI,{
	/**
	 * 验证传递的对方是否是字符串类型
	 * @return 若是字符串类型返回 true，否则返回false
	 */
	isString: function (obj){
		return AI.type(obj) === 'string';
	}
});

AI.extend(AI.fn,{
	/**
	 * 补足jQuery 1.5删除掉的replaceClass方法
	 * @param {String} o 被替换的className
	 * @param {String} n 替换的className
	 * @return AI
	 */
	replaceClass: function (o,n){
		if(o && n){
			var elem = null;
			
			for(var i=0,l=this.length;i<l;i++){
				elem = this[i];
				
				if(AI(elem).hasClass(o)){
					AI(elem).removeClass(o);
					AI(elem).addClass(n);
				}
			}
		}
		
		return this;
	},
	clearPlaceHolder: function (){
		var self = this;

        for (var i = 0, l = self.length; i < l; i++) {
            var elem = self[i];

            if (elem.type === 'text' || elem.type === 'password' || elem.type === 'tel' || elem.type === 'phone' || elem.type === 'url') {
                (
				  function (){
				  	var target = AI(elem);
                    var oldHolder = target.attr('placeholder');
					
				  	target.focus(function(){
	                    if (!AI(this).val() || AI(this).val() === oldHolder) {
	                        AI(this).attr({
	                            placeholder: ''
	                        });
							AI(this).val('');
	                    }
	                });
	                
	                target.blur(function(){
	                    AI(this).attr({
	                        placeholder: oldHolder
	                    });
	                });
				  }
				)();
            }
        }
	}
});

/**
 * 仅适用移动设备的ua检测
 */
AI.UARegs = {
	 webkit: /(AppleWebKit)[ \/]([\w.]+)/,
	 ipad: /(ipad).+\sos\s([\d+\_]+)/i,
	 windows: /(windows\d*)\snt\s([\d+\.]+)/i,
	 iphone: /(iphone)\sos\s([\d+\_]+)/i,
	 ipod: /(ipod).+\sos\s([\d+\_]+)/i,
	 android: /(android)\s([\d+\.]+)/i,
	 macos: /(mac)\sos\s?x\s([\d+\_]+)/i
};

AI.UA = function (){
    var ua = navigator.userAgent, 
	    UARegs = AI.UARegs,
	    match = UARegs.webkit.exec(ua), 
		browser = UARegs.webkit.exec(ua), 
		result = {}, 
		r;
    
    r = (UARegs.ipod.exec(ua) || UARegs.ipad.exec(ua) || UARegs.iphone.exec(ua) || UARegs.android.exec(ua) || UARegs.macos.exec(ua) || UARegs.windows.exec(ua) || '');
    
    
    if (!r || ua === 'anclient') {
        //对于某些刷机的版本做最大化兼容
        r = ua.match(/android[^;\.0-9]*((\d+\.?)*)/i);
        r = r && r[1] ? ['', 'android', r[1]] : ['', 'android', '1.5'];
    }
    
    result['system'] = r[1].toLowerCase();
    result['version'] = r[2].replace(/(\_|\.)/ig, '.').toLowerCase();
    result['browser'] = browser ? browser[1].toLowerCase() : 'apple/webkit';

    //减少对AI.UA的访问
    AI.UA = result;
};
AI.UA();

//保留jQuery原有的ajax方法
AI.jqueryAjax = AI.ajax;

/**为使ajax方法更方便应用到我们的业务中
 * 我们再次对ajax方法做封装
 * 每次使用需要new AI.ajax
 * @param {String} url
 * @param {Object} options
 * @example new AI.ajax("m.alipay.com",{
 *   data:
 *   method:
 *   context:
 *   on: {
 *     start:
 *     success:,
 *     failure:
 *     complete
 *   }
 * });
 */
AI.ajax = function (url,options){
	this.url = url;
	this.options = options;
};
AI.ajax.prototype = {
	start: function(){
		var fns = this.options.on || {};
		
		if(fns.start){
			if(this.options.context){
				fns.start.call(this.options.context,this.options.arguments || this);
			}else{
				fns.start(this.options.arguments || window);
			}
		}
	},
	send: function (){
		var self = this,
		    fns = this.options.on || {};;
		
		self.options.success = fns.success || function(){};
		self.options.failure = fns.failure || function(){};
		self.options.complete = fns.complete || function(){};
		self.options.stop = fns.stop || function(){};
		self.options.end = fns.end || function(){};
		self.options.error = fns.error || function (){
			//alert('请求超时或网络异常');
			//document.location.reload();
		};
		
		self.options.timeout = 60000;//self.options.timeout || 8000;
		
		self.options.statusCode = [{
			404: function (){
				alert('页面未找到，请重试或联系支付宝客服');
			}
		}];
		
		self.start();
		self.io = AI.jqueryAjax(self.url,self.options);
		
		return self;
	},
	getIO: function (){
		return this.io;
	}
};

/**
 * 一些简单的oop方法
 * extension: 派生子类。（因为base中有extend方法名，所以在此我们用extension）
 * clone: 克隆一个类
 * augment: 类扩充
 */
AI.oop = {
	/**
	 * 派生子类
	 * @param {Class} sub 子类
	 * @param {Class} sup 父类
	 * @param {Object} subMethod 可选参数,赋给子类的若干个方法。如果子类中已经有此方法则跳过。
	 */
	    extension : function (sub,sup/*,subMethod*/){
			var F = function (){},
			    methods = arguments[2];
			
			F.prototype = sup.prototype;
			sub.prototype = new F();
			sub.prototype.constructor = sub;
			sub.superClass = sup.prototype;
			
			if(sup.prototype.constructor == Object.prototype.constructor){
				sup.prototype.constructor = sup;
			}
			
			//为子类添加给定的方法
			if(methods && AI.isPlainObject(methods) && !AI.isEmptyObject(methods)){
				for(var i in methods){
					if(!sub.prototype[i] && AI.isFunction(methods[i])){
						sub.prototype[i] = methods[i];
					}
				}
			}
		},
		/**
		 * 克隆一个类
		 * @param {Object} obj 
		 * @return 实例化后的对象
		 */
	    clone : function (obj){
			if(obj instanceof Function || obj instanceof String){
				throw('argument must be literal object!');
			}
			
			function F(){}
			
			F.prototype = obj;
			
			return new F();
		},
		/**
		 * 类扩充
		 * @param {Class} reveivingClass 接受扩充的类
		 * @param {Class} givingClass 给扩充方法的类
		 * @param {Boolean} rewrite 可选参数，是否覆盖接受扩充类中同名的方法，默认完全覆盖
		 * @param {Array} whiteList 可选参数，白名单，如果提供了白名单，则仅仅扩充白名单中的方法，当指定白名单时必须要指定rewrite的值。
		 */
		augment : function (reveivingClass,givingClass/*,rewrite,whiteList*/){
			var parLen = arguments.length,
			    whiteList,
				rewrite = arguments[2],
				reveivingClassMethod,
				givingClassMethod;
				
			if(rewrite === undefined){
				rewrite = true;
			}
				
			whiteList = parLen === 4 ? arguments[parLen - 1] : false;
			
			//如果提供了白名单，那么仅扩充白名单中的方法
			if(whiteList && AI.isArray(whiteList)){
				for(var i=0,l = whiteList.length;i<l;i++){
					reveivingClassMethod = reveivingClass.prototype[whiteList[i]];
					givingClassMethod = givingClass.prototype[whiteList[i]];
					
					if(rewrite){
						reveivingClass.prototype[whiteList[i]] = givingClass.prototype[whiteList[i]];
					}else{
						if(!reveivingClassMethod){
							reveivingClass.prototype[whiteList[i]] = givingClass.prototype[whiteList[i]];
						}
					}
				}
			}else{
				for(var method in givingClass.prototype){
					if(reveivingClass.prototype[method] && !rewrite){
						continue;
					}
					
					if(givingClass.prototype[method]){
						reveivingClass.prototype[method] = givingClass.prototype[method];
					}
				}
			}
		},
		/**
		 * 修改执行上下文
		 * @param {Function} fn 执行的函数
		 * @param {Object} context 执行上下文
		 * @param {Array} args 可选。参数散列表，传递到fn
		 */
		bind: function (fn,context,args){
		  if(!context || arguments.length < 2 || AI.isArray(arguments[1])){
		    return ;
		  }

		  return fn.apply(context,args && args.length > 0 ? args : []);
		}
};

/***************************Animation组件，它必须依赖于css中的动画组件样式表keyFrames方能正常工作**********************************/
AI.Widget.WebkitAnimation = {};
AI.Widget.WebkitAnimation.fixURLAreaHeight = 0;

/**
 * 左右滑动器
 * 其中的start，end函数需要指定
 * 因为我们可以需要卸载一些事件
 * @param {Object} config
 * @example {
 *   target: {Objet} AI DOM Object,
 *   start: {Function} 动画执行前的需要调用的函数,
 *   end: {Function} 动画执行完毕的回调函数
 * }
 */
AI.Widget.WebkitAnimation.Slide = function (config){
	this.config = config || {};
	this.init();
};
AI.Widget.WebkitAnimation.Slide.prototype = {
	//默认卡片的ID
	uid: 'webkitAnimation-Slide',
	init: function (){
		var self = this,
		    config = self.config;
		
		self.target = config.target || function (){};
		self.callbackStart = config.start || function (){};
		self.callbackEnd = config.end || function (){};
		
		self.asignID();
		
		self.currentCard = {
		  card: self.target.find('.current'),
		  id: self.target.find('.current').attr('data-cardNo')
		};
	},
	asignID: function (){
		var self = this,
		    cards = self.target.find('*[data-role=card]');
		
		AI.each(cards,function (k,v){
			if(!v.getAttribute('data-cardNo')){
			  v.setAttribute('data-cardNo',self.uid+'-'+k);	
			}
		});
		
		self.cardsCount = cards.length;
	},
	go: function (i){
		var self = this,
		    currentCardID = self.currentCard.id;

		if(currentCardID === self.target.find('.current').attr('data-cardNo') && new RegExp(self.cardsCount-1+'$',"i").test(currentCardID) || (i && i === currentCardID)){
			return;
		}
		
		//为解决webkitAnimationEvent提前执行问题，我们需要在执行动画前绑定事件，而不是在初始化时绑定事件
		if(!self.bind){
			self.target.webkitAnimationStart(AI.proxy(self.start,self));
		    self.target.webkitAnimationEnd(AI.proxy(self.end,self));
			self.bind = true;
		}
		
		self.target.addClass('out');
		
		if((i || i === 0) && i >= 0 && i <= self.target.find('*[data-role=card]').length-1){
			return self.show(i);
		}
			
		self.showNext();
	},
	nextCard: function (){
		var self = this,
		    newID;
		
		newID = self.currentCard.id.replace(/(\d+)$/i,function ($1){
			if($1 < self.cardsCount){
				return ++$1;
			}else{
				return $1;
			}
		});
		
		var card = self.target.find('*[data-cardNo='+newID+']');
		
		self.currentCard = {card:card,id:newID};
	},
	prevCard: function (){
		var self = this,
		    newID;

		newID = self.currentCard.id.replace(/(\d+)$/i,function ($1){
			if($1 <= self.cardsCount && $1 > 0){
				return --$1;
			}else{
				return $1;
			}
		});
		
		var card = self.target.find('*[data-cardNo='+newID+']');
		
		self.currentCard = {card:card,id:newID};
	},
	showNext: function (){
		this.show('next');
	},
	show: function (which){
		switch (which){
		  case 'next':
		    this.nextCard();
		  break;
		  case 'prev':
		    this.prevCard();
		  break;
		  default:
		    var id = which,
				card,
				newID;
			
			newID = this.uid+"-"+id;
			card = this.target.find('*[data-cardNo='+newID+']');

		    this.currentCard = {card:card,id:newID};
		  break;	
		}
		
		//修改当前卡片的值，并且将其显示
		this.currentCard.card.css('display','block');
	},
	back: function (i){
		var self = this,
		    currentCardID = self.currentCard.id;

		if(currentCardID === self.target.find('.current').attr('data-cardNo') && new RegExp(self.cardsCount-self.cardsCount+'$',"i").test(currentCardID) || (i && i === currentCardID)){
			return;
		}
		
		if(!self.bind){
			self.target.webkitAnimationStart(AI.proxy(self.start,self));
		    self.target.webkitAnimationEnd(AI.proxy(self.end,self));
			self.bind = true;
		}
		
		self.target.addClass('in');
		
		if((i || i === 0) && i >= 0 && i <= self.target.find('*[data-role=card]').length-1){
			return self.show(i);
		}
		
		self.show('prev');
	},
	adjust: function (){},
	end: function (){
		var self = this,
		    card;
		
		self.callbackEnd.call(self.callbackEnd,self.currentCard);
		card = self.target.find('.current[data-cardNo!='+self.currentCard.id+']');
		card.removeClass('current');
		self.currentCard.card.addClass('current').removeAttr('style');
		
		self.target.removeClass('out').removeClass('in');
		
		//销毁事件，允许用户再次绑定
		self.target.unbind();
		self.bind = false;
		self.bindStart = false;
		
		/**
		 * 为解决display:-webkit-box不实时更新UI问题
		 * 我们需要强迫浏览器更新容器UI
		 * 我们需要修改容器的display属性值
		 */
		self.target.css('display','block');
		setTimeout(function (){
			self.target.css('display','-webkit-box');
		},1);
	},
	start: function (){
		var self = this;
		
		if(self.bindStart){
			return ;
		}
		
		self.bindStart = true;
		self.callbackStart();
	}
};

/******************************************dialog 对话框****************************************/
/**
 * 对话框组件
 * @param {Object} options
 * @example {
 *   content: {String} 对话框中的内容。请注意，在此不包括对话框中的触发器
 *   effect: {String} 可选参数。动画的效果，默认为scale缩放模式
 *   caption: {String} 可选参数。对话框中的标题
 *   startFn: {Function} 可选参数。执行对话框显示前的回调函数
 *   endFn: {Function} 可选参数。执行对话框关闭后的回调函数
 *   boxW: {Int} 可选参数。对话框的宽度
 *   boxH: {Int} 可选参数。对话框的高度
 *   submitCallback: {Function} 可选参数。对话框中的submit的回调函数
 * }
 */
AI.Widget.Dialog = function (options){
	this.options = options || {};
	this.content = this.options.content || '';
	this.effect = this.options.effect || 'scale';
	this.caption = this.options.caption || '对话框';
	this.startFn = this.options.start || function (){};
	this.endFn = this.options.end || function (){};
	this.boxW = this.options.boxW || '300';
	this.boxH = this.options.boxH || 'auto';
	this.submitCallback = this.options.submitCallback || function (){};
	
	this.initializer();
};
AI.Widget.Dialog.prototype = {
	initializer: function (){
		var self = this;
		
		//如果文档中已经有了一个dialog，我们就不需要向页面插入新的dialog代码了
		if(!AI('#J-dialog-box').get(0)){
			AI('body').append('<div id="J-dialog-box" class="hide"><div id="J-dialog-contentBox" style="position:relative;"><div class="mask"></div></div></div>');
		}
		
		self.dialog = AI('#J-dialog-box');
		self.dialogContentBox = AI('#J-dialog-contentBox');
		
		self.dialog.css({
			position: 'absolute',
			left: 0,
			top: 0,
			zIndex: 1000
		});
		
		var content = '<section class="box-skin box-dialog" style="z-index:1000;position:absolute;top:0;left:0;">'+
					    '<section class="box pd-lr10-bt8">'+
					      '<h1 class="dialog-hd">'+ self.caption +'</h1>'+
					      '<section class="dialog-bd">'+
					        self.content +
					      '</section>'+
					      '<div class="dialog-trigger">'+
					        '<div class="flex">'+
					          '<input type="submit" value="确定" class="btn btn-ok" id="J-dialog-box-OK">'+
					        '</div>';
							typeof self.options.cancelButton=='undefined'?self.options.cancelButton==true:null;
							if(self.options.cancelButton){
					        content+='<div class="flex">'+
					          '<button class="btn btn-cancel" id="J-dialog-box-CANCEL">取消</button>'+
					        '</div>';
							}
					      content+='</div>'+
					    '</section>'+
					  '</section>';
		
		AI('#J-dialog-contentBox').append(content);

		self.dialog.find('.box-dialog').css({
			width: self.boxW,
			height: self.boxH
		});
		
		self.dialog.find('.box').css({
			height: self.boxH - 16
		});
	},
	show: function (){
		var self = this,
		    winW = document.documentElement.clientWidth,
			winH = document.documentElement.clientHeight;
		
		//注册事件，执行回调函数。这行代码只用于非Android平台
		if (AI.UA.system !== 'android') {
			self.dialog.css('opacity',0);
			self.dialog.webkitAnimationStart(AI.proxy(self.start,self));
			self.dialog.webkitAnimationEnd(AI.proxy(self.end,self));
		}
		
		//注册事件，执行回调函数。这行代码只用于Android平台
		if (AI.UA.system === 'android' && self.startFn) {
			self.start();
		}	
		
		//更新dialog的位置
		self.dialog.addClass('popIn');
		self.refreshPos();
		
		//显示dialog
		self.dialog.removeClass('hide');
		
		//注册事件，执行回调函数。这行代码只用于Android平台
		if (AI.UA.system === 'android' && self.startFn) {
			self.end();
		}
		
		//绑定事件到submit和cancel
		self.bindUI();
	},
	refreshPos: function (){
		var self = this,
		    winW = document.documentElement.clientWidth,
			winH = document.documentElement.clientHeight,
			boxDialog = self.dialog.find('.box-dialog');

		if(AI.UA.system !== 'android'){
			//清除隐藏dialog元素时遗留的样式名
			if(self.dialog.hasClass('popOut')){
				self.dialog.removeClass('popOut')
			}
			
			self.dialog.css({
				width: winW,
				height: winH
			});
		}
		
		if(AI(document).height() > winH){
			winH = AI(document).height();
		}
		
        self.dialog.find('.mask').css({
            width: winW,
            height: winH
        });
		boxDialog.css({
            left: (winW - self.boxW)/2-10,
            top: (document.documentElement.clientHeight - boxDialog.height())/2 + window.scrollY
        });
	},
	hide: function (e){
		if(e){e.preventDefault();}
		
		var self = this;
		
		if(AI.UA.system !== 'android'){
			self.dialog.addClass('popOut');
			self.dialog.webkitAnimationEnd(AI.proxy(self.hideCallback,self));
		}else{
			self.dialog.addClass('hide');
		}

		self.end();
	},
	hideCallback: function (){
		var self = this;
		
		self.dialog.addClass('hide');
		
		self.dialog.unbind();
	},
	start: function (){
		this.dialog.css('opacity',1);
		
		if(this.startFn){
			this.startFn();
		}
	},
	end: function (){
		var self = this;
		
		if(self.endFn){
			self.endFn();
		}
		
		var boxDialog = self.dialog.find('.box-dialog');
		
		boxDialog.css('top',
		  (document.documentElement.clientHeight - boxDialog.height())/2 + window.scrollY
		);

		//动画结束后，清除dialog元素上的popIn样式名
		if(self.dialog.hasClass('popIn')){
			self.dialog.removeClass('popIn');
		}
	},
	bindUI: function (){
		var ok = AI('#J-dialog-box-OK'),
		    cancel = AI('#J-dialog-box-CANCEL'),
			self = this;
		
		//首先卸载事件
		ok.unbind();
		cancel.unbind();
		
		//然后再注册事件
		ok.click(AI.proxy(self.submit,self));
		cancel.click(AI.proxy(self.hide,self));
	},
	submit: function (e){
		if(e){e.preventDefault();}
		
		var self = this;
		
		//执行外部提供的回调函数
		if(self.submitCallback){
			self.submitCallback();
		}
	}
};

/******************************************Slide 幻灯片****************************************/
/**
 * @constructor AI.Slide
 * @param {Object} options
 * @example {
 *   node: {DOM} //注意这里一个DOM对象，而不是字符串
 *   start: {Function} 可选
 *   end: {Function} 可选 
 *   navCount: {Boolean} 可选。//是否需要渲染幻灯片的导航统计指示器，默认为true
 *   autoPlay: {Boolean} 可选。//是否需要自动播放，默认为true
 *   time: {Integer} 可选。//动画间隔的时间，默认为3000
 *   touch: {Boolean} 可选。是否启用touch事件，默认为true
 * }
 */
AI.Widget.Slide = function (options){
	var config = {
		node: null,
		startFn: null,
		endFn: null,
		navCount: true,
		autoPlay: true,
		time: 3000,
		touch: true,
		intervalTime: 1500 //轮询时间
	};
	
	this.options = AI.extend(config,options);
	
	//初始化的配置
	this.init();
	
	//立刻修改样式
	this.setCSS();
};

AI.Widget.Slide.prototype = {
	init: function (){
		var self = this,
		    options = self.options;
		
		//默认配置参数
		self.node = options.node;
		self.startFn = options.startFn;
		self.endFn = options.endFn;
		self.navCount = options.navCount;
		self.autoPlay = options.autoPlay;
		self.time = options.time;
		self.touch = options.touch;
		self.intervalTime = options.intervalTime;
		
		//公共的静态变量
		self.id = 0; //默认的卡片id
		self.startX = 0; //初始化x开始坐标值 
		self.endX = 0;   //初始化x结束坐标值 
		self.originalStartX = 0; 
	},
	render: function (){
		var self = this;
		
		if(!self.node.get(0)){return;}
		
		if(self.navCount){
			//绘制幻灯片的导航统计指示器
			self.drawNavCount();
		}
		
		if(self.autoPlay){
			//如果启用自动播放，我们需要设置默认的css3动画
			self.node.get(0).style.webkitTransition = '-webkit-transform '+ self.intervalTime/1000 +'s ease';
			self.play();
		}
		
		//初始化卡片id
		self.id = 0;
		
		if(self.touch && AI.UA.system !== 'android'){
			//初始化手指移动的方向（向左移动）
			self.touchDirection = 1;
			
			//注册touch事件
			self.bindTouchEvent();
		}
		
		if(AI.UA.system !== 'android'){
			//为幻灯片容器绑定webkit动画结束事件
			self.node.webkitTransitionEnd(AI.proxy(self.transitionend,self));
		}
	},
	touchstartfn: function (e){
		   var self = this;
		
		    //如果有自动播放，必须要清除
			if(self.playTimer){
				clearInterval(self.playTimer);
			}
			
			//卸载touchstart事件
			self.node.unbind('touchstart');
			
			//记录初始的坐标值
			self.startX = e['originalEvent']['changedTouches'][0].pageX;
			
			self.originalStartX = self.startX;
			
			self.node.parent().css({
				background: '#ededed'
			});
	},
	touchendfn: function (e){
		var self = this,
		    node = self.node,
			nodeParentW,
			oldMatrix,
			translateX;
			
			self.node.parent().css({
				background: '#fff'
			});
		
		    nodeParentW = node.parent().width();
			
			node.get(0).style.webkitTransition = '-webkit-transform 0.8s ease';
			
			node.touchstart(AI.proxy(self.touchstartfn,self));
			
            //如果当前是最后一个卡片，那么必须将卡片的id重置为0
            if (Math.abs(self.id) < 0 || Math.abs(self.id) >= self.cards.length) {
                self.id = 0;
            }
				
			oldMatrix = new WebKitCSSMatrix(node.get(0).style.webkitTransform);
			
			
			
			var currentX = e['originalEvent']['changedTouches'][0].pageX;
			
			if(currentX === self.originalStartX){
				return;
			}else if(Math.abs(currentX - self.originalStartX) < nodeParentW/2){
				if(self.id < self.cards.length -1 && self.id > 0){
					self.id = self.id;
				}
			}else{
				//如果手指是往左滚动
				if(self.touchDirection === 1){
					if(self.id < self.cards.length -1){
						self.id++;
					}
				}
				
				//如果手指是往右滚动
				if(self.touchDirection === 0){
					if(self.id > 0){
						self.id--;
					}
				}
			}
			
			self.originalStartX = currentX;

			//translateX的值应该为负数
			translateX = -(nodeParentW*self.id) - oldMatrix['e'];//'translateX('+-(nodeParentW*self.id)+'px)';

			node.get(0).style.webkitTransform = oldMatrix.translate(translateX,0,0);//translateX;
	},
	touchmovefn: function (e){
		var self = this,
		    node = self.node,
			oldMatrix,
			translateX;
		
		    node.get(0).style.webkitTransition = 'none';
			
			e.originalEvent.preventDefault();
			
			//如果有自动播放，必须要清除
			if(self.playTimer){
				clearInterval(self.playTimer);
			}
			
			//实时计算手指最后在屏幕的坐标
			self.endX = e['originalEvent']['changedTouches'][0].pageX;

			oldMatrix = new WebKitCSSMatrix(node.get(0).style.webkitTransform);
			
			//向右滚动
			if(self.endX > self.startX){
				translateX = self.endX - self.startX;
				self.touchDirection = 0;
			}
			
			//向左滚动
			if(self.startX > self.endX){
				translateX = self.endX - self.startX+'';
				self.touchDirection = 1;
			}
			
			//覆盖原有的初始化的坐标值 
			self.startX = e['originalEvent']['changedTouches'][0].pageX;

			node.get(0).style.webkitTransform = oldMatrix.translate(translateX/2,0,0);
	},
	bindTouchEvent: function (){
		var self = this,
		    node = self.node;
			
		node.touchmove(AI.proxy(self.touchmovefn,self));
		
		node.touchstart(AI.proxy(self.touchstartfn,self));
		
		node.touchend(AI.proxy(self.touchendfn,self));
	},
	transitionend: function (e){
        var self = this;
		
		if(self.navCount){
			self.drawNavCount();
		}
		
		if(self.playTimer){
			clearInterval(self.playTimer);
		    self.play();
		}
	},
	play: function (){
		var self = this;
		
		self.playTimer = setInterval(function (){self.animate();},self.time);
	},
	setCSS: function (){
		var self = this;
		
		if(!self.cards){
			self.getCards();
		}
		
		var cards = self.cards,
		    w = self.node.parent().width();
		
		//去除卡片元素中的hide样式名并设置浮动样式
		cards.removeClass('hide').css({
			'float': 'left',
			'width': w
		});
		
		//设置卡片容器的宽度
		self.node.css('width',cards.length*w);
		
		
		self.node.parent().css({
			overflow: 'hidden'
		});
		
		self.node.find('[data-role=card]').css('display','block');
	},
	adjust: function (){
		var self = this,
		    cards = self.cards,
			w = self.node.parent().width();

		self.node.css('width',cards.length*w);
		cards.css('width',w);
	},
	animate: function (){
		var anim,
		    self = this,
			value,
			id = self.id,
			oldMatrix,
			node = self.node,
			nodeParentW = node.parent().width(),
			translateX = id*nodeParentW,
			ua = AI.UA.system;

		oldMatrix = new WebKitCSSMatrix(node.get(0).style.webkitTransform);
		
		if(translateX === 0){
			translateX = nodeParentW;
		}
		
		if(ua === 'android'){
		  var andID = id+1;
		  
		  if(andID === self.cards.length){
		  	andID = 0;
		  }
		  
		  translateX *= andID;
		  
		  node.animate({
				marginLeft: -translateX
			},self.intervalTime,AI.proxy(self.transitionend,self));	
		}else{
		  node.get(0).style.webkitTransform = oldMatrix.translate(-translateX,0,0);
		}
		
		self.id++;
		
		if(self.id === self.cards.length){
			self.id = 0;
			
			if (ua === 'android') {
			    node.css('marginLeft','0px');
			}else{
				node.get(0).style.webkitTransform = 'translate(0px,0px)';
			}
		}
	},
	end: function (){
		if(this.endfn){
			this.endfn();
		}
	},
	start: function (){
		if(this.startfn){
			this.startfn();
		}
	},
	stop: function (){},
	//获取所有的卡片
	getCards: function (){
		var self = this,
		    cards;
		
		cards = self.node.find('*[data-role=card]');
		self.cards = cards;
	},
	current: function (){},
	drawNavCount: function (){
		var self = this,
		    canvasHTML = '<section class="Slide-navCount" style="padding-top:6px;display:-webkit-box;clear:both;width:100%;height:5px;">'+
					     '<canvas id="J_slidenavCount" height="5" style="display:block;margin:0 auto;"></canvas>'+
				         '</section>',
			canvas,
			context;
		
		if(!self.node.get(0)){return;}
		
		if(self.cards.length > 1 && !AI('.Slide-navCount').get(0)){
			self.node.after(canvasHTML);
		}
		
		canvas = AI('#J_slidenavCount');
        if(!canvas.get(0)){return false;}
        
		context = canvas.get(0).getContext('2d');
		
        //清理画布
        canvas.get(0).height = 5;
        
        var  current = self.id !== 0 ? self.id : self.id || 0,//高亮当前的圆，默认为0
	         color = '#adadad',//圆的填充
	         acitveColor = '#3c61a0',//高亮颜色
	         radius = 2.5,//圆的半径
	         space = 10,//圆的间距 
	         x = 0,//画笔的X起点
	         y = canvas.height() / 2;//画笔的Y起点
	         
	         //从canvas的中心开始绘制
	         x = (canvas.width() - ((self.cards.length - 1) * space) - (radius * 2 * self.cards.length)) / 2 + radius;

        for (var i = 0; i < self.cards.length; i++) {
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI, false);
            context.fillStyle = color;
            
            if (i === current) {
                context.fillStyle = acitveColor;
            }

            context.fill();
            x += space;
        }
	}
};
/******************************************ajaxAcco折叠菜单组件，请注意该组件支持ajax数据请求*********************************************/
/**
 * @constructor AI.Widget.ajaxAcco
 * @param {Object} options
 * @example {
 *   acco: {DOM} 必须是一个AI对象。组件将遍历该DOM中的所有触发器。也就是说它应该是你的折叠菜单的DOM对象
 *   trigger: {String} 必须是字符串。组件将在折叠菜单DOM对象中根据这一属性查找所有的触发器。它可以是一个class名，如.acco-trigger，也可以是一个自定义属性
 *   id: {String} ajaxAcco.dataRequest将从触发器的这一属性中取值然后传递到服务端，服务端根据这个属性返回对应的menuList内容
 *   dataContainer: {DOM} 数据存储器。请求到的数据格式化后，将被填充到这DOM对象中
 *   ajax: {Object} 如果你不打算使用支持ajax数据请求的折叠菜单组件，那么请使用AI.Widget.staticAccos；
 *   immediate: {Int} 可选参数。该折叠菜单组件中的第immediate个菜单子类将直接调用send方法，也就是直接请求数据
 * }
 */
AI.Widget.ajaxAcco = function (options){
	this.options = options || {};
	this.acco = this.options.acco;
	this.ajax = this.options.ajax;
	this.trigger = this.options.trigger;
	this.id = this.options.id;
	
	this.initializer();
};

//将折叠菜单子类的实例化后的对象push到这个数据中并保存
AI.Widget.ajaxAcco.datas = [];

//隐藏其它的菜单
AI.Widget.ajaxAcco.hideOther = function (){
	for(var i=0,l=AI.Widget.ajaxAcco.datas.length;i<l;i++){
		AI.Widget.ajaxAcco.datas[i].hideData();
	}
};

AI.Widget.ajaxAcco.prototype = {
	initializer: function (){
		var self = this,
		    triggers = self.acco.find(self.trigger);
		
		//数据请求组件实例集合	
		self.dataRequest = [];

		for(var i=0,l=triggers.length;i<l;i++){
			var trigger = AI(triggers[i]);
			
			self.dataRequest.push(
			  new AI.Widget.ajaxAcco.dataRequest({
			  	trigger: trigger,
				dataContainer: trigger.parent(),
				ajax: self.ajax,
				id: self.id
			  })
			);
		}
	},
	render: function (){
		var self = this;
		
		AI.Widget.ajaxAcco.datas = self.dataRequest;
		
		//执行支持数据请求的折叠菜单渲染
		for(var i=0,l=self.dataRequest.length;i<l;i++){
			self.dataRequest[i].render();
			
			//如果提供了自定义的数据显示方法
			if(self.showData){
				self.dataRequest[i].showData = self.showData;
			}
		}
		
		//如果指定了初始化渲染的菜单索引
		if(self.options.immediate !== undefined){
			self.dataRequest[self.options.immediate].request();
			self.dataRequest[self.options.immediate].changeIcon();
		}
	}
};

/**
 * 折叠菜单的数据请求构造器
 * @constructor AI.Widget.ajaxAcco.dataRequest
 * @param {Object} options
 * @example {
 *   trigger: {DOM} 触发器。必须是一个AI DOM对象
 *   id: {String} 一个id属性，组件将从触发器的这个属性中取值，该值将作为每个触发器所对应的菜单的id。该值将被发送到服务端，服务端根据这个id值来返回对应这个触发器的menuList
 *   dataContainer: {DOM} 数据存储器。请求到的数据将被格式化，然后append到该DOM。必须是一个AI DOM对象
 *   ajax: {Object} 
 * }
 */
AI.Widget.ajaxAcco.dataRequest = function (options){
	this.options = options || {};
	this.dataContainer = this.options.dataContainer;
	this.ajax = this.options.ajax;
	this.effect = this.options.effect || 'slide';
	this.id = this.options.id;
};

AI.Widget.ajaxAcco.dataRequest.prototype = {
	//所需的常量
	loading: '正在请求数据<ins class="loading"></ins>',
	error: '请求失败，请重试',
	bindUI: function (){
		var self = this;
		
		self.trigger = self.options.trigger;
		self.trigger.click(AI.proxy(self.request,self));
	},
	activeTrigger: function (){
		this.trigger.attr('active',"true");
	},
	notActiveTrigger: function (){
		this.trigger.removeAttr('active');
	},
	unbindUI: function (){
		this.trigger.unbind('click');
	},
	render: function (){
		this.bindUI();
	},
	/**
	 * 显示已被格式化后的数据
	 * 默认情况下，插入格式化的数据是以section标签插入到数据存储器中，但有时可能无法满足你的业务需要
	 * 这个方法可以根据不同的业务需求做覆盖
	 * 若你覆盖了这个showData方法，则需要调用slideShowData方法来以动画的展现形式显示数据
	 * @param {Object} data
	 */
	showData: function (data){
		var self = this,
		    data = '<section class="acco-bd" style="display:none;">'+ data.data +'</section>';
		
		//插入数据后，我们执行一个动画效果
		self.dataContainer.append(data);
		
		self.slideShowData();
	},
	//以动画的形式显示数据到页面
	slideShowData: function (){
		var self = this;
		
		self.switchMenu();
		
		self.dataContent = self.dataContainer.find('.acco-bd');
		self.dataContent.slideDown(300);
		
		self.trigger.find('span').html(self.triggerOldHTML).removeClass('err');
		self.trigger.click(AI.proxy(self.switchMenu,self));
		
		//数据渲染后检测当前触发器的icon是否正确
		var iconNode = self.trigger.find('.icon-arrow');

		if(iconNode.hasClass('icon-arrow-bottom')){
			iconNode.replaceClass('icon-arrow-bottom','icon-arrow-top');
		}
	},
	hideData: function (){
		var self = this;
		
		if(self.dataContent){
			self.dataContent.slideUp(300);
			self.notActiveTrigger();
			self.trigger.find('.icon-arrow').replaceClass('icon-arrow-top','icon-arrow-bottom');
		}
	},
	showSelfData: function (){
		var self = this;
		
		if (self.dataContent) {
			self.dataContent.slideDown(300);
			self.activeTrigger();
			self.trigger.find('.icon-arrow').replaceClass('icon-arrow-bottom','icon-arrow-top');
		}
	},
	changeIcon: function (){
		var self = this,
		    iconNode = self.trigger.find('.icon-arrow');

		if(iconNode.hasClass('icon-arrow-bottom')){
			iconNode.replaceClass('icon-arrow-bottom','icon-arrow-top');
		}else{
			iconNode.replaceClass('icon-arrow-top','icon-arrow-bottom');
		}
	},
	start: function (){
		var self = this,
		    oldTriggerHTML = self.trigger.find('span').get(0) ? self.trigger.find('span').html() : self.trigger.html();
		
		//保存触发器最初的文案
		self.triggerOldHTML = self.triggerOldHTML || oldTriggerHTML;
		
		self.trigger.find('span').html(self.loading);
	},
	switchMenu: function (){
		//如果当前触发器所对应的数据已经是显示状态
		if(this.dataContent && this.dataContent.css('display') === 'block'){this.hideData();return ;}
		
		if(AI.Widget.ajaxAcco && AI.Widget.ajaxAcco.datas){
			//隐藏其它的菜单 
			AI.Widget.ajaxAcco.hideOther();
			
			//显示当前触发器所对应的菜单
			this.showSelfData();
		}
	},
	slide: function (){
		var self = this;
		
		self.switchMenu();
		
		self.dataContent = self.dataConten || self.dataContainer.find('.acco-bd');

		self.dataContent.slideDown(300,function (){
			self.changeIcon();
		});
		
		self.currentStatus = 'block';
	},
	complete: function (o){},
	success: function (data){
		var self = this;
		
		if(parseInt(data.resultStatus,10) !== 100){
			self.failure(data);
			return;
		}else{
			self.unbindUI();
			self.showData.call(self,data);
		}
	},
	failure: function (data){
		var self = this;
		
		self.bindUI();
		self.trigger.find('span').addClass('err').html(data && data.memo ? data.memo : self.error).css('paddingLeft',0);
	},
	request: function (e){
		if (e) {
			e.preventDefault();
		}
		
		var self = this,
		    io;
		
		self.activeTrigger();
		self.unbindUI();
		
		var data = 'id='+ self.trigger.attr(self.id) +'';
		
		data += self.ajax.data ? "&"+self.ajax.data : "";
		
		io = new AI.ajax(self.ajax.url,{
			data: data,
			type: self.ajax.method,
			on: {
				start: self.start,
				success: self.success,
				complete: self.complete,
				failure: self.failure
			},
			context: self,
			dataType: 'json'
		});
		
		self.io = io;
		io.send();
	}
};

/*********************************静态的Acco组件 不支持ajax数据请求*********************************************/
/**
 * @example {
 *   acco: {DOM} 必须是一个AI对象。组件将遍历该DOM中的所有触发器。也就是说它应该是你的折叠菜单的DOM对象
 *   trigger: {String} 必须是字符串。组件将在折叠菜单DOM对象中以trigger指定的字符器属性或CSS class名或标签名，来查找该折叠菜单DOM对象中所有的触发器
 *   id: {String} 组件将从触发器的这个属性中取值，以匹对与该id属性值相同的菜单列表
 *   menuListNodeName: {String} 对应这个触发器的菜单列表的节点名称，组件将遍历acco下这些节点名称，然后查找哪一个是与id指定的这个属性值相同
 * }
 */
  AI.Widget.staticAccos = [];
  
  AI.Widget.staticAcco = function (options){
    this.options = options || {};
	this.acco = this.options.acco;
	//this.id = this.options.id;
	this.trigger = this.options.trigger;
	this.menuListNodeName = this.options.menuListNodeName || 'ul';
  };
  
  AI.Widget.staticAcco.prototype = {
    bindUI: function (){
	  var self = this;
	  
	  var self = this,
	      acco = self.acco;

	  self.trigger.click(AI.proxy(self.switchMenu,self));
	},
	hideOtherMenuList: function (){
	  var self = this;

	  if(AI.Widget.staticAccos.length<1){
	    return ;
	  }
	  
	  for(var i=0,l=AI.Widget.staticAccos.length;i<l;i++){
	  	if(AI.Widget.staticAccos[i].menuList != self.menuList){
			AI.Widget.staticAccos[i].hide();
		}
	  }
	  
	  if(self.menuList){
	    self.menuList.slideDown(300);
	  }
	  
	  self.trigger.find('.icon-arrow').replaceClass('icon-arrow-bottom','icon-arrow-top');
	},
	switchMenu: function (e){
	  var self = this;
	  
	  if(e){e.preventDefault();}
	  
	  if(self.menuList.css('display') === 'block'){
	  	self.menuList.slideUp(300);
		self.trigger.find('.icon-arrow').replaceClass('icon-arrow-top','icon-arrow-bottom');
		return;
	  }
	  
	  //隐藏其它的菜单列表
	  self.hideOtherMenuList();
	},
	hide: function (){
	  var self = this;

	  if(self.menuList){
	    self.menuList.slideUp(300);
	  }
	  
	  self.trigger.find('.icon-arrow').replaceClass('icon-arrow-top','icon-arrow-bottom');
	},
	renderUI: function (){
	  var self = this,
	      //id = self.trigger.attr(self.id),
	      menus = self.acco.find(self.menuListNodeName);
		  
	  /*for(var i=0,l=menus.length;i<l;i++){
	  	if(AI(menus[i]).attr(self.id) === id){
			self.menuList = AI(menus[i]);
			break;
		}
	  }*/
	  self.menuList=self.trigger.parent().find('.acco-bd');
      self.menuList.length==0?self.menuList=self.trigger.parent().parent().find('.acco-bd'):null;
      self.bindUI();
	}
  };
 
/******************************************Acco 折叠菜单组件*********************************************/
/**
 * 这是支持ajax数据请求版本的acco和静态数据acco版本的集合
 * 组件将根据options中是否指定了ajax配置参数来实例化不同的acco组件
 * @param {Object} options
 */
AI.Widget.Acco = function (options){
	options = options || {};
	
	if(options.ajax){
		return new AI.Widget.ajaxAcco(options);
	}else{
		var triggers = options.acco.find(options.trigger);
		
		for(var i=0,l= triggers.length;i<l;i++){
		    AI.Widget.staticAccos.push(new AI.Widget.staticAcco({
			  acco: options.acco,
			  trigger: AI(triggers[i]),
			  id: options.id,
			  menuListNodeName: options.menuListNodeName
			})); 
		  }
	}
};
AI.Widget.Acco.prototype = {
	render: function (){
		for(var i=0,l=AI.Widget.staticAccos.length;i<l;i++){
		    AI.Widget.staticAccos[i].renderUI();
		}
	}
};
  
/******************************************dataSifter 数据筛选器组件*********************************************/
/**
 * 数据筛选器组件
 * @param {Object} options
 * @example 
 * {
 *   dataBox: {DOM} 存放数据的DOM容器。数据格式完成后，被插入到这个DOM对象中
 *   dataTemplate: {String} 数据的HTML模版。
 *   dataFilter: {Function} 可选参数。数据过滤器，有时仅仅依靠数据模版可能无法满足你的业务需求。
 *   于是您可以指定一个过滤器对服务端返回的数据进行过滤、判断等等其它的操作
 *   然后dataTemplate中获取的数据将是由过滤器过滤后的数据
 *   这个过滤器带有三个参数key,value,dataSource
 *   dataSource就是服务端返回的JSON数据包
 *   当然，这个过滤器将会在dataTemplate与服务端返回的JSON数据做匹配时执行
 *   如果你指定了过滤，这个过滤函数的形式应该像这样：
 *   
 *   
 *   
 *   dataFilter: function(key,value){
 *     var newValue;
 *     
 *     if(key === 'id'){
 *       value = 'newID'
 *     }
 *     
 *     return newValue;
 *   }
 *   //注意，过滤器必须有个返回值；
 *   
 *   假如，你需要动态为模版中添加额外的数据，这些数据服务端可能并不会返回给你
 *   你可以这样做：
 *   
 *   dataFilter: function(key,value,data){
 *     data.user = "朱琦";
 *   }
 *   
 *   
 *   
 *   
 *   ajax: {Object} ajax请求配置项，值得注意的是ajax对象中的data参数的格式不所不同，基本格式如下：
 *     data: [
 *	    {action: {String}},
 *		{awid: {String}},
 *	 	{
 *		  requestData: {
 *		    pageNum: {Int}, 页码
 *		    itemsPerPage: {Int}, 每页显示多少条数据
 *		    datespan: {String} 时间范围。比如：threeMonth
 *		  }
 *		}
 *	  ]
 *   firstGetDataCompleteCallback: {Function} 可选参数。第一页数据渲染结束后的回调函数，请注意是第一页
 * }
 */
AI.Widget.dataSifter = function (options){
	this.options = options || {};
	this.dataBox = this.options.dataBox;
	this.dataTemplate = this.options.dataTemplate;
	this.ajax = this.options.ajax;
	this.scroll = this.options.scroll;
	this.dataFilter = this.options.dataFilter || function (){};
	this.firstGetDataCompleteCallback = this.options.firstGetDataCompleteCallback || function (){};
	
	this.initializer();
}

//默认高亮数据的背景颜色值
AI.Widget.dataSifterHightLightColor = '#fce0bb';

AI.Widget.dataSifter.prototype = {
	initializer: function (){
		var self = this;
		
		//数据存储器
		self.dataList = [];
		
		//初始化数据请求总量
		self.dataAmount = 0;
	},
	start: function (){
		var self = this;
		
		if(self.ajax.start){
			self.ajax.start();
		}
		
		if(self.trigger && self.trigger.get(0)){
		  self.trigger.html(AI.Widget.dataSifterManager.loadingTip).removeClass('err');
		}
	},
	/**
	 * 如果用户的数据已经请求完毕
	 * 该方法在用户点击获取更多数据的触发器时触发
	 */
	onNodatasAtProcess: function (){
		this.trigger.unbind();
		this.trigger.parent().remove();

		var triggerHtml = AI.Widget.dataSifterManager.onNodatasAtProcess;
        //客户端调用处理
        var isFromClient=AI('[name=isFromClient]').val();
        if(isFromClient=='T'){
            this.dataBox.after('');
        }else{
		    this.dataBox.after(triggerHtml);
        }
	},
	//如果用户首次请求时，没有数据
	noData: function (){
		this.trigger.parent().remove();
		
		var triggerHtml = '<p class="data-list-noDataTip">'+ AI.Widget.dataSifterManager.noDataTip +'</p>'+
		                  '<span class="data-list-NoDatasIcon"></span>';
								  
		this.dataBox.html(triggerHtml);
	},
	success: function (data){
		var self = this
		
		//如果第一次请求时，就没有数据
		if(self.pageNum === 1 && data.noData){
			self.noData();
			return ;
		}
		
		if(parseInt(data.resultStatus,10) !== 100 && !data.noData){
			self.failure(data);
			return ;
		}
		
		//如果用户在点击获取更多数据的按钮时没有最新的数据
		if(data.noData){
			self.onNodatasAtProcess();
			return ;
		}
		
		//第二次前端获取到了用户的总数据量
		if(data.totalCount){
			self.totalCount = data.totalCount || '';
		}

		//我们保存取到的数据列表
		AI.each(data.dataList,function(i,data){
		 	self.dataList.push(data);
		});
		
		//执行渲染
		self.renderData(data);
	},
	failure: function (data){
		var self = this;
		
		if(self.ajax.failure){
			self.ajax.failure();
		}
		
		//请求失败后，我们允许用户再次发送请求
		if(self.trigger){
			self.trigger.click(AI.proxy(self.send,self));
		    self.trigger.html(data.memo || AI.Widget.dataSifterManager.errorTip).addClass('err');
		}
	},
	complete: function (){
		var self = this;
		
		//强制把每页的数据量控制在10条
		self.itemsPerPage = 10;
		
		if(self.ajax.complete){
			self.ajax.complete(self.dataList||[]);
		}
	},
	send: function (e){
		var self = this,
		    ajax = self.ajax;
		
		if(e){
			e.preventDefault();
		}
		
		//将最新的页码传递到查询参数中
		ajax.data = ajax.data.replace(/^(.*)(pageNum\:\d+)\,?(itemsPerPage\:\d+)(.*)$/,function ($0,$1,$2,$3,$4){
			$2 = 'pageNum:'+self.pageNum;//修改页码
			$3 = ',itemsPerPage:'+(self.itemsPerPage ? self.itemsPerPage : '10');//修改每页需要显示的数据条数
			
			return $1+$2+$3+$4;
		});
		
		//不允许用户多次请求
		if(self.trigger){
			self.trigger.unbind();
		}
		
		//清除历史数据
		self.dataList = [];

		self.io = new AI.ajax(ajax.url,{
			data: ajax.data,
			type: ajax.method,
			on: {
				start: self.start,
				complete: self.complete,
				success: self.success,
				failure: self.failure
			},
			timeout: ajax.timeout,
			context: self,
	        dataType: ajax.dataType || 'json'
		});
		
		self.io.send();
		
		//计算当前请求的数据总量，为接下来的判断是否还有新数据做预备
		self.dataAmount += (self.itemsPerPage ? /*self.itemsPerPage*/10 : 0);
	},
	renderData: function (dataSrc){
		var self = this,
		    data;
		
		if(self.trigger){
			self.trigger.html(AI.Widget.dataSifterManager.moreTip || '更多');
		}
		
		//第一次请求成功后将loading状态删除
		if(self.pageNum && self.dataBox.find('.J-dataBox-loadingStatus').get(0)){
			self.dataBox.empty().removeClass('data-list-beforeLoading');
		}
		
		for(var i=0,l=self.dataList.length;i<l;i++){
			data = self.dataList[i];
			
			//如果需要对数据做过滤
			if(self.dataFilter){
				AI.dataTemplate.filter = self.dataFilter;
			}
			
			self.dataBox.append(AI.dataTemplate(self.dataTemplate,data));
		}
		
		//如果是第一页的请求，我们将向页面添加获取更多的按钮
		if(self.pageNum === 1){
			self.dataBox.after(AI.Widget.dataSifterManager.getMoreButton(self.id));
			
			//设置数据筛选器的触发器
			self.trigger = AI('#'+self.id);
		}
		
		//如果还有新数据 
		if(self.trigger && !self.NONEWDATA){
			self.trigger.click(AI.proxy(self.send,self));
		}
		
		//如果没有新数据
		if(self.NONEWDATA){
			self.trigger.unbind();
			self.trigger.html(AI.Widget.dataSifterManager.noDataTip).addClass('err');
		}
		
		/**
		 * 首次获取数据成功后的回调函数
		 * 也就是当页码为1时，获取完数据并渲染成功后执行这个回调函数
		 * 为什么要这样做？因为我们需要为用户定位到他之前操作的那条数据，而这个工作需要在数据渲染结束后执行
		 */
		if(self.firstGetDataCompleteCallback && self.pageNum === 1){
			self.firstGetDataCompleteCallback.call(self.firstGetDataCompleteCallback,dataSrc);
		}
		
		//首次请求时已经把全部的数据请求到页面
		if(self.pageNum === 1 && (dataSrc.totalCount <= self.dataAmount || dataSrc.totalCount <= self.itemsPerPage)){
			if(self.itemsPerPage <= 10){
				self.hideBottomBar();
			}else{
				self.onNodatasAtProcess();
			}
			return ;
		}
		
		//改变页码，请求下一页数据
		/**
		 * 为了不会请求重复的数据，在此必须把页码设置为程序已经记录用户总共请求的页码数，然后将其加
		 * AI.Widget.dataSifter.userRequestedDataParams.pageNum的值是从url中的参数获取的
		 */
		self.pageNum = AI.Widget.dataSifter.userRequestedDataParams.pageNum || 0;
		self.pageNum++;
		
		/**
		 * javascript获取每页数据后，执行一次检验
		 * 检查是否还有最新的数据
		 */
		if(dataSrc.totalCount === self.dataAmount || dataSrc.totalCount <= self.dataAmount || ((self.pageNum-1)*10) >= dataSrc.totalCount){
			self.onNodatasAtProcess();
		}
		
		//将用户当前请求的数据总量和页码保存下来，当前请求的数据总量将追加到URL中发送到下一个页面
		AI.Widget.dataSifter.userRequestedDataParams.itemsPerPage = parseInt(AI.Widget.dataSifter.userRequestedDataParams.itemsPerPage,10)+10;
		AI.Widget.dataSifter.userRequestedDataParams.pageNum = self.pageNum;
	},
	hideBottomBar: function (){
		this.trigger.parent().remove();
	},
	render: function (){
		//实例时清除数据容器中的内容
		this.dataBox.find('p:last-child').html('正在下载数据');
	},
	noNewdata: function (){
	  this.trigger.unbind();

	  //标记一下，当前已经没有最新的数据
	  this.NONEWDATA = true;
	}
};

/******************************************dataSifterManager 数据筛选组件管理器********************************************/
/**
 * 数据筛选组件管理器
 * 管理多个数据筛选器
 * @param {Arrray} optionlist 对象字面量集合，每个对象字面量的格式与数据筛选器组件的数据格式相同
 */
AI.Widget.dataSifterManager = function (optionlist){
	this.optionlist = optionlist || [];
	this.init();
};

//数据筛选组件管理器的一些基本的常量
AI.Widget.dataSifterManager.noDataTip = '您当前无任何数据。';
AI.Widget.dataSifterManager.moreTip = '更多';
AI.Widget.dataSifterManager.errorTip = '获取失败，请重试';
AI.Widget.dataSifterManager.loadingTip = '正在获取<ins class="loading"></ins>';

AI.Widget.dataSifterManager.onNodatasAtProcess = '<section class="btn-more" id="J-trigger">'+
        '<a href="#header" style="margin:0 auto;border:none;width:100%;">'+
        '<section class="layout-flex"> <b>回顶部<span class="icon-arrow icon-top" style="display:block;position:static;"></span></b> </section>'+
        '</a> </section>';


AI.Widget.dataSifterManager.getMoreButton =	 function (id){
    //客户端调用处理
    var isFromClient=AI('[name=isFromClient]').val();
    if(isFromClient=='T'){
        return '<section class="btn-more" id="J-trigger">'+
            '<a href="#header" id="'+id+'" style="width:100%;border-right:none;">更多</a></section>';
    }else{
        return    '<section class="btn-more" id="J-trigger">'+
            '<a href="#header" id="'+id+'">更多</a> <a href="#">'+
            '<section class="layout-flex"> <b>回顶部<span class="icon-arrow icon-top" style="display:block;position:static;"></span></b> </section>'+
            '</a> </section>';
    }

};

AI.Widget.dataSifterManager.prototype = {
	init: function (){
	  var self = this;
	  
	  //数据筛选器存储器
	  self.dataSifts = [];
	  
	  //初始化数据请求总量
	  self.dataAmount = 0
	  
	  //实例化数据筛选器
      for(var i=0,l=self.optionlist.length;i<l;i++){
	  	var option = self.optionlist[i],
		    dataSifter = new AI.Widget.dataSifter(option);
		
		dataSifter.ajax.data = self.postDataSerialize(dataSifter.ajax.data);
		
		dataSifter.trigger = option.trigger;

		self.dataSifts.push(dataSifter);
	  }
	},
	//将POST数据序列化
	postDataSerialize: function (data){
		var result,
		    _data = [],
			self = this;
				
		AI.each(data,function (i,queries){
			AI.each(queries,function (k,query){
				//将查询类型传递到筛选表单对应的字段
				if(k === 'action'){
					if(AI('#J-type').get(0)){
						AI('#J-type').val(query);
					}
				}
				
				if(!AI.isPlainObject(query)){
					_data.push(k+'='+query+'&');
				}else{
					_data.push(k+'={');
					
					AI.each(query,function (j,q){
						//查询前端传递每页需要显示的数据
						if(j === 'itemsPerPage'){
						  	self.itemsPerPage = q;
							self.dataAmount = self.itemsPerPage;
							
							//将每页显示的数据量传递到筛选表单对应的字段
							if(AI('#J-itemsPerPage').get(0)){
								AI('#J-itemsPerPage').val(q);
							}
						}
						
						if(j === 'pageNum'){
							self.pageNum = q;
							
							//将页码传递到筛选表单对应的字段
							if(AI('#J-pageNum').get(0)){
								AI('#J-pageNum').val(q);
							}
						}
						
						//将时间范围传递到筛选表单对应的字段
						if(j === 'datespan'){
							if(AI('#J-datespan').get(0)){
								AI('#J-datespan').val(q);
							}
						}
						
						//从url中取出用户之前请求的数据，然后将默认的ajax查询参数覆盖
						if(j === 'itemsPerPage' || j === 'pageNum' || j === 'datespan'){
							    
								var search = location.search,
								    paramObj = {itemsPerPage:self.itemsPerPage || 10,pageNum:self.pageNum || 1,datespan:self.datespan || AI('#J-datespan').val()};
									
							    search = search.replace(/^(\?+)(.+)$/,'$2');
								
								var params = search.split('&');
									
								for(var i=0,l=params.length;i<l;i++){
									var resolve = params[i].split('=');
									
									if(resolve[0] === 'itemsPerPage' || resolve[0] === 'logId' || resolve[0] === 'pageNum' || resolve[0] === 'datespan'){
										paramObj[resolve[0]] = resolve[1];
									}
								}
								
								AI.Widget.dataSifter.userRequestedDataParams = paramObj;
							
							if(!AI.isEmptyObject(AI.Widget.dataSifter.userRequestedDataParams) && AI.Widget.dataSifter.userRequestedDataParams){
								self.itemsPerPage = AI.Widget.dataSifter.userRequestedDataParams.itemsPerPage;
								self.datespan = AI.Widget.dataSifter.userRequestedDataParams.datespan;
							}
							
							switch(j){
								case 'itemsPerPage':
								  q = AI.Widget.dataSifter.userRequestedDataParams.itemsPerPage;
								break;
								case 'datespan':
								  q = AI.Widget.dataSifter.userRequestedDataParams.datespan;
								break;
							}
						}
						_data.push(j+':'+q+',');
					});
					
					_data.push('}');
				}
			});
		});
		
		//去除空白 
		result = AI.trim(_data.join(''));
		
		//去除最后一个&符号
		result = result.replace(/^(.*)(,+)(})$/,function ($0,$1,$2,$3){
		   $2 = '';
		   return $1+$3;
		});

		return result;
	},
	send: function (){
		var self = this,
		    dataSift;
		
		for(var i=0,l = self.dataSifts.length;i<l;i++){
			dataSift = self.dataSifts[i];
			dataSift.send();
			
			//标识数据筛选器未请求
			dataSift.requested = false;
		}
	},
	configDefaultParams: function (){
		var self = this;
		
		for (var i = 0, l = self.dataSifts.length; i < l; i++) {
			var dataSift = self.dataSifts[i],
			    id = 'J-dataSift'+i+'';//触发器的id
			
			dataSift.id = id;
			
			dataSift.trigger = AI('#'+id);
			dataSift.pageNum = self.pageNum;
			dataSift.itemsPerPage = self.itemsPerPage;
			
			//为触发器绑定事件
			dataSift.trigger.bind('click',{"dataSift":dataSift},AI.proxy(self.triggerEvent,self));
		}
	},
	/**
	 * 这个触发器的方法不是很重要，后期可能会删除
	 * @param {Object} e
	 */
	triggerEvent: function (e){
		var trigger = AI(e.currentTarget),
		    dataSift = e.data['dataSift'];

		e.preventDefault();

		trigger.unbind();

		//如果已经请求的数据总量大于等于服务端返回的总条数数据，则禁止请求并提示用户
		if(this.dataAmount >= dataSift.totalCount){
			alert(AI.Widget.dataSifterManager.noDataTip);
			return ;
		}
		
		dataSift.send();
		
		//计算请求的数据量
		this.dataAmount += this.itemsPerPage;
	},
	render: function (){
	  for(var i=0,l=this.dataSifts.length;i<l;i++){
	  	this.dataSifts[i].render();
	  }
	  
	  //配置默认的请求参数
	  this.configDefaultParams();	 
	}
};

/**
 * 一个非常简单的数据模版
 * @param {String} html 
 * @param {Object} data
 * @example '<p>{userName}</p><p>{userID}</p>'  {userName:"朱琦",userID:"53421"}
 * @return 返回已经填充数据的html片段
 */
AI.dataTemplate = function (html,data){
	var objReg = /{\w+}/g,//查询html中了的模版变量字符串
	    dataList = html.match(objReg),//查询从html中匹配到模版变量字符串的数据列表
		dataReg = /^{(\w+)}$/,//查询模版变量字符串中的字符
		newHtml;//已填充数据的html片段
	
	newHtml = html.replace(objReg,function ($0,$1){
		$0 = $0.replace(dataReg,function ($0,$1){
			
			for(var k in data){
				data = data;
				
				if(k === $1){
					$1 = data[k];
					
					//如果需要对数据进行过滤
					if(AI.dataTemplate.filter){
						$1 = AI.dataTemplate.filter.call(AI.dataTemplate.filter,k,$1,data) || $1;
					}
					
					return $1;
				}
			}
			//假如服务端的数据与模版中的变量不匹配
			return $1 = '';
		});

		return $0;
	});
	
	return newHtml;
};

/***************************************Switch 开关组件*******************************************************/
/**
 * 模拟一个类似iOS的开关
 * @constructor AI.Widget.Switch
 * @param {Object} options
 * @example {
 *   node: {DOM} AI DOM容器。开关被嵌套在这个容器中
 *	 flag: {String} 前端和后端的数据交互标记，JS会从开关DOM对象的这个标记属性中获取开关状态的数据
 *   然后这个flag数据将被发送到服务器
 *	 caption: {String} 可选参数。弹出层的caption
 *	 ajax: { 
 *	  url: {String},
 *	  method: {String},可选参数。
 *	  data: {String}
 *	 }
 * }
 */
AI.Widget.Switch = function (options){
	this.options = options || {};
	this.node = this.options.node;
	this.onON = this.options.onON || function (){};
	this.onOFF = this.options.onOFF || function (){};
	this.supportDesk = this.options.supportDesk || false;
	this.flag = this.options.flag;
	this.ajax = this.options.ajax;
	this.caption = this.options.caption || '输入您的支付密码';
	
	this.init();
};
AI.Widget.Switch.prototype = {
	init: function (){
		var self = this;
		
		self.switchContainer = self.node.find('section');
		self.startX = 0;
		self.endX = 0;
		self.switchContainer.get(0).style.webkitTransition = '-webkit-transform 0.1s ease';
		self.translateValue = self.node.width();
		self.initStatus = self.node.attr(self.flag);
		self.type = self.node.find('input[type=hidden]').val();
		self.loadingTxt = '正在提交...';
		self.reSubmitTxt = '确定';
		self.failureTxt = '提交失败';
		self.passwordEmpty = '密码不能为空。';
	},
	ONSTATUS: function (){
		var self = this;
		
		self.switchContainer.get(0).style.webkitTransform = 'translate(-90px)';
		
		//Android 2.0--
		if(AI.UA.system === 'android' && parseInt(AI.UA.version,10) < 2){
			self.switchContainer.css('marginLeft','-90px');
		}
	},
	OFFSTATUS: function (){
		var self = this;
		
		self.switchContainer.get(0).style.webkitTransform = 'translate(0px)';
		
		//Android 2.0--
		if(AI.UA.system === 'android' && parseInt(AI.UA.version,10) < 2){
			self.switchContainer.css('marginLeft','0px');
		}
	},
	render: function (){
		this.bindUI();
	},
	bindUI: function (){
		var self = this;
		
		//如果是淘宝代扣，我们不允许用户使用开关功能
		if(self.node.attr('data-tb') && self.initStatus.toLowerCase() === 'off'){
			return ;
		}
		self.node.touchstart(AI.proxy(self.touchstart,self));
		
		if(self.supportDesk){
			self.node.click(AI.proxy(self.touchstart,self));
		}
	},
	touchstart: function (e){
		e.originalEvent.preventDefault();
		e.stopPropagation();
		
		var self = this;

		switch(self.initStatus.toLowerCase()){
			case 'on':
			  self.onOFFfn(e);
			break;
			case 'off':
			  self.onONfn(e);
			break;
		}

		self.showDialog();
	},
	onONfn: function (e){
		e.preventDefault();
		
		var self = this;
		
		self.node.attr(self.flag,'ON');
		self.statusText = '开启';
		
		self.ONSTATUS();
	},
	onOFFfn: function (e){
		e.preventDefault();
		
		var self = this;
		
		self.node.attr(self.flag,'OFF');
		self.statusText = '关闭';
		
		self.OFFSTATUS();
	},
	showMask: function (){
		if(!AI('#J-dialog-mask').get(0)){
			AI('body').append('<div id="J-dialog-mask" class="mask"></div>');
		}
		
		var d = document.documentElement,
		    w = d.clientWidth,
			h = d.clientHeight,
			ua = AI.UA.system;
			
		AI('#J-dialog-mask').css({
			width: w,
			height: h
		});
	},
	removeMask: function (){
		var self = this;
		
		if(AI('#J-dialog-mask').get(0)){
			AI('#J-dialog-mask').remove();
		}
	},
	refreshCaption: function (){
		var cap = AI('#J-dialog-caption');
		
		if(cap.get(0)){
			cap.html(this.statusText + this.caption);
		}
	},
	showDialog: function (){
		var self = this;
		
		//显示mask
		self.showMask();
		var isPtwUser=AI('input[name=isPtwUser]').val();
		//如果dialog已经存在
		if(AI('#J-dialog').get(0)){
			//宝令卡是否可见
			if(isPtwUser=='true'){
				self.initStatus.toLowerCase()=='off'?AI('#J-dialog-ptw-box').show():AI('#J-dialog-ptw-box').hide();
			}
			AI('#J-dialog').show();
			self.refreshPos();
			
			//更新dialog标题
			self.refreshCaption();
			
			//重新绑定事件到dialog
			self.reBindToDialog();
			
			//清除密码历史记录 
			if(AI('#J-password').get(0)){
			  AI('#J-password').val('');	
			}
			
			//清除错误信息
			if(AI('#J-dialog').find('.mm-error').get(0)){
				AI('#J-dialog').find('.mm-error').empty();
			}
			if(AI('#J-dialog').find('.ptw-error').get(0)){
				AI('#J-dialog').find('.ptw-error').empty();
			}
			//更新submit按钮的文案
			AI('#J-Dialog-OK').val('确定');
			
			return ;
		}
		
		var html = '<article class="dialog" id="J-dialog">'+
					  '<section class="box-skin box-dialog">'+
					    '<section class="box pd-lr10-bt8">'+
					      '<h1 class="dialog-hd" id="J-dialog-caption">'+ self.statusText + self.caption +'</h1>'+
						  '<p class="mm-error err"></p>'+
					      '<section class="dialog-bd">'+
					        '<input type="password" id="J-password" placeholder="支付密码">'+
							'<p class="t-right"> <a href="/user/findPayPass.htm?action=retrievePayPwUI&awid='+ AI('input[name=awid]').val() +'">找回密码</a> </p>'+
					      '</section>';
						  if(isPtwUser=='true'){
						  html+='<div id="J-dialog-ptw-box"'+(self.initStatus.toLowerCase()=='off'?'':' style="display:none;"')+'>';
						  html+='<p class="ptw-error err"></p>'+
					      '<section class="dialog-bd">'+
					        '<input type="password" id="J-ptw-password" placeholder="输入宝令屏幕上显示的6位数字">'+
					      '</section>';
						  html+='</div>';
						  }
					      html+='<div class="dialog-trigger">'+
					        '<div>'+
					          '<input type="submit" value="确定" class="btn btn-ok" id="J-Dialog-OK" style="width:120px;">'+
					        '</div>'+
							'<span class="space flex"></span>'+
					        '<div>'+
					          '<button class="btn btn-cancel" id="J-Dialog-cancel" style="width:120px;">取消</button>'+
					        '</div>'+
					      '</div>'+
					    '</section>'+
					  '</section>'+
					'</article>';
		
		AI('body').append(html);
		
		//更新浮出层的位置
		self.refreshPos();
		
		//在dialog上绑定事件
		self.bindUItoDialog();
		
		//清除密码历史记录 
		if(AI('#J-password').get(0)){
		  AI('#J-password').val('');	
		}
	},
	bindUItoDialog: function (){
		var ok = AI('#J-Dialog-OK'),
		    cancel = AI('#J-Dialog-cancel');
			
		if(ok.get(0) && cancel.get(0)){
			ok.click(AI.proxy(this.submit,this));
			cancel.click(AI.proxy(this.cancel,this));
		}
	},
	reBindToDialog: function (){
		var ok = AI('#J-Dialog-OK'),
		    cancel = AI('#J-Dialog-cancel');
		
		if(ok.get(0) && cancel.get(0)){
			ok.unbind();
			cancel.unbind();
		}
		
		this.bindUItoDialog();
	},
	submit: function (e){
		e.preventDefault();
		//清除错误信息
			if(AI('#J-dialog').find('.mm-error').get(0)){
				AI('#J-dialog').find('.mm-error').empty();
			}
			if(AI('#J-dialog').find('.ptw-error').get(0)){
				AI('#J-dialog').find('.ptw-error').empty();
			}
		var self = this,
		    password = AI('#J-password').val(),
		    type = self.type,
			ajax = self.ajax
			externalData = self.ajax.data;
		
		//验证
		if(!password){
			var errNode = AI('#J-dialog').find('.mm-error');
			
			errNode.html(self.passwordEmpty);
			return ;
		}
		//宝令卡
		var isPtwUser=AI('input[name=isPtwUser]').val(),
			ptwpassword= AI('#J-ptw-password').val();
		if(isPtwUser=='true'&&self.initStatus.toLowerCase()=='off'){
			if(!ptwpassword){
				var errNode = AI('#J-dialog').find('.ptw-error');
				
				errNode.html('宝令不能为空。');
				return ;
			}
		}
		
		var status;
		
		switch(self.initStatus.toLowerCase()){
			case 'on':
			  status = 'OFF';
			break;
			case 'off':
			  status = 'ON';
			break;
		}
		
		var data = externalData + '&status='+ status ;
		data+='&p='+ password ;
		if(isPtwUser=='true'&&self.initStatus.toLowerCase()=='off'){
			data+='&optPwd='+ptwpassword;
		}
		self.io = new AI.ajax(ajax.url,{
			data: data,
			type: ajax.method || 'POST',
			on: {
				start: self.start,
				success: self.success,
				failure: self.failure
			},
			context: self,
			dataType: 'json'
		});
		
		self.io.send();
	},
	start: function (){
		var ok = AI('#J-Dialog-OK');
		
		if(ok.get(0)){
			ok.unbind();
			ok.val(this.loadingTxt);
		}
	},
	success: function (data){
		try{
			var self = this;
			
			if(parseInt(data.resultStatus,10) !== 100){
				self.failure(data);
				return;
			}else{
				//如果是安全无密码支付类型
				if(data.NOPWD_URL){
					document.location.href = data.NOPWD_URL;
					return;
				}
				
				//如果是淘宝代扣，我们只允许关闭该服务
				if(data.dk && data.switchStatus.toLowerCase() === 'on'){
					self.node.unbind();
					document.location.reload();
				}
				
				//清除错误信息
				AI('#J-dialog').find('.mm-error').empty();
				if(AI('#J-dialog').find('.ptw-error').get(0)){
					AI('#J-dialog').find('.ptw-error').empty();
				}
				//修改submit文案
				AI('#J-Dialog-OK').val('确定');
				
				//更新开关
				self.changeSwitch(data);
				
				//关闭dialog
				self.removeDialog();
			}
		}catch(e){
			//页面可能过期，如果过期服务返回html源代码，这时将刷新页面
			document.location.reload();
		}
	},
	//密码验证成功后,我们改变开关状态
	changeSwitch: function (data){
		var self = this;
		
		if(data.switchStatus === self.initStatus){
			switch(data.switchStatus.toLowerCase()){
				case 'on':
				  self.OFFSTATUS();
				  
				  //更新开关的初始状态
			      self.initStatus = 'OFF';
				break;
				case 'off':
				  self.ONSTATUS();
				  
				  //更新开关的初始状态
			      self.initStatus = 'ON';
				break;
			}
		}else{
			alert('您的操作存在异常');
		}
	},
	failure: function (data){
		var ok = AI('#J-Dialog-OK'),
		    errNode = AI('#J-dialog').find('.mm-error');
		
		if(errNode.get(0)){
			errNode.html(data.memo || self.failureTxt);
		}
		
		//如果submit按钮存在，并且session没有过期
		//我们允许用户再次提交表单，否则我们刷新页面，让用户重新登录
		if(ok.get(0) && !data.sessionExpire){
			ok.val(this.reSubmitTxt);
			ok.click(AI.proxy(this.submit,this));
		}else if(ok.get(0) && data.sessionExpire){
			document.location.reload();
		}
	},
	cancel: function (e){
		e.preventDefault();
		
		var self = this;
		
		self.removeDialog();
		
		self.node.attr(self.flag,self.initStatus);
		
		switch(self.initStatus.toLowerCase()){
			case 'on':
			  self.ONSTATUS();
			break;
			case 'off':
			  self.OFFSTATUS();
			break;
		}
	},
	removeDialog: function (){
		var self = this;
		
		//移除mask
		self.removeMask();
		
		if(AI('#J-dialog').get(0)){AI('#J-dialog').hide();}
	},
	refreshPos: function (){
		var d = document.documentElement,
		    winW = d.clientWidth,
			winH = d.clientHeight,
			mask = AI('#J-dialog-mask'),
			dialog = AI('#J-dialog'),
			ua = AI.UA.system;
		
		if(mask.get(0) && dialog.get(0)){
		    if(AI(document).height() > winH){
				winH += 60;
			}
			
			var dialogWidth = dialog.width(),
			    dialogHeight = dialog.height(),
				scrollTop = window.scrollY;
			
			mask.css({
				width: winW,
				height: winH + scrollTop
			});
			
			dialog.css({
				left: (winW-dialogWidth)/2,
				top: (winH-dialogHeight)/2 + scrollTop
			});
		}
	}
};

/**
 * 创建一个有趣的交换交互组件
 * 必须依赖CSS中的swapRightOut、swapRightIn、swapLeftOut、swapLeftIn动画才能正常工作
 * @param {Object} options
 * @example {
 *   box: {DOM}这个DOM对象必须拥有一个class样式名为swap-box，如果没有AI.Swap将自动为期创建一个swap-box类名
 *   frontBox: {DOM} 默认显示在前的DOM对象
 *   afterBox: {DOM} 可选参数。显示在后的DOM对象，如果没有提供的话，将自动把反馈表单做为afterBox。
 * }
 */
AI.Swap = function (options){
	this.options = options || {};
	this.box = this.options.box;
	this.frontBox = this.options.frontBox;
	this.afterBox = this.options.afterBox;
	
	this.initializer();
};
AI.Swap.prototype = {
	initializer: function (){
		var self = this;
		
		if(!self.afterBox){
			var userName = AI('input[name=username]').val() || "",
			    awid = AI('input[name=awid]').val() || "",
			    html = '<section class="box-alpaha swap" id="J-afterBox">'+
						  '<form action="/help/feedback.htm?awid='+ awid +'" method="post">'+
						    '<section class="pd-lr10">'+
												'<p>您好，'+ userName +'！</p>'+
								      '<p>使用中遇到问题，请拨打支付宝客服热线：<br>'+
						        '<a href="tel:057188156688" class="tel"><ins class="icon icon-tel"></ins><span>0571-88156688</span></a></p>'+
						    '</section>'+
											'<input type="hidden" name="_form_token" value="HmE8YdetcpGs5Dk7K8AwbIue2kPEyn1Q">'+
						    '<section class="box-container">'+
										        '<textarea placeholder="请输入您的反馈或建议" name="feedbackContent"></textarea>'+
							      '</section>'+
						    '<footer class="box-container">'+
						      '<input type="submit" value="提交" class="btn btn-ok">'+
						    '</footer>'+
						  '</form>'+
						'</section>';

				self.box.append(html);
				self.afterBox = AI('#J-afterBox');
		}
		
		if(!self.box.hasClass('swap-box')){
			self.box.addClass('swap-box');
		}
	},
	bindUI: function (){
		var self = this;
		    front = self.frontBox,
			after = self.afterBox;
		
		//卸载事件
		front.unbind();
		after.unbind();
		
		front.webkitAnimationEnd(function (){
			AI(this).removeClass('current swapLeftOut');
		});
		
		after.webkitAnimationEnd(function (){
			AI(this).removeClass('swapLeftIn').addClass('current');

			//重新注册事件到窗口
			self.bindEventToWindow();
		});
	},
	reBindUI: function (){
		var self = this;
		    front = self.frontBox,
			after = self.afterBox;
			
		//卸载事件
		front.unbind();
		after.unbind();
		
		//重新为第二次交换注册事件
		front.webkitAnimationEnd(function (){
			AI(this).removeClass('swapRightIn').addClass('current');
			
			//重新注册事件到窗口
			self.bindEventToWindow();
		});
		
		after.webkitAnimationEnd(function (){
			AI(this).removeClass('current swapRightOut');
		});
	},
	swap: function (e){
		//e.preventDefault();
		
		AI(e.currentTarget).unbind();
		
		var self = this;
		    front = self.frontBox,
			after = self.afterBox;
		
		//我们要求用户双指触摸屏幕
		if(e.originalEvent.touches.length !== 2){self.bindEventToWindow();return ;}
			
		if(!self.isSwap){
			self.bindUI();
			
			if(!front.hasClass('current')){
				front.addClass('current');
			}
			
			if(!after.hasClass('current')){
				after.addClass('current');
			}
			
			front.addClass('swapLeftOut');
			after.addClass('swapLeftIn');
			
			//标识已经执行了一次交换
		    self.isSwap = true;
		}else{
			self.reBindUI();
			
			if(!front.hasClass('current')){
				front.addClass('current');
			}
			
			if(!after.hasClass('current')){
				after.addClass('current');
			}
			
			front.addClass('swapRightIn');
			after.addClass('swapRightOut');
			
			//标识已经执行了第二次交换
		    self.isSwap = false;
		}
	},
	bindEventToWindow: function (){
		AI('body').touchstart(AI.proxy(this.swap,this));
	},
	render: function (){this.bindEventToWindow();}
};

AI.Float = function (options){
  	this.config = AI.extend({},options);
	this.init();
  }
  AI.Float.prototype = {
  	init: function (){
		this.adjust();
		
		var ua = AI.UA.system;
		
		if(ua === 'iphone' || ua === 'ipad' || ua === 'itouch' || ua === 'ipod'){
			this.config.node.show();
		}
	},
  	render: function (){
		this.bindUI();
	},
	bindUI: function (){
		var self = this;
		
		AI(window).scroll(AI.proxy(self.scroll,self));
	},
	scroll: function (){
	  var self = this,
	      config = self.config,
	      position = config.position,
		  scrollY = window.scrollY,
		  winH = AI(window).height(),
		  nodeH = config.node.height()+20;

	  if(scrollY > 0 && window.orientation !== undefined){
	  	scrollY += 60;
	  }
	  
	  /*if(scrollY >= AI(document).height() - winH){
	  	if(window.orientation !== 0){
			scrollY = winH+130;
		}else if(window.orientation === 0){
			scrollY = 306-80;
		}
	  }*/

	  switch(position){
	  	case 'bottom':
		  config.node.css({
		  	top: winH+scrollY-nodeH
		  });
		  
		break;
		case 'top':
		break;
	  }	
	},
	adjust: function (){
		var self = this,
		    winW = AI(document).width(),
			winH = AI(window).height(),
			node = self.config.node,
			nodeH = node.height()+20,
			nodeW = node.width()+5;
		
		if(AI(document).height() > winH){
		  	winH += 60;
		}
		
		node.css({
			position: 'absolute',
			top: winH - nodeH,
			left: (winW - nodeW)/2
		});
		
		if(self.config.position === 'top'){
			node.css('top',0);
		}
	},
	hide: function (){
		var self = this,
		    config = self.config,
			node = config.node;
			
		node.hide();
	}
};


//当设备的方位改变时做特殊处理
AI.windowResizeFuns = [];
AI.windowResize = function (){
  var funs = AI.windowResizeFuns,
      i = 0;

  for(;i<funs.length;i++){
    AI.oop.bind(funs[i],funs[i]);
  }
};

//隐藏移动设备顶端的URL输入控件 
AI.hideURLBar = function (){
	setTimeout(function (){
		window.scrollTo(0,1);
	},0);
};
/**
 * 模拟Iphone本地应用场景滚动的web卡片滚动组件
 * @constructor AI.Widget.ScrollCards
 * @namespace AI.Widget.ScarollCards
 * @param (Object) options 配置参数 一个对象字面量
 * @example {
 *   container : 卡片容器,
 *   cardsNode : 存放卡片的层
 *   callback : 回调函数,该回调函数带有两个参数id,node，id表示当前卡片的下标,node表示当前卡片
 *   context : 回调函数执行上下文,
 *   preventDefault : 是否阻止浏览器默认事件
 *   start : 开始滚动前执行
 *   controlForms : 是否对表单控件做控制。这一属性针对android平台下的表单控件bug
 * }
 */
AI.Widget.ScrollCards = function(options){
	var self = this,
	    config = {
			isPreventDefault: true,
			controlForms: true,
			container: null
		};
		
	self.cfg = AI.extend({},config,options);
	
	this.init();
}

AI.Widget.ScrollCards.prototype = {
    init: function(){
		var self = this;
		
		self.container = self.cfg.cardsNode;
		
        //卡片组
        self.cards = [];
		
        //触发器组
        self.triggers = [];
		
        //初始卡片ID
        self.id = 0;
		
        //调整卡片容器的样式
        self.adjust();
		
		if(AI.UA.system !== 'android'){self.adaptediOS();}
    },
    //实例化后调整卡片容器样式
    adjust: function(){
		var self = this;
		
		//当设备旋转时清除卡片组，因为该方法可以会在window.onresize触发时调用
        self.cards.length = 0;
		
        //获取卡片组
        self.getCards();
		
        //注册事件
		self.unbind();
        self.bind();
		
		if(self.container.get(0) && AI.UA.system === 'android'){
			self.setCardCSS();
			self.hideOtherCards();
		}
    },
	adaptediOS: function (){
		var self = this;
		
		self.container.css({
			'width': 'auto',
			'display': '-webkit-box',
			'overflow': 'visible'
		});
		self.container.find('[role=card]').css('float','none');
		self.container.find('[role=card]:first-child').addClass('current');
	},
    //该方法主要作用于android
    setCardCSS: function(){
		var winW = document.documentElement.clientWidth,
		    l = this.cards.length;
		
		this.container.css('width',winW*l);
        for (var i = 0; i < l; i++) {
			var card = AI(this.cards[i]);
			
			if(card.hasClass('hide')){
			  card.removeClass('hide');	
			}
			
            card.css({
                width: winW + 'px'
            });
        }
    },
	hideOtherCards : function (){
		var cards = AI('.scrollCards').find('[role=card]'), 
		    i = 0;
			
        for (; i < cards.length; i++) {
            if(typeof this.id=='string'){
				if(cards[i].id!=this.id){
					AI(cards[i]).addClass('hide');
				}
			}else if(i !== this.id){
				AI(cards[i]).addClass('hide');
			}
        }
	},
	showCard : function (){
		if(AI.UA.system !== 'android'){return ;}

		var self = this,
		    card = AI(self.cards[self.id]);
		
		self.hideOtherCards();

		if(card.hasClass('hide')){
			card.removeClass('hide');
		}
		
		//如果用户提供了回调函数
        if (self.cfg.callback && self.cards[self.id] && AI.UA.system === 'android') {
            if (self.cfg.context) {
                self.cfg.callback.call(self.cfg.context, self.id, self.cards[self.id]);
            }
            else {
                self.cfg.callback.call(self.cfg.callback, self.id, self.cards[self.id]);
            }
        }
        else {
            return false;
        }
	},
    //注册事件
    bind: function(){
		var self = this;
		
        //当设备旋转时，检测卡片是否已经注册了事件
        if (self.regEventToCard) {
            return;
        }
		
        self.unbind();
		
        for (var i = 0; i < self.cards.length; i++) {
			if(AI(self.cards[i]).find('[data-action]')){
				self.triggers.push(AI(self.cards[i]).find('[data-action]'));
			}
        }
		
        for (var k = 0; k < self.triggers.length; k++) {
			if(self.triggers[k]){
				AI(self.triggers[k]).click(AI.proxy(self.switchOver, self));
			}
        }

        self.container.webkitAnimationEnd(AI.proxy(self.onAnimationEnd, self));
		
        //注册事件到卡片
        self.regEventToCard = true;
    },
    //执行滚动
    switchOver: function(e){
		e.stopPropagation();
		var self = this,
		    type = AI(e.currentTarget).attr('data-action');
		
		self.container.webkitAnimationEnd(AI.proxy(self.onAnimationEnd, self));
		
		if(self.cfg.preventDefault){
			 e.preventDefault();
		}

		if(self.cfg.start){
			self.startScroll(type);
		}else{
            switch (type) {
                case 'next':
                    self.next();
                    break;
                case 'prev':
                    self.prev();
                    break;
            }
		}   
    },
	startScroll : function (type){
		var self = this,
		    id = self.id;

		self.cfg.start.call(id,self.cards[id]);
		
		switch (type) {
            case 'next':
                self.next();
                break;
            case 'prev':
                self.prev();
                break;
        }
	},
    next: function(){
		var self = this;
		
        if (self.id >= 0 && self.id < (self.cards.length - 1)) {
            self.id++;
        }

		if(AI.UA.system === 'android'){
			self.showCard();
		}else{
			self.container.unbind().webkitAnimationEnd(AI.proxy(self.onAnimationEnd, self));
			AI(self.cards[self.id]).removeClass('hide').addClass('current');
			self.container.addClass('out');
		}
		
        return false;	
    },
    prev: function(){
		var self = this;
			
        if (self.id > 0 && self.id <= self.cards.length) {
            self.id--;
        }

		if(AI.UA.system === 'android'){
			self.showCard();
		}else{
			self.container.unbind().webkitAnimationEnd(AI.proxy(self.onAnimationEnd, self));
			AI(self.cards[self.id]).removeClass('hide').addClass('current');
			self.container.addClass('in');
		}
		
        return false;
    },
    //卸载事件
    unbind: function(){
		var self = this;
		
        for (var k = 0; k < self.triggers.length; k++) {
            AI(self.triggers[k]).unbind('click');
            if (!AI(self.triggers[k])) {
                break;
            }
        }

		if(self.container.get(0)){
			self.container.unbind('webkitAnimationEnd');
		}
		
        //卡片没有注册事件
        self.regEventToCard = false;
    },
    //获取卡片组
    getCards: function(){
		if(!this.container.get(0)){return};
		
		var self = this,
            cards = self.container.find('[role=card]'), i = 0,
			winW = document.documentElement.clientWidth;
			
        for (; i < cards.length; i++) {
            if (cards[i]) {
                self.cards.push(cards[i]);
            }
        }
		
        //最小的滚动值
        self.min = 0;
		
        //最大的滚动值 
        self.max = winW * (self.cards.length - 1);
    },
    onAnimationEnd: function(e){
		if(AI.UA.system === 'android'){return;}
		
        e.preventDefault();
        e.stopPropagation();

		var self = this,
		    id = self.id,
			cfg = self.cfg;
		
		self.container.unbind('webkitAnimationEnd');
		var cards=self.container.find('[role=card]');
		for(var i=0,l=cards.length;i<l;i++){
			var target = AI(cards[i]);
			if(typeof id=='string'){
				if(cards[i].id!=id){
					target.addClass('hide').removeClass('current');
				}
			}else if(i !== id && !target.hasClass('hide')){
				target.addClass('hide').removeClass('current');
			}
		}
		
		self.container.removeClass('out');
		self.container.removeClass('in');
		
		if(typeof id=='string'){
				card=AI('#'+id);
			}else{
				card=AI(self.cards[id]);
			}
        //如果用户提供了回调函数
        if (cfg.callback && card) {
            if (cfg.context) {
                cfg.callback.call(cfg.context, id, card);
            }
            else {
                cfg.callback.call(cfg.callback, id, card);
            }
        }else {
            return false;
        }
    },
	/**
	 * 获取当前卡片的ID
	 * @return int 返回当前的ID
	 */
	getID : function (){
		return this.id;
	},
	/**
	 * 获取当前的卡片
	 * @return DOM 返回当前的卡片元素
	 */
	getCurrentCard : function (){
	    return typeof this.id=='string'?'#'+this.id:(this.container.find('[role=card]'))[this.id];
	},
	/**
	 * 滚动卡片到指定的位置 
	 * @param (Int|String) pos 一个整数|dom id
	 */
	scrollToPos : function (pos){
		if(pos === 'undefined'){return;}
		
		var self = this,
		    cfg = self.cfg;
			if(typeof pos=='string'){
				id = pos;
				self.id=id;
				card=AI('#'+id);
			}else{
				id = self.id;
				card=AI(self.cards[id]);
			}
			
		if(AI.UA.system === 'android'){
			self.hideOtherCards();
			
			AI(self.getCurrentCard()).removeClass('hide');
			
			//如果用户提供了回调函数
	        if (cfg.callback) {
	            if (cfg.context) {
	                cfg.callback.call(cfg.context, id, card);
	            }
	            else {
	                cfg.callback.call(cfg.callback, id, card);
	            }
	        }
			
			return ;
		}

		if(pos === 0){self.prev();return;}
		
		card.removeClass('hide').addClass('current');
		self.container.addClass('out');
		self.container.unbind('webkitAnimationEnd');	
		self.container.webkitAnimationEnd(AI.proxy(self.onAnimationEnd, self));
	}
};
/**
 * 设备旋转时，将执行一系列的函数
 */
AI.orientChange = 'onorientationchange' in window ? 'orientationchange' : 'resize';
//检测设备方向
AI.detectOrien = {
    getOrien: function(){
        return window.orientation;
    },
    regEventToWindow: function(){
        //if (apm.UA.iphone || apm.UA.android || apm.UA.ipad) {
		
			AI(window)[AI.orientChange](AI.proxy(function (e){
				this.onOrienChange();
				this.exexQueue();
				e.preventDefault();
				e.stopPropagation();
				return false;
			},this));
        //}
    },
    onOrienChange: function(){
        switch (Math.abs(this.getOrien())) {
            case 0:
                this.portrait();
                break;
            case 90:
                this.landscape();
                break;
            case 180:
                this.landscape();
                break;
        }
    },
	fnArr : [],
    portrait: function(){
        AI('body').attr('orientation', 'portrait');
    },
    landscape: function(){
        AI('body').attr('orientation', 'landscape');
    },
	/**
	 * 向fnArr函数组中添加函数
	 * @param (Object) 可添加N个函数
	 * @example fn1,fn2,fn3,function (){fn},.....
	 */
    add: function(){
        var fns = arguments;
        for (var i = 0, l = fns.length; i < l; i++) {
            if (fns[i].constructor == Function) {
                AI.detectOrien.fnArr.push(fns[i]);
            }
        }
    },
	/**
	 * 额外函数组队列，在设备旋转过后将按钮函数的添加顺序依次执行
	 */
    exexQueue: function(){
        if (!this.fnArr) {
            return;
        }
        for (var i = 0, l = this.fnArr.length; i < l; i++) {
            if (this.fnArr[i].constructor == Function) {
			  //解决android平台下的设备旋转事件延迟执行
              this.fnArr[i]();
            }
        }
    }
};
//修改验证码
AI.checkCode = {};
AI.checkCode.loading = '更新中...';

AI.checkCodeRefresh = function (){
	AI.checkCode.J_changeCheckCode = AI('#J_changeCheckCode');
	AI.checkCode.J_checkCode = AI('#J_checkCode');

	if(!AI.checkCode.J_changeCheckCode.get(0) || !AI.checkCode.J_checkCode.get(0)){return ;}
	
	AI.checkCode.J_changeCheckCode.click(function (e){
		e.preventDefault();		
		
		var url = AI.checkCode.J_checkCode.attr('src'),
		    paras,
			parasEnd,
			newTime;
		
		if(!/\?/gi.test(url)){
			url += '?';
		}
		
		paras = url.split('?');
		
		parasEnd = paras[1].split('&');
		
		for(var i=0,l = parasEnd.length;i<l;i++){
			if(/^time=\d*$/.test(parasEnd[i])){
				newTime = parasEnd[i].replace(/^time=(\d*)$/,'');
				break;
			}
		}
		
		url = url.replace(/(\d)*$/,'');
		url += (newTime === undefined ? "&time="+new Date().getTime() : new Date().getTime());
		
		AI.checkCode.J_checkCode.attr('src',url);
		AI('#J-checkCodeInput').focus().select();
	});
};
//temp创建子类
AI.Widget.Switch2 = function (options) {
    this.options = options || {};
    this.node = this.options.node;
    this.ajax = this.options.ajax;
    this.caption = this.options.caption;
    this.init();
};
AI.oop.extension(AI.Widget.Switch2, AI.Widget.Switch);
AI.Widget.Switch2.prototype.init = function () {
    var self = this;
    self.statusText = '';
    self.loadingTxt = '正在提交...';
    self.reSubmitTxt = '确定';
    self.failureTxt = '提交失败';
    self.passwordEmpty = '密码不能为空。';
};
AI.Widget.Switch2.prototype.bindUI = function () {
    var self = this;
    self.node.click(AI.proxy(self.touchstart, self));
};
AI.Widget.Switch2.prototype.touchstart = function (e) {
    e.originalEvent.preventDefault();
    e.stopPropagation();
    var self = this;
    self.showDialog();
};
AI.Widget.Switch2.prototype.submit = function (e) {
    e.preventDefault();
    var self = this,
        password = AI('#J-password').val(),
        type = self.type,
        ajax = self.ajax
        externalData = self.ajax.data;
    //验证
    if (!password) {
        var errNode = AI('#J-dialog').find('.err');
        errNode.html(self.passwordEmpty);
        return;
    }
    var data = externalData;
    self.io = new AI.ajax(ajax.url, {
        data: data + '&payPassword=' + password,
        type: ajax.method || 'POST',
        on: {
            start: self.start,
            success: self.success,
            failure: self.failure
        },
        context: self,
        dataType: 'json'
    });
    self.io.send();
};
AI.Widget.Switch2.prototype.success = function (data) {
    try {
        var self = this;
        if (data.resultStatus == '100') {
            //如果是安全无密码支付类型
            if (data.NOPWD_URL) {
                document.location.href = data.NOPWD_URL;
                return;
            }
            //清除错误信息
            AI('#J-dialog').find('.err').empty();
            //修改submit文案
            AI('#J-Dialog-OK').val('确定');
            //关闭dialog
            self.removeDialog();
            self.options.callback && self.options.callback.success && self.options.callback.success();
        } else if (data.resultStatus == '101') {
            self.failure(data);
            return;
        } else if (data.resultStatus == '102') {
            //清除错误信息
            AI('#J-dialog').find('.err').empty();
            //关闭dialog
            self.removeDialog();
            self.options.callback && self.options.callback.failure && self.options.callback.failure(data.memo || '');
            return;
        }
    } catch (e) {
        //页面可能过期，如果过期服务返回html源代码，这时将刷新页面
        document.location.reload();
    }
};
AI.Widget.Switch2.prototype.cancel = function (e) {
    e.preventDefault();
    var self = this;
    self.removeDialog();

	if('cancelCallback' in self.options){
	  self.options.cancelCallback();
	}
};
(function () {
    //HTML模板
    var templates = function (type, o) {
        //o.mask == undefined ? o.mask = true : null;
        switch (type) {
        case 'global-loading':
            return ['<div class="popup-loading"></div>'];
            break;
        case 'global-loading-failure':
            return ['<div class="popup-msg">', '<div class="t-18">加载失败！</div>', '</div>'];
            break;
        case 'popup':
            return ['<div class="popup hide" ' + 'id="' + (o.id ? o.id : '') + '">', o.mask ? '<div class="popup-mask"></div>' : '', '<div class="popup-content">', '</div>', '</div>'];
            break;
        }
    };
    var HTMLTemplate = function (type, o) {
        var o = o || {};
        var html = templates(type, o).join('');
        if (o) {
            for (var i in o) {
                //替换${var}变量
                var re = new RegExp('\\$\\{' + i + '\\}', 'g');
                html = html.replace(re, o[i]);
            }
            return html;
        }
        return html;
    };
    AI.Widget.HTMLTemplate = HTMLTemplate;
})();
(function () {
    //浮层组件
    var Popup = function () {
        this.init.apply(this, arguments);
    };
    Popup.prototype = {
        init: function (config) {
            var instance = this;
            this.cfg = {};
            AI.extend(this.cfg, config);
            instance.renderFlag = false;
            AI(window).resize(function () {
                if (instance.renderFlag) {
                    instance.position();
                }
            });
        },
        renderDom: function () {
            var instance = this,
                cfg = instance.cfg,
                html = [];
            var html = AI.Widget.HTMLTemplate('popup', {
                id: cfg.target.replace(/^#/, '')
            });
            AI(document.body).append(html);
            if (AI(cfg.content).length) {
                AI(cfg.target + ' .popup-content').append(AI(cfg.content));
                AI(cfg.content).show();
            }
        },
        position: function () {
            //重置浮层的最小高度
            AI(this.cfg.target).css('min-height', AI(document).height() + 'px');
            var content = AI(this.cfg.target + ' .popup-content');
            //apple设备的地址栏高度是算在文档的高度里面的，通用高度60
            var locationHeight = /ipod|iphone/.test(AI.UA.system) && AI(document).scrollTop() > 0 ? 60 : 0;
            content.css('top', (AI(document).scrollTop() + (AI(window).height() + locationHeight - content.height()) / 2) + 'px');
        },
        show: function () {
            if (!this.renderFlag && AI(this.cfg.target).length == 0) {
                this.renderFlag = true;
                this.renderDom();
            }
            AI(this.cfg.target).show();
            this.position();
        },
        hide: function () {
            AI(this.cfg.target).hide();
        },
        autoHide: function (second) {
            var instance = this;
            setTimeout(function () {
                instance.hide();
            }, second || 500);
        }
    };
    Popup.hide = function () {
        //隐藏页面上已有的浮层
        AI('.popup').hide();
    };
    AI.Widget.Popup = Popup;
})();