/**
 * 支付宝收银台组件
 * 该文件主要用于收银台
 */

//收银台全局对象
var Alipay = {},
    APM = {};

/**
 * 模拟Iphone本地应用场景滚动的web卡片滚动组件
 * @constructor Alipay.ScrollCards
 * @namespace Alipay.ScarollCards
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
Alipay.ScrollCards = function(options){
	var self = this,
	    config = {
			isPreventDefault: true,
			controlForms: true,
			container: null
		};
		
	self.cfg = AI.extend({},config,options);
	
	this.init();
}

Alipay.ScrollCards.prototype = {
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
		
		if(AI.UA.system !== 'android' && AI.UA.system !== 'windows'){self.adaptediOS();}
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
		
		if(self.container.get(0) && (AI.UA.system === 'android' || AI.UA.system === 'windows')){
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
		
		//this.container.css('width',winW*l);
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
		if(AI.UA.system !== 'android' && AI.UA.system !== 'windows'){return ;}

		var self = this,
		    card = AI(self.cards[self.id]);
		
		self.hideOtherCards();

		if(card.hasClass('hide')){
			card.removeClass('hide');
		}
		
		//如果用户提供了回调函数
        if (self.cfg.callback && self.cards[self.id] && (AI.UA.system === 'android' || AI.UA.system === 'windows')) {
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
		self.triggers=[];
        for (var i = 0; i < self.cards.length; i++) {
			var triggers=AI(self.cards[i]).find('[data-action=prev],[data-action=next]');
			if(triggers.length){
				self.triggers.push(triggers);
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

		if(AI.UA.system === 'android' || AI.UA.system === 'windows'){
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

		if(AI.UA.system === 'android' || AI.UA.system === 'windows'){
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
		if(AI.UA.system === 'android' || AI.UA.system === 'windows'){return;}
		
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
			
		if(AI.UA.system === 'android' || AI.UA.system === 'windows'){
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
 * Use Canvas draw loading animation
 */
function DrawLoading(options){
    //默认配置参数
    var canvas = document.querySelector('#loading')
    var config = {
        canvas: canvas,
        background: '#CACACA',
        forecolor: {
            r: 51,
            g: 51,
            b: 51
        },
        lineW: 3,
        forecolorAlpha: 0
    };
    
    //用户提供的配置参数覆盖默认的参数
    this.options = AI.extend({}, config, options);
    
    //一些初始化的常量
    this.canvas = this.options.canvas;
    try {
        this.cw = this.canvas.width;
        this.ch = this.canvas.height;
        this.context = this.canvas.getContext('2d');
        this.radius = this.cw / 2;
    } 
    catch (e) {
        throw ('Canvas:' + this.canvas + ' not find!');
    }
    
    this.loop = null;//循环时间指针
    this.endAngle = 0;//结束的角度
    this.startAngle = 0;//开始的角度
}

DrawLoading.prototype = {
    drawBgCircle: function(){
        var self = this, options = self.options, context = self.context;
        
        context.save();
        context.beginPath();
        context.arc(self.cw / 2, self.ch / 2, self.radius - 4, 0, Math.PI * 2, false);
        context.lineWidth = options.lineW;
        context.strokeStyle = options.background;
        context.stroke();
    },
    drawBall: function(){
        var self = this, options = self.options, context = self.context;
        
        if (self.endAngle >= 2) {
            context.clearRect(0, 0, self.cw, self.ch);
            self.drawBgCircle();
            self.endAngle = 0;
            self.startAngle = 0;
            options.forecolorAlpha = 0;
        }
        
		self.endAngle=self.startAngle+0.15;
        options.forecolorAlpha += 0.1;
        context.restore();
        context.save();
        context.beginPath();
        context.arc(self.cw / 2, self.ch / 2, self.radius - 4, Math.PI * self.startAngle, Math.PI * self.endAngle, false);
        //context.shadowColor = '#666';
        //context.shadowBlur = 2;
        context.lineJoin = 'round';
        //context.shadowOffsetX = '1';
        //context.shadowOffsetY = '1';
        context.lineWidth = options.lineW;
        context.strokeStyle = 'rgba(' + options.forecolor.r + ',' + options.forecolor.g + ',' + options.forecolor.b + ',' + options.forecolorAlpha + ')';
        context.stroke();
        context.restore();
        self.startAngle += 0.15;
		
    },
    draw: function(){
        var self = this;
        
        self.drawBgCircle();
        self.loop = setInterval(function(){
            self.drawBall();
        }, 50);
    }
};

