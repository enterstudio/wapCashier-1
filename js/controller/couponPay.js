/**
 * couponPay.js
 * 红包支付模型couponPay.js
 */
define(function(require, exports, module) {
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone'),
        Handlebars = require('handlebars');  
    var ScrollCards = require('http://localhost:8000/wapCashier/js/ui/scrollCards');
    var Pay = require('http://localhost:8000/wapCashier/js/model/pay');
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    var CouponPayModel = BaseModel.extend({
        options:{
        	events:{
        		use:function(params){
                    var that = this;
                    params = params || {};
                    var plan = that.options.pay.getPlan();

                    //to be review and develop
                    var payAmount = 0;
                    var coupons = $('#hbContainer input[name=coupon]');//红包集合
                    var coupon_list = '';
                    var coupon_amount = 0;
                    $.each(coupons,function(index,coupon){
                        if (coupon.checked) {
                            coupon_list += coupon.value + ';';
                            coupon_amount += parseFloat(coupon.getAttribute('data-hb')) || 0;
                        }
                    });
                    payAmount = coupon_amount;
                    //



                    //console.log(that.data_model.cardId);
                    
                    if(params.behavior === 'manual'){//判断是否人工操作,如果是,那么滚到到红包card
                        that.scrollCards.scrollToPos(that.data_model.cardId);  
                    }
                    //scrollCards.scrollToPos(AI(this).attr('data-cardId'));

                    payAmount = that.options.pay.fixed(payAmount);
                    plan.couponPay = payAmount;
                    that.options.pay.setPlan(plan);

                    //页面显示
                    var showTxtUse = Handlebars.compile(that.data_model.showTxt.use); 
                    showTxtUse = showTxtUse({payAmount:payAmount});
                    $(that.domContext).closest('label').find('span').text(showTxtUse);
                },
        		unuse:function(){
                    var that = this;
                    var plan = that.options.pay.getPlan();                    
                    plan = _.omit(plan,'couponPay');
                    that.options.pay.setPlan(plan);           
                    $(that.domContext).closest('label').find('span').text(that.data_model.showTxt.unuse);
        		},
                'check':function(params){
                    var that = this;
                    params = params || {};
                    $(that.domContext).attr({disabled:false});

                    that.fireEvent('unuse');
                    if($(that.domContext).attr('checked')){
                        that.fireEvent('use',params);
                    }
                    params.mode == 'active' && setTimeout(function(){that.options.pay.fireEvent('checkPlan','couponPay');},0);
                },
                checkCouponMerge:function(context){//待验证
                    var that = this;
                    //检测红包是否可以合并支付
                    var _val = context.attr('data-isMerge'),
                        _ck = context.attr('checked'),
                        _ck_flag = false;

                    $.each(that.coupons,function(index,coupon){
                        if (_ck) {
                            if ($(coupon).attr('data-isMerge') != _val || _val === 'false') {
                                //不是同一类型的红包禁用
                                $(coupon).attr('checked', false);
                                $(coupon).attr('disabled', true);
                            }
                        } else {
                            if ($(coupon).attr('data-isMerge') == _val && $(coupon).attr('checked')) {
                                //统计同一类型的红包是否还有选中的
                                _ck_flag = true;
                            }
                        }
                    });
                    if (!_ck) {
                        $.each(that.coupons,function(index,coupon){
                            if (!_ck_flag && $(coupon).attr('data-isMerge') != _val || _val === 'false') {
                                //同一类型的红包没有一个选中时，启用其它类型的红包
                                $(coupon).attr('disabled', false);
                            }
                        });                        
                    }
                    if (_ck) {
                        context.attr('disabled', false);
                        context.attr('checked', true);
                    }
                }        
        	}
        },
        initialize:function(domContext,options){
        	var that = this;
            CouponPayModel.superclass.initialize.apply(that,[options]);
            that.domContext = domContext;
            that.data_model = _.clone(that.options.data_model);
            !that.options.pay && console.log('config error');
            //
            that.scrollCards = new ScrollCards({
                container: $('.scrollCards-container'),
                cardsNode: $('.scrollCards'),
                preventDefault: false,
                callback: function (id, node) {
                    window.scrollTo(0,1);
                }
            });
            //
            $('#coupon-ok').live('click',function(){
                that.fireEvent('check',{mode:'active'});
                (function(){//scrollCard0();
                    that.scrollCards.id = 0;
                    that.scrollCards.scrollToPos(0);
                })();
            });
            $('#coupon-cancel').live('click',function(){
                //取消
                //
                //
                (function(){//scrollCard0();
                    that.scrollCards.id = 0;
                    that.scrollCards.scrollToPos(0);
                })();
                /**
                hb_cb.attr('checked', false);
                _init_hb();
                //
                scrollCard0();
                */
            });



            //
            $(that.domContext).bind('checkuse',function(e,params){
                !params.behavior && (function(){params.behavior = 'manual'})();
                that.fireEvent('check',params);//主动模式
            }).bind('click',function(){
                $(that.domContext).trigger('checkuse',[{mode:'active'}]);
            }).trigger('checkuse',[{mode:'active','behavior':'load'}]);
        }
    });
    module.exports = CouponPayModel;
});
