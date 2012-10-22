/* loadPayMethod.js */
/**
 * 优惠渠道对象 处理页面相关的优惠渠道
 * @param  {[type]} require [description]
 * @param  {[type]} exports [description]
 * @param  {[type]} module  [description]
 * @return {[type]}         [description]
 */
define(function(require, exports, module) {
    var Class = require('class');
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone');
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    var MoneyModel = require('http://localhost:8000/wapCashier/js/model/money');
    var LoadPayMethodModel = BaseModel.extend({
        renderCard:function(){
            var that = this;
            console.log('here rendCard');
        },
        start:function(){
            var that = this;
            console.log('here start');
        },
        failure:function(){
            var that = this;
            console.log('here failure');
        },
        success:function(){
            var that = this;
            console.log('here success');
        },
        complete:function(){
            var that = this;
            console.log('here complete');
        },
        load:function(e){
            var that = this;
            //卸载事件，防止重复请求
            if (e) {
                that.trigger = $(e.currentTarget);
                that.trigger.unbind();
            }
            //如果已经请求到数据，重新为触发器绑定事件
            if (that.trigger && that.requested) {
                that.trigger.click(that.load);
            }
            if (that.click) {
                that.click = false;
                that.triggerBody && that.triggerBody.get(0) && that.triggerBody.slideUp(300, function () {
                    if (that.trigger) {
                        that.trigger.find('canvas.arrow').get(0).style.webkitTransform = 'rotate(0deg)';
                    }
                });
            } else {
                that.click = true;
                that.triggerBody && that.triggerBody.get(0) && that.triggerBody.slideDown(300, function () {
                    if (that.trigger) {
                        that.trigger.find('canvas.arrow').get(0).style.webkitTransform = 'rotate(-180deg)';
                    }
                });
            }
            if (!that.requested) {
                var AjaxUrl = $('input[name="AjaxUrl"]').val();
                var operationType = that.trigger.attr('role') || 'PAYTYPE',
                    awid = $('input[name="awid"]').val(),
                    userID = $('input[name="userID"]').val(),
                    is_pc_trade = $('input[name="is_pc_trade"]').val(),
                    orderId = $('input[name="orderId"]').val(),
                    fromMainPage = $('input[name="fromMainPage"]').val(),
                    timestamp = new Date().getTime(),
                    data = 'awid=' + awid + '&operationType=' + operationType + '&requestData={"ID":"' + userID + '","isPcTrade":"' + is_pc_trade + '","orderId":"' + orderId + '","fromMainPage":"'+ fromMainPage +'"}&timestamp=' + timestamp + '';
                //解决Android平台下对ajax数据错误缓存问题
                //if (AI.UA.system === 'android') {
                //    AjaxUrl += '&androidTime=' + Math.random() + '';
                //}

                $.ajax(AjaxUrl,{
                    type: 'post',
                    data: data,
                    on: {
                        start: that.start,
                        failure: that.failure,
                        success: that.success,
                        complete: that.complete
                    },
                    timeout: 12000,
                    dataType: 'json'
                });
            }

        },
        buildTriggerBody:function(){
            var that = this;
        },
        isMixPay:function(){
            var that = this;
            var _mount = that.money.getInputMount(),
                _is_mix_pay;
            var total = Math.round((_mount.balance_to_pay + _mount.coupon_amount + _mount.point_amount2) * 100) / 100;
            if ((_mount.balance_to_pay > 0 || _mount.coupon_amount > 0 || _mount.point_amount2 > 0) && total < _mount.pay_amount && _mount.available_amount < _mount.pay_amount && _mount.kj_amount <= 0 && _mount.bank_amount <= 0) {
                _is_mix_pay = true;
            } else {
                _is_mix_pay = false;
            }
            return _is_mix_pay;

        },
        showMixPayMethod:function(){
            var that = this;
            //筛选混合支付
            //这里的is_mix_pay和上面的不一样，上面只会在首推卡通时需要
            var _is_mix_pay = that.isMixPay();
            var recent = $('#J_other_pay_method_body .recent');
            if (recent) {
                var recentPayMethod = recent.attr('data-payMethod');
                //if ((recentPayMethod === 'unionpay' || recentPayMethod === 'creditcard' || recentPayMethod === 'debitcard' || recentPayMethod === 'phonecard') && _is_mix_pay) {
                //new rule 快捷支付可以用于组合支付
                if ((recentPayMethod === 'unionpay' || recentPayMethod === 'phonecard') && _is_mix_pay) {
                    recent.css('display', 'none');
                } else {
                    recent.css('display', '-webkit-box');
                }
            }
            var payMethod = $('#J_other_pay_method_body div[role]');
            if (payMethod) {
                $.each(payMethod, function (i, o) {
                    var role = $(o).attr('role');
                    //if ((role == 'YLK' || role == "YLKbankList" || role == 'XYK' || role == "XYKbankList" || role == 'JJK' || role == "JJKbankList" || role == 'QT' || role == "QTbankList") && _is_mix_pay) {
                    //new rule 快捷支付可以用于组合支付
                    if ((role == 'YLK' || role == "YLKbankList" || role == 'QT' || role == "QTbankList") && _is_mix_pay) {
                        if (!/bankList$/.test(role)) {
                            AI(o).addClass('hide');
                        } else {
                            AI(o).css('display', 'none');
                        }
                    } else {
                        if (!/bankList$/.test(role)) {
                            AI(o).removeClass('hide');
                        } else {
                            if (AI(o).attr('open') == '1') {
                                AI(o).css('display', 'block');
                            }
                        }
                    }
                });
            }
        },
        initialize:function(options){
            var that = this;
            LoadPayMethodModel.superclass.initialize.apply(that,[options]); 
            //===============================Q:bindCard.vm如何进去？？==========================
            //
            //对无支付能力资金渠道前置做处理
            //无支付能力用户可能拥有余额，红包和集分宝
            //我们对资金渠道做url处理，使银行资金渠道可以使用组合支付或者享受到优惠
            //同时对更多渠道中的银行错url处理，使他们可以使用组合支付或者享受到优惠
            $("#J_DataBox").get(0) && $("#J_DataBox").delegate(".payMethod-twocols a","click",function(e){//待续
                 e.stopPropagation();
                 this.href = _buildURL(AI(this).attr('data-url'));
                 //对优惠活动的资金渠道做处理
                 this.href = Discount.buildURL(AI(this)).url;
            });
            //储蓄卡新卡
            $("#card-disablePaymentDebitcard").get(0) && $("#card-disablePaymentDebitcard").delegate(".box-skin a","click",function(e){
                 e.stopPropagation();
                 this.href = _buildURL(AI(this).attr('data-url'));
                 //对优惠活动的资金渠道做处理
                 this.href = Discount.buildURL(AI(this)).url;
            });            
            //信用卡新卡
            $("#card-disablePaymentCreditcard").get(0) && $("#card-disablePaymentCreditcard").delegate(".box-skin a","click",function(e){
                 e.stopPropagation();
                 this.href = _buildURL(AI(this).attr('data-url'));
                 //对优惠活动的资金渠道做处理
                 this.href = Discount.buildURL(AI(this)).url;
            });

            //var _inputData = MoneyModule.data;
            var _click = false,
                _requested = false,
                _anim;


            that.click = false;
            that.requested = false;
            that._anim = null;
            that.trigger = that.options.trigger;
            that.triggerBody = that.options.triggerBody;
            //绑定事件
            that.trigger && that.trigger.click(function (e) {
                that.load(e);
            });
            /*
            return {
                load:that.load
            };*/
        }
    });
    module.exports = LoadPayMethodModel;
});