//绘制向下的箭头
function drawArrow(canvas,lineW,color){
			var canvas = canvas,
			    context = canvas.getContext('2d'),
				color = color || '#626972',
				lineW = lineW || 2;
			
			context.beginPath();
			context.moveTo(0,0);
			context.lineTo(6,6);
			context.lineWidth = lineW;
			context.strokeStyle = color;
			context.stroke();
			
			context.beginPath();
			context.moveTo(6,6);
			context.lineTo(12,0);
			context.lineWidth = lineW;
			context.strokeStyle = color;
			context.stroke();
		}

var mmEmptyErrorMsg = '密码不能为空。',
    mmFormatErrorMsg = '密码须在6-20位之间。',
	mobilePhoneEmptyErrorMsg = '手机号码不能为空。',
	mobilePhoneFormatErrorMsg = '手机号码格式错误。',
	rechargeableCardEmptyErrorMsg = '充值卡号不能为空。',
	rechargeableCardFormatErrorMsg = '充值卡号格式错误。',
	bankEmptyErrorMsg = '卡号不能为空。',
	bankFormatErrorMsg = '卡号格式错误。',
	nameEmptyErrorMsg = '姓名不能为空。',
	nameFormatErrorMsg = '姓名格式错误。',
	idCardEmptyErrorMsg = '证件号码不能为空。',
	idCardFormatErrorMsg = '证件号码格式错误。',
	monthEmptyErrorMsg = '月份不能为空。',
	monthFormatErrorMsg = '月份格式错误。',
	yearEmptyErrorMsg = '年份不能为空。',
	yearFormatErrorMsg = '年份格式错误。',
	cvvEmptyErrorMsg = 'CVV2不能为空。',
	cvvFormatErrorMsg = 'CVV2格式错误。',
	blCardEmptyErrorMsg = '宝令卡不能为空。',
	blCardFormatErrorMsg = '宝令卡格式错误。',
	availDateEmptyErrorMsg = '信用卡有效期不能为空。',
	availDateFormatErrorMsg = '信用卡有效期格式错误。';
			
//Throw error
function ThrowERROR(node){
	this.node = node;
}
ThrowERROR.prototype = {
	show : function (msg){
		var self = this;
		
		self.msg = msg || '';
		
		self.node ? self.node.html(self.msg) : alert(self.msg);
		
		return false;
	},
	empty : function (){
		var self = this;
		
		self.node ? self.node.empty() : '';
		
		return true;
	}
};

