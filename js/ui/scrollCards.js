/* scrollCards.js */
define(function(require, exports, module) {
    var Class = require('class');
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone');
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    var ScrollCards = BaseModel.extend({
        options:{
            isPreventDefault: true,
            controlForms: true,
            container: null
        },
        prev:function(){
            var that = this;
            if(that.id > 0 && that.id <= that.cards.length){
                that.id--;
            }
            that.container.unbind().webkitAnimationEnd($.proxy(that.onAnimationEnd,that));
            $(that.cards[that.id]).removeClass('hide').addClass('current');
            that.container.addClass('in');
            return false;


            /** to be review
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
            */
        },
        scrollToPos:function(pos){
            var that = this;
            if(pos === 'undefined'){return;}
            if(typeof pos == 'string'){
                id = pos;
                that.id = id;
                card = $('#'+id);
            }else{
                id = that.id;
                card = $(that.cards[id]);
            }
            //console.log(card);

            if(pos === 0){
                that.prev();
                return;
            }

            card.removeClass('hide').addClass('current');
            that.container.addClass('out');
            //that.container.unbind('webkitAnimationEnd');    
            //that.container.webkitAnimationEnd($.proxy(that.onAnimationEnd, that));


            /**
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
            */
        },
        getCards:function(){//获取卡片组
            var that = this;
            if(!that.container.get(0)){return};
            var cards = that.container.find('[role=card]'), i = 0,
                winW = document.documentElement.clientWidth;
            for (; i < cards.length; i++) {
                if (cards[i]) {
                    that.cards.push(cards[i]);
                }
            }
            //最小的滚动值
            that.min = 0;
            //最大的滚动值 
            that.max = winW * (that.cards.length - 1);
        },
        adjust:function(){//实例化后调整卡片容器样式
            var that = this;
            //当设备旋转时清除卡片组，因为该方法可以会在window.onresize触发时调用
            that.cards.length = 0;
             //获取卡片组
            that.getCards();


            /**
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
            */
        },
        adaptediOS:function(){
            var that = this;
            
            that.container.css({
                'width': 'auto',
                'display': '-webkit-box',
                'overflow': 'visible'
            });
            that.container.find('[role=card]').css('float','none');
            that.container.find('[role=card]:first-child').addClass('current');
        },
        initialize:function(options){
            var that = this;
            ScrollCards.superclass.initialize.apply(that,[options]);

            that.container = that.options.cardsNode;
            console.log(that.container);

            that.cards = [];
            that.triggers = [];
            that.id = 0;

            that.adjust();

            //to be update
            //if(AI.UA.system !== 'android' && AI.UA.system !== 'windows'){self.adaptediOS();}
            that.adaptediOS();//for IOS


            //if(AI.UA.system !== 'android' && AI.UA.system !== 'windows'){self.adaptediOS();}
            /**
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
            */
           


            /**
             * 扩展iOS和Android事件, 这块需要重新设计考虑 位置迁移
             */
            $.ievents = 'touchstart touchend touchmove touchcancel '+ 
                         'gesturestart gestureend gesturechange '+ 
                         'orientationchange '+ 
                         'webkitTransitionStart webkitTransitionEnd webkitAnimationStart webkitAnimationEnd '+ 
                         'storage ';
                         
            $.each($.ievents.split(' '),function (i,eventName){
                $.fn[eventName] = function (data,fn){
                    //当设备旋转时，自动将orientationchange事件与resize事件同步
                    if(eventName === 'orientationchange'){
                        $(window).resize(data,fn);
                    }
                    
                    if(fn == null){
                        fn = data;
                        data = null;
                    }
                    
                    return arguments.length > 0 ? this.bind(eventName,data,fn) : this.trigger(eventName);
                };
                
                if($.attrFn){
                    $.attrFn[eventName] = true;
                }
            });
            //


        }
    });
	module.exports = ScrollCards;
});