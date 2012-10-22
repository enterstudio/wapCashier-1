/* money.js */
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
    var MoneyModel = BaseModel.extend({
        options:{

        },
        fixed:function(n, type){
            //默认保留两位小数
            var n = Math.round(n * 100) / 100;
            type == 'str' ? n = (n).toFixed(2) : null;
            return n;
        },
        getVal:function(str){
            var o = $(str);
            return o && o.val() || '';
        },
        setVal:function(str, val){
            var o = $(str);
            return o && o.val('' + val) || '';
        },
        disabledCheckBox:function(o, disabled){
            //禁用checkbox
            var _arr = [].concat(o);
            for (var i = 0, l = _arr.length; i < l; i++) {
                if (!_arr[i]) {
                    continue;
                }
                disabled ? _arr[i].attr('checked', false) : null;
                _arr[i].attr('disabled', disabled);
                if (disabled) {
                    switch (_arr[i].attr('id')) {
                    case 'ye':
                        _data('balance_to_pay', 0);
                        break;
                    case 'hb':
                        _data('coupon_amount', 0);
                        _data('coupon_list', 0);
                        break;
                    case 'jfb':
                        _data('point_amount', 0);
                        break;
                    case 'kj_cb':
                        _data('kj_amount', 0);
                        kj_select.addClass('hide');
                        break;
                    }
                }
            }
        },
        adjustAmount:function(cbid){
            var that = this;
            //调整金额
            var dval = 0, //还需支付
                total = 0; //支付总额
            var _changeAmount = function (name, a, b) {
                var val;
                if (a >= b) {
                    val = b;
                } else {
                    val = a;
                }
                val = that.fixed(val)
                that.data(name, val);
                return val;
            };
            if ($('#couponPay').attr('checked') && $('#pointPay').attr('checked')) {
                if (cbid == 'hb') {//红包
                    _changeAmount('coupon_amount', that.mount.pay_amount - that.mount.point_amount2, that.mount.coupon_amount);
                }
                if (cbid == 'jfb') {//集分宝
                    _changeAmount('point_amount', (that.mount.pay_amount - that.mount.coupon_amount) * 100, that.mount.point_amount2 * 100);
                }
            }
            if ($('#couponPay').attr('checked')) {
                total += _changeAmount('coupon_amount', that.mount.pay_amount, that.mount.coupon_amount);
            }
            if ($('#pointPay').attr('checked')) {
                dval = that.mount.pay_amount - total;
                total += _changeAmount('point_amount', that.mount.point_amount2 * 100, dval * 100) / 100;
            }
            if ($('#balancePay').attr('checked') || that.mount.available_amount > that.mount.pay_amount) {
                dval = that.mount.pay_amount - total;
                total += _changeAmount('balance_to_pay', that.mount.available_amount, dval);
            }
            if ($('#expressPay').attr('checked')) {
                dval = that.mount.pay_amount - total;
                //快捷补足 by litian
                that.mount.kj_amount = dval > 0 ? dval : that.mount.kj_amount;
                total += _changeAmount('kj_amount', that.mount.kj_amount, dval); 
            }
        },
        checkPay:function(){
            var that = this;
            //支付文案
            var dval = 0,
                html = '';
            $('#pay_result_text').html(' ');
            if (that.mount.balance_to_pay > 0) {
                dval = that.fixed(dval + that.mount.balance_to_pay);
                html += '<p>余额支付：<mark class="t-size-16px">' + that.fixed(that.mount.balance_to_pay, 'str') + '</mark>元&nbsp;&nbsp;</p>';
            }
            //显示红包个数
            var coupon_quantity = that.getVal('[name=coupon_quantity]'),
                coupon_quantityHtml = parseFloat(coupon_quantity) > 0 ? '<mark class="t-color-red">（'+ coupon_quantity +'个）</mark>' : '';
            if (that.mount.coupon_amount > 0) {
                dval = that.fixed(dval + that.mount.coupon_amount);
                $('#hb_cb_text').html('使用红包' + that.fixed(that.mount.coupon_amount, 'str') + '元');
                html += '<p>红包支付：<mark class="t-size-16px">' + that.fixed(that.mount.coupon_amount, 'str') + '</mark>元&nbsp;&nbsp;</p>';
            } else {
                $('#hb_cb_text')[0] && $('#hb_cb_text').html('使用红包 ' + coupon_quantityHtml);
            }
            if (that.mount.point_amount2 > 0) {
                dval = that.fixed(dval + that.mount.point_amount2);

                //$('#pointPay').closest('div.pay-method').find('span').html('使用集分宝' + parseInt(that.mount.point_amount) + '个&nbsp;&nbsp;抵扣' + that.fixed(that.mount.point_amount2, 'str') + '元');

                $('#jfb_cb_text').html('使用集分宝' + parseInt(that.mount.point_amount) + '个&nbsp;&nbsp;抵扣' + that.fixed(that.mount.point_amount2, 'str') + '元');
                html += '<p>集分宝支付：<mark class="t-size-16px">' + that.fixed(that.mount.point_amount2, 'str') + '</mark>元&nbsp;&nbsp;</p>';
            } else {
                $('#pointPay').closest('div.pay-method').find('span').html('使用集分宝');

                $('#pointPay')[0] && $('#jfb_cb_text').html('使用集分宝');
            }
            if (that.mount.kj_amount > 0) {
                //快捷补足
                html += '<p>快捷支付：<mark class="t-size-16px">' + that.fixed(that.mount.pay_amount - dval, 'str') + '</mark>元&nbsp;&nbsp;</p>';
                dval = that.mount.pay_amount;
            }else{
                
            }
            if (that.mount.available_amount >= that.mount.pay_amount) {
                //足以支付时
                if (that.fixed(that.mount.pay_amount - dval) > 0) {
                    html = '<p>余额支付：<mark class="t-size-16px">' + that.fixed(that.mount.pay_amount - dval, 'str') + '</mark>元&nbsp;&nbsp;</p>' + html;
                    dval = that.mount.pay_amount;
                }
            }
            //
            html != '' ? $('#pay_result_text').html(html) : null;
            if (dval >= that.mount.pay_amount) {
                //足以支付
                $('#other_pay_method_text').html('您还可以使用其他付款方式');
                that.disablePwdBox(false);
            } else {
                if (that.mount.balance_to_pay > 0 || that.mount.coupon_amount > 0 || that.mount.point_amount2 > 0) {
                    //任一支付方式大于0，但不足以支付(除卡通)
                    html += '<p>还需支付：<mark class="t-color-orange t-size-16px">' + that.fixed(that.mount.pay_amount - dval, 'str') + '</mark>元</p>';
                    html != '' ? $('#pay_result_text').html(html) : null;
                    $('#other_pay_method_text').html('余额不足，请选择其他方式支付');
                } else {
                    $('#pay_result_text').html('<p>支付金额：<mark class="t-color-orange t-size-16px">' + that.fixed(that.mount.pay_amount, 'str') + '</mark>元</p>');
                    $('#other_pay_method_text').html('您还可以使用其他付款方式');
                }
                that.disablePwdBox(true);
            }
        },
        getInputMount:function(){
            var that = this;
          /*
           * pay_amount 应付总价
           * available_amount 可用余额
           * availablePoint 可用集分宝
           * balance_to_pay 余额支付
           * kj_amount 卡通支付
           * coupon_amount 红包支付
           * point_amount 集分宝支付（个）
           * point_amount2 集分宝支付（元）
          */
            var o = {},
                arr = ['pay_amount', 'available_amount', 'availablePoint', 'balance_to_pay', 'kj_amount', 'coupon_amount', 'point_amount', 'bank_amount'];
            for (var i = 0, l = arr.length; i < l; i++) {
                //o[arr[i]] = parseFloat(that.getVal('input[name=' + arr[i] + ']')) || 0;
                o[arr[i]] = parseFloat($('input[name='+ arr[i] +']').val()) || 0;
            }
            o['point_amount2'] = that.fixed(o['point_amount'] / 100);
            //console.log(o);
            return o;
        },
        data:function(name){
            var that = this;
            var _val = 0;
            if (arguments.length > 1) {
                _val = that.setVal('input[name=' + name + ']', typeof arguments[1] == 'number' ? that.fixed(arguments[1]) : arguments[1]);
                if (that.mount.hasOwnProperty(name)) {
                    that.mount[name] = that.fixed(parseFloat(arguments[1]) || 0);
                    name == 'point_amount' ? that.mount['point_amount2'] = that.fixed(that.mount[name] / 100) : null;
                }
            } else {
                _val = that.getVal('input[name=' + name + ']');
            }
            return _val;
        },
        checkHasChargeFee:function(){
            var that = this;
            var kj_amount = that.mount.kj_amount;
            var select = $('#kj_select').get(0);
            if(!select){return;}
            var option = select.options[select.selectedIndex],
                bankCode = $(option).attr("bankCode"),
                hasChargeFee = $(option).attr("hasChargeFee"),
                campaignId = $(option).attr("campaignId") ? $(option).attr("campaignId") : "",
                awid = that.data('awid'),
                orderId = that.data('orderId'),
                AjaxUrl = that.data('AjaxUrl'),
                _kjErrorNode = $("#J_kjError"),
                tip = '使用港澳地区信用卡，将收取一定费用。',
                pay_result_text = $("#pay_result_text"),
                chargeFeeBox = $("<p class='hide'>手续费：<mark class='t-red t-size-16px' id='J_chargeFeeBox'></mark>元</p>"),
                totalBox = $("<p class='hide'>总共支付：<mark class='t-color-orange t-size-16px' id='J_totalBox'></mark>元</p>");
                
            if(kj_amount > 0 && !$('#kj_select').hasClass("hide") && hasChargeFee && hasChargeFee == "true"){
                console.log('A');
                //检查是否显示优惠渠道标识
                var availableDiscount = Discount.exaAvailableDiscount(),cid; 
                if(availableDiscount){
                    cid = campaignId;
                }else{
                    cid = "";
                }
                var requestData = '{"bankCode":"'+bankCode+'","depositAmount":"'+ kj_amount +'","orderId":"'+ orderId +'","campaignId":"'+ cid +'"}';
                var data = 'awid='+ awid +'&operationType=GET_CHANNEL_CHARGE_FEE&requestData='+ requestData +'';
                //请求数据
                var io = new AI.ajax(AjaxUrl, {
                    type: 'post',
                    data: data,
                    on: {
                        failure:function(){
                            _kjErrorNode.empty().html("该交易不支持使用外卡支付，请选择其他付款方式。");
                            _kjErrorNode.removeClass('hide');
                        },
                        success:function(data){
                            //console.log(data);
                            if(data.resultStatus == 100){
                                pay_result_text.append(chargeFeeBox);
                                pay_result_text.append(totalBox);
                                chargeFeeBox.find("#J_chargeFeeBox").html(data.chargeFee);
                                totalBox.find("#J_totalBox").html(data.realPaymentAmount);
                                _kjErrorNode.empty().html(tip);
                                chargeFeeBox.removeClass('hide');
                                totalBox.removeClass('hide');
                                _kjErrorNode.removeClass('hide');
                            }else{
                                _kjErrorNode.empty().html(data.errorMessage);
                                _kjErrorNode.removeClass('hide');
                            }
                        }
                    },
                    timeout: 12000,
                    dataType: 'json'
                });
                io.send();
            }else{
                chargeFeeBox.addClass('hide');
                totalBox.addClass('hide');
                _kjErrorNode.addClass('hide');
            }
        },
        rule:function(cbid){
            var that = this;
            //基本交互规则
            //调整金额
            that.adjustAmount(cbid);
            //
            if (that.mount.coupon_amount >= that.mount.pay_amount) {
                //红包足以支付
                that.disabledCheckBox([$('#balancePay'), $('#pointPay'), $('#expressPay')], true);
            } else if (that.mount.point_amount2 >= that.mount.pay_amount) {
                //集分宝足以支付
                that.disabledCheckBox([$('#balancePay'), $('#couponPay'), $('#expressPay')], true);
            } else {
                if(that.fixed(that.mount.balance_to_pay + that.mount.coupon_amount + that.mount.point_amount2) >= that.mount.pay_amount){
                    //（余额+红包＋集分宝）足以支付
                    that.disabledCheckBox([$('#expressPay')], true);
                }
                if (that.fixed(that.mount.balance_to_pay + that.mount.coupon_amount) >= that.mount.pay_amount) {
                    //未选集分宝，（余额＋红包）足以支付
                    that.disabledCheckBox([$('#expressPay')], true);
                }
                if (that.fixed(that.mount.balance_to_pay + that.mount.point_amount2) >= that.mount.pay_amount) {
                    //未选红包，（余额＋集分宝）足以支付
                    that.disabledCheckBox([$('#expressPay')], true);
                }
                if (that.fixed(that.mount.coupon_amount + that.mount.point_amount2) >= that.mount.pay_amount) {
                    //未选余额，（红包＋集分宝）足以支付
                    that.disabledCheckBox([$('#balancePay'), $('#expressPay')], true);
                }
            }
            if (cbid == 'ye' && !$('#balancePay').attr('checked')) {
                //不选余额
                that.disabledCheckBox([$('#couponPay'), $('#pointPay'), $('#expressPay')], false);
            }
            if (cbid == 'hb' && !$('#couponPay').attr('checked')) {
                //不选红包
                that.disabledCheckBox([$('#balancePay'), $('#pointPay'), $('#expressPay')], false);
            }
            if (cbid == 'jfb' && !$('#pointPay').attr('checked')) {
                //不选集分宝
                that.disabledCheckBox([$('#balancePay'), $('#couponPay'), $('#expressPay')], false);
            }
            
            //that.discount.render(that.mount);
            //这里必须先请求优惠金额再请求用户银行的服务费
            //因为服务费计算不包含用户已经享受的优惠
            //这里有优化可能，现在用户老卡提前时会出现需要请求两次后台的情况
            //检查优惠渠道 litian
            //that.discount.queryAmout();      
            //检查服务费 litian
            that.checkHasChargeFee();
            
            that.checkPay();
            //that.loadPayMethod.showMixPayMethod();   
        },
        disablePwdBox:function(flag){
            //密码框相关开关
            var pwd_box = $('#pwd_box'),
                find_pwd_link = $('#find_pwd_link');
            if (pwd_box && find_pwd_link) {
                flag ? $('.mmError').html(' ') : null;
                $('#find_pwd_link').css('display', flag ? 'none' : '-webkit-box');
                $('#pwd_box')[flag ? 'addClass' : 'removeClass']('hide');
            }
        },
        
        initialize:function(owner,options){
            var that = this;
            MoneyModel.superclass.initialize.apply(that);
            that.mount = that.getInputMount();
            return {
                //创建对象
                mount: that.mount,
                getInputMount: that.getInputMount,
                data: that.data,
                rule: that.rule,
                fixed:that.fixed,
                checkHasChargeFee:that.checkHasChargeFee
            };
              
        }
    });
    module.exports = MoneyModel;
});