//password
function Validpassword(config){
	var self = this;
	
	self.config = config || {};
	self.throwMsg = new ThrowERROR(self.config.errorMsgNode);
}
Validpassword.prototype = {
	validEmpty : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsgNode = config.errorMsgNode,
			result = true;

		if(!node.val() || node.val().length < 1){
			return self.throwMsg.show(mmEmptyErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	validFormat : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			result = true;

		if((node.val() && node.val().length < 6) || node.val() && node.val().length > 20){
			return self.throwMsg.show(mmFormatErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	valid : function (){
		return this.validEmpty() && this.validFormat();
	}
};

//select
function Validselect(config){
	this.config = config;
	this.throwMsg = new ThrowERROR(this.config.errorMsgNode);
}
Validselect.prototype = {
	valid : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsg = config.errorMsg || '',
			result = true,
			value;
		
		value = node.val();

		if(!value || value === 0 || value === '0' || value === undefined || value === null){
		    return self.throwMsg.show(errorMsg);	
		}
		
		return self.throwMsg.empty();
	}
};

//mobilePhone
function ValidmobilePhone(config){
	var self = this;
	
	self.config = config || {};
	self.throwMsg = new ThrowERROR(self.config.errorMsgNode);
}
ValidmobilePhone.prototype = {
	validEmpty : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsgNode = config.errorMsgNode,
			result = true;

		if(!node.val() || node.val().length < 1){
			return self.throwMsg.show(mobilePhoneEmptyErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	validFormat : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			result = true,
			reg = /^(14|13|15|18)\d{9,9}$/;

		if((node.val() && node.val().length < 11) || !reg.test(node.val())){
			return self.throwMsg.show(mobilePhoneFormatErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	valid : function (){
		return this.validEmpty() && this.validFormat();
	}
};

//rechargeableCard
function ValidrechargeableCard(config){
	var self = this;
	
	self.config = config || {};
	self.throwMsg = new ThrowERROR(self.config.errorMsgNode);
}
ValidrechargeableCard.prototype = {
	validEmpty : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsgNode = config.errorMsgNode,
			result = true;

		if(!node.val() || node.val().length < 1){
			return self.throwMsg.show(rechargeableCardEmptyErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	validFormat : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			result = true;

		if(node.val() && node.val().length < 15){
			return self.throwMsg.show(rechargeableCardFormatErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	valid : function (){
		return this.validEmpty() && this.validFormat();
	}
};

//bank
function Validbank(config){
	var self = this;
	
	self.config = config || {};
	self.throwMsg = new ThrowERROR(self.config.errorMsgNode);
}
Validbank.prototype = {
	validEmpty : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsgNode = config.errorMsgNode,
			result = true;

		if(!node.val() || node.val().length < 1){
			return self.throwMsg.show(bankEmptyErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	validFormat : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			result = true,
			reg = /^\d{16,19}$/;

		if((node.val() && node.val().length < 16) || !reg.test(node.val())){
			return self.throwMsg.show(bankFormatErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	valid : function (){
	    var self = this;
		var pass=true;
	    if(pass&&self.config.validEmpty){
			if(!self.validEmpty()){
				pass=false;
			}
		}
		if(pass&&self.config.validFormat){
			if(!self.validFormat()){
				pass=false;
			}
		}
		return pass;
	}
};

//name
function Validname(config){
	var self = this;
	
	self.config = config || {};
	self.throwMsg = new ThrowERROR(self.config.errorMsgNode);
}
Validname.prototype = {
	validEmpty : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsgNode = config.errorMsgNode,
			result = true;

		if(!node.val() || node.val().length < 1){
			return self.throwMsg.show(nameEmptyErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	validFormat : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			result = true;

		if(node.val() && node.val().length < 2){
			return self.throwMsg.show(nameFormatErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	valid : function (){
		return this.validEmpty() && this.validFormat();
	}
};

//availDate
function ValidavailDate(config){
	var self = this;
	
	self.config = config || {};
	self.throwMsg = new ThrowERROR(self.config.errorMsgNode);
}
ValidavailDate.prototype = {
	validEmpty : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsgNode = config.errorMsgNode,
			result = true;

		if(!node.val() || node.val().length < 1){
			return self.throwMsg.show(availDateEmptyErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	validFormat : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			result = true;

		if(node.val() && node.val().length > 0 && !/^(0[1-9]|1[0-2])[1-9][0-9]$/.test(node.val())){
			return self.throwMsg.show(availDateFormatErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	valid : function (){
		return this.validEmpty() && this.validFormat();
	}
};

//idCard
function ValididCard(config){
	var self = this;
	
	self.config = config || {};
	self.throwMsg = new ThrowERROR(self.config.errorMsgNode);
}
ValididCard.prototype = {
	validEmpty : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsgNode = config.errorMsgNode,
			result = true;

		if(!node.val() || node.val().length < 1){
			return self.throwMsg.show(idCardEmptyErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	validFormat : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			result = true,
			reg = /^\d{15}$|^\d{17}[0-9a-zA-Z]$/;

		if((node.val() && node.val().length < 2) || !reg.test(node.val())){
			return self.throwMsg.show(idCardFormatErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	valid : function (){
	    var self = this;
		
	    if(self.config.validEmpty && !self.config.validFormat){
		  return self.validEmpty();
		}
		
		if(!self.config.validEmpty && self.config.validFormat){
		  return self.validFormat();
		}
		
		if(self.config.validEmpty && self.config.validFormat){
		  return this.validEmpty() && this.validFormat();
		}
	}
};

//month
function Validmonth(config){
	var self = this;
	
	self.config = config || {};
	self.throwMsg = new ThrowERROR(self.config.errorMsgNode);
}
Validmonth.prototype = {
	validEmpty : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsgNode = config.errorMsgNode,
			result = true;

		if(!node.val() || node.val().length < 1){
			return self.throwMsg.show(monthEmptyErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	validFormat : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			result = true,
			reg = /^(1[012]|0[1-9])$/;

		if((node.val() && node.val().length > 3) || !reg.test(node.val())){
			return self.throwMsg.show(monthFormatErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	valid : function (){
		return this.validEmpty() && this.validFormat();
	}
};

//year
function Validyear(config){
	var self = this;
	
	self.config = config || {};
	self.throwMsg = new ThrowERROR(self.config.errorMsgNode);
}
Validyear.prototype = {
	validEmpty : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsgNode = config.errorMsgNode,
			result = true;

		if(!node.val() || node.val().length < 1){
			return self.throwMsg.show(yearEmptyErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	validFormat : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			result = true,
			reg = /^[0|1|2](\d{1,1})$/;

		if((node.val() && node.val().length !== 2) || !reg.test(node.val())){
			return self.throwMsg.show(yearFormatErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	valid : function (){
		return this.validEmpty() && this.validFormat();
	}
};

//cvv
function Validcvv(config){
	var self = this;
	
	self.config = config || {};
	self.throwMsg = new ThrowERROR(self.config.errorMsgNode);
}
Validcvv.prototype = {
	validEmpty : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsgNode = config.errorMsgNode,
			result = true;

		if(!node.val() || node.val().length < 1){
			return self.throwMsg.show(cvvEmptyErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	validFormat : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			result = true,
			reg = /\d{3,3}/;

		if((node.val() && node.val().length !== 3) || !reg.test(node.val())){
			return self.throwMsg.show(cvvFormatErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	valid : function (){
		return this.validEmpty() && this.validFormat();
	}
};

//blCard
function ValidblCard(config){
	var self = this;
	
	self.config = config || {};
	self.throwMsg = new ThrowERROR(self.config.errorMsgNode);
}
ValidblCard.prototype = {
	validEmpty : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			errorMsgNode = config.errorMsgNode,
			result = true;

		if(!node.val() || node.val().length < 1){
			return self.throwMsg.show(blCardEmptyErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	validFormat : function (){
		var self = this,
		    config = self.config,
			node = config.node,
			result = true,
			reg = /\d{6,6}/;

		if((node.val() && node.val().length !== 6) || !reg.test(node.val())){
			return self.throwMsg.show(blCardFormatErrorMsg);
		}else if(self.throwMsg){
			return self.throwMsg.empty();
		}
		
		return result;
	},
	valid : function (){
		return this.validEmpty() && this.validFormat();
	}
};

/**
 * Alipay validate Class
 * @param {Object} data
 * @example {
 *   password : {
 *     node : node,
 *     validEmpty : true,
 *     validFormat : true,
 *     errorMsgNode : node
 *   },
 *   select : {
 *     node : node,
 *     errorMsg : '',
 *     errorMsgNode : node
 *   }
 *   ......
 * }
 */
Alipay.validate = function (data){
	this.data = data;
}
Alipay.validate.prototype = {
	parseData : function (){
		var self = this;
		
		self.validates = [];
			
		for(var i in self.data){
			var fnName = eval('Valid'+i+'');

			self.validates.push(new fnName(self.data[i]));
		}
	},
	valid : function (){
		var self = this,
		    result = true;
		
		self.parseData();

		for(var valids = self.validates,i = 0;i<valids.length;i++){
			//如果当前指定的元素不存在，我们继续验证下一个
			if(!valids[i].config.node.get(0) || !valids[i].config.node){continue;}
			
			if(!valids[i].valid()){
				result = false;
			}
		}
		
		return result;
	}
};

/**
 * 设备旋转时，将执行一系列的函数
 */
Alipay.orientChange = 'onorientationchange' in window ? 'orientationchange' : 'resize';
//检测设备方向
Alipay.detectOrien = {
    getOrien: function(){
        return window.orientation;
    },
    regEventToWindow: function(){
        //if (apm.UA.iphone || apm.UA.android || apm.UA.ipad) {
		
			AI(window)[Alipay.orientChange](AI.proxy(function (e){
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
                Alipay.detectOrien.fnArr.push(fns[i]);
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


//解决android平台下placeholder BUG
if(AI.UA.system === 'android'){
	fixAndroidPlaceHolderbug = function (){
		var inputs = AI('input'),
		    arr = [];
		for(var i = 0,l = inputs.length;i<l;i++){
			arr.push(inputs[i]);
		}
		
		inputs = arr;
		
		inputs.forEach(function (elem){
			var elem = AI(elem),
			    oldHolder;
			
			if(elem.get(0).type === 'text' || elem.get(0).type === 'password' || elem.get(0).type === 'tel' || elem.get(0).type === 'phone' || elem.get(0).type === 'url'){
				elem.focus(function (){
					var self = AI(this);
					
					oldHolder = oldHolder || self.attr('placeholder');

					if(!self.val() || self.val() === oldHolder){
						self.attr({
							placeholder : '',
							value : ''
						});
					}else{
						self.select();
					}
				});
				
				elem.blur(function (){
					AI(this).attr({
						placeholder : oldHolder
					});
				});
			}
		});
	}
}

//解决平台下不支持placeholder的情况
//模拟placeHolder
var PlaceHolder = function(input){
	this.isSupportPlaceHolder = this.isPlaceHolder();
	if(!this.isSupportPlaceHolder){
		this.input = input;
		this.input.wrap('<div class="inpuWrap"></div>');
		if(!this.input){return;}
		this.label = AI("<label></label>");
		this.holder = AI(this.input).attr("placeholder");		
		this.label.text(this.holder);
		this.label.className = "placeholder";
		if(AI(this.input).val() != ""){
			this.label.css("display","none");
		}
		this.init();
	}
}
PlaceHolder.prototype = {
	init:function(){
		var label = this.label,
			input = this.input,
			parent = input.parent();
			
		parent.css("position","relative");
		var xy = input.position();
		label.css({
			'position':'absolute',
			'left':xy.left,
			'top':xy.top,
			'width':"100%",
			'height':"46px",
			'padding-left':'8px',
			'color':'#999',
			'line-height':"46px"
		});
		parent.append(label);
			
		label.click(function(){
			label.css("display","none");
			input.focus();
		});
		input.focus(function(){
			label.css("display","none");
		})
		input.blur(function(){
			if(input.val() == ""){
				label.css("display","");
			}
		})
	},
	isPlaceHolder:function(){
		var input = document.createElement("input");
		return "placeholder" in input;
	},
	getBoxView:function(node){
		var n = node.clone();
		AI('body').append(n).css("visibility","hidden");
		var w = n.outerWidth(),
			h =n.outerHeight();
		return {width:w,height:h}
	}
}
AI(function(){
	var inputs = AI('input[type=text],input[type=password],input[type=tel],input[type=phone],input[type=url]');
	for(var i = 0,l = inputs.length;i<l;i++){
		new PlaceHolder(inputs.eq(i));
	}
})
