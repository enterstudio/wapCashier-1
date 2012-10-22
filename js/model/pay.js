/**
 * pay.js
 * 用于组织wapCashier支付相关业务
 */
define(function(require, exports, module) {
    var Class = require('class');
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone'),
        Json = require('json');
    var iScroll = require('iScroll');  
    //var Validator = require('validator');
    var WapCashierBaseModel = require('http://localhost:8000/wapCashier/js/model/wapCashierBase');
    var MoneyModel = require('http://localhost:8000/wapCashier/js/model/money');
    var DiscountModel = require('http://localhost:8000/wapCashier/js/model/discount');
    var LoadPayMethodModel = require('http://localhost:8000/wapCashier/js/model/loadPayMethod');    
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    var CouponPay = require('http://localhost:8000/wapCashier/js/controller/couponPay');
    var PointPay = require('http://localhost:8000/wapCashier/js/controller/pointPay');
    var BalancePay = require('http://localhost:8000/wapCashier/js/controller/balancePay');
    var ExpressPay = require('http://localhost:8000/wapCashier/js/controller/expressPay');
    var OtherMethods = require('http://localhost:8000/wapCashier/js/controller/otherMethods');
    var PayModel = WapCashierBaseModel.extend({
        options:{
            plan:{},//支付方案
            payMethodModels:{
                'couponPay':function(domContext,options){
                    return new CouponPay(domContext,options);
                },
                'pointPay':function(domContext,options){
                    return new PointPay(domContext,options);
                },
                'balancePay':function(domContext,options){
                    return new BalancePay(domContext,options);
                },
                'expressPay':function(domContext,options){
                    return new ExpressPay(domContext,options);
                },
                'otherWayPay':function(domContext,options){
                    return new OtherMethods(domContext,options);
                }
            },
            events:{
                'checkPlan':function(source){
                    var that = this;
                    var plan = that.getPlan();
                    var payMethodsKeys = _.keys(that.payMethods);
                    $.each(plan,function(key,item){
                        if($.inArray(key,payMethodsKeys)==-1){
                           plan = _.omit(plan,key); 
                        }
                    });
                    $.each(_.omit(that.payMethods,source),function(key,method){
                        method.fireEvent('check',{mode:'passive'});
                    }); 

                    /*
                    var payMethodsKeys = _.keys(that.payMethods);
                    $.each(plan,function(key,item){
                        if($.inArray(key,payMethodsKeys)==-1){
                           plan = _.omit(plan,key); 
                        }
                    });
                    that.setPlan(plan);
                    $.each(_.omit(that.payMethods,source),function(key,method){
                        //method.fireEvent('check',{mode:'passive'});
                    });                        
                     */
                    //console.log(plan);
                    ///console.log(plan);
                    /*
                    $.each(_.omit(that.payMethods,source),function(key,method){
                        method.fireEvent('check',{mode:'passive'});
                    });*/

                    
                }
            }
        },
        getPlan:function(){//获取支付方案
            var that = this;
            return that.options.plan;
        },
        getDeltaAmount:function(plan){
            var that = this;
            var payMethodsKeys = _.keys(that.payMethods);
            $.each(plan,function(key,item){
                if($.inArray(key,payMethodsKeys)==-1){
                   plan = _.omit(plan,key); 
                }
            });
            var values = _.values(plan);
            var planAmount = _.reduce(values, function(memo, num){ return memo + num; }, 0);
            //当前支付方案支付的总金额
            //当前订单需要支付的金额,该金额可能经过打折等等活动计算之后的结果;
            //小于0 则超额
            var deltaAmount = that.getTotalAmount() - planAmount;
            //plan.deltaAmount = deltaAmount;
            return deltaAmount;
        },
        setPlan:function(plan){//设置支付方案
            var that = this;
            that.options.plan = plan;
        },
        setVal:function(str, val){
            var o = $(str);
            return o && o.val('' + val) || '';
        },        
        fixed:function(n, type){
            //默认保留两位小数
            var n = Math.round(n * 100) / 100;
            type == 'str' ? n = (n).toFixed(2) : null;
            return n;
        },
        getInputMount:function(){
            var that = this;
            var o = {},
                arr = ['pay_amount', 'available_amount', 'availablePoint', 'balance_to_pay', 'kj_amount', 'coupon_amount', 'point_amount', 'bank_amount'];
            $.each(arr,function(index,item){
                o[item] = parseFloat($('input[name='+ item +']').val()) || 0;
            });
            o['point_amount2'] = that.fixed(o['point_amount'] / 100);
            return o;
        },
        changeAmount:function(name, a, b){
            var that = this;
            var val;
            if (a >= b) {
                val = b;
            } else {
                val = a;
            }
            val = that.fixed(val);
            $('input[name="' + name + '"]').val(val);
            var plan = that.getPlan();    
            if (plan.hasOwnProperty(name)) {
                plan[name] = that.fixed(parseFloat(val) || 0);
                name == 'point_amount' ? plan['point_amount2'] = that.fixed(plan[name] / 100) : null;
            }
            that.setPlan(plan);
            return val;
        },
        adjustAmount:function(cbid){
            var that = this;
            var plan = that.getPlan();
            //console.log(plan);
            //调整金额
            var dval = 0, //还需支付
                total = 0; //支付总额
            if ($('#couponPay').attr('checked') && $('#pointPay').attr('checked')) {
                if (cbid == 'coupon') {//红包
                    that.changeAmount('coupon_amount', plan.pay_amount - plan.point_amount2, plan.coupon_amount);
                }
                if (cbid == 'point') {//集分宝
                    that.changeAmount('point_amount', (plan.pay_amount - plan.coupon_amount) * 100, plan.point_amount2 * 100);
                }
            }
            if ($('#couponPay').attr('checked')) {
                total += that.changeAmount('coupon_amount', plan.pay_amount, plan.coupon_amount);
            }
            if ($('#pointPay').attr('checked')) {
                dval = plan.pay_amount - total;
                total += that.changeAmount('point_amount', plan.point_amount2 * 100, dval * 100) / 100;
            }
            if ($('#balancePay').attr('checked') || plan.available_amount > plan.pay_amount) {//选中余额支付或者可用余额大于支付金额
                dval = plan.pay_amount - total;
                total += that.changeAmount('balance_to_pay', plan.available_amount, dval);
            }
            if ($('#expressPay').attr('checked')) {
                dval = plan.pay_amount - total;
                //快捷补足 by litian
                plan.kj_amount = dval > 0 ? dval : plan.kj_amount;
                total += that.changeAmount('kj_amount', plan.kj_amount, dval); 
            }
        },
        rule:function(cbid){
            var that = this;
            var plan = that.getPlan();
            //
            if (plan.coupon_amount >= plan.pay_amount) {
                //红包足以支付
                that.disablePayMethod([$('#balancePay'), $('#pointPay'), $('#expressPay')], true);
            } else if (plan.point_amount2 >= plan.pay_amount) {
                //集分宝足以支付
                that.disablePayMethod([$('#balancePay'), $('#couponPay'), $('#expressPay')], true);
            } else {
                //console.log(plan);
                if(that.fixed(plan.balance_to_pay + plan.coupon_amount + plan.point_amount2) >= plan.pay_amount){
                    //（余额+红包＋集分宝）足以支付
                    that.disablePayMethod([$('#expressPay')], true);
                }
                if (that.fixed(plan.balance_to_pay + plan.coupon_amount) >= plan.pay_amount) {
                    //未选集分宝，（余额＋红包）足以支付
                    that.disablePayMethod([$('#expressPay')], true);
                }
                if (that.fixed(plan.balance_to_pay + plan.point_amount2) >= plan.pay_amount) {
                    //未选红包，（余额＋集分宝）足以支付
                    that.disablePayMethod([$('#expressPay')], true);
                }
                if (that.fixed(plan.coupon_amount + plan.point_amount2) >= plan.pay_amount) {
                    //未选余额，（红包＋集分宝）足以支付
                    that.disablePayMethod([$('#balancePay'), $('#expressPay')], true);
                }
            }
            if (cbid == 'balance' && !$('#balancePay').attr('checked')) {
                //不选余额
                that.disablePayMethod([$('#couponPay'), $('#pointPay'), $('#expressPay')], false);
            }
            if (cbid == 'coupon' && !$('#couponPay').attr('checked')) {
                //不选红包
                that.disablePayMethod([$('#balancePay'), $('#pointPay'), $('#expressPay')], false);
            }
            if (cbid == 'point' && !$('#pointPay').attr('checked')) {
                //不选集分宝
                that.disablePayMethod([$('#balancePay'), $('#couponPay'), $('#expressPay')], false);
            }


            that.discount.render(plan);
            //that.discount.render.apply(that.discount,[plan]);
            //Discount.render(_mount);
            //这里必须先请求优惠金额再请求用户银行的服务费
            //因为服务费计算不包含用户已经享受的优惠
            //这里有优化可能，现在用户老卡提前时会出现需要请求两次后台的情况
            that.discount.queryAmout();  
            //检查优惠渠道 litian
            //Discount.queryAmout();      
            //检查服务费 litian
            //_checkHasChargeFee();
            
            //_checkPay();
            //LoadPayMethod.showMixPayMethod();
        },
        checkHasChargeFee:function(){//待续
            var that = this;
            var plan = that.getPlan();

            var kj_amount = plan.kj_amount;
            //var _inputData = _data;
            var select = $('#bankcards').get(0);
            if(!select){return;}
            var option = select.options[select.selectedIndex],
                bankCode = $(option).attr("bankCode"),
                hasChargeFee = $(option).attr("hasChargeFee"),
                campaignId = $(option).attr("campaignId") ? $(option).attr("campaignId") : "",
                awid = $('input[name="awid"]').val(),
                orderId = $('input[name="orderId"]').val(),
                AjaxUrl = $('input[name="AjaxUrl"]').val(),
                _kjErrorNode = $("#J_kjError"),
                tip = '使用港澳地区信用卡，将收取一定费用。',
                pay_result_text = $("#pay_result_text"),
                chargeFeeBox = $("<p class='hide'>手续费：<mark class='t-red t-size-16px' id='J_chargeFeeBox'></mark>元</p>"),
                totalBox = $("<p class='hide'>总共支付：<mark class='t-color-orange t-size-16px' id='J_totalBox'></mark>元</p>");
                
            if(kj_amount > 0 && !$('#bankcards').hasClass("hide") && hasChargeFee && hasChargeFee == "true"){
                //检查是否显示优惠渠道标识
                var availableDiscount = that.discount.exaAvailableDiscount(),cid; 
                if(availableDiscount){
                    cid = campaignId;
                }else{
                    cid = "";
                }
                var requestData = '{"bankCode":"'+bankCode+'","depositAmount":"'+ kj_amount +'","orderId":"'+ orderId +'","campaignId":"'+ cid +'"}';
                var data = 'awid='+ awid +'&operationType=GET_CHANNEL_CHARGE_FEE&requestData='+ requestData +'';
                //请求数据
                //console.log(new $.ajax());

                $.ajax(AjaxUrl,{
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
            }else{
                chargeFeeBox.addClass('hide');
                totalBox.addClass('hide');
                _kjErrorNode.addClass('hide');
            }
        },
        disablePayMethod:function(o,disabled){
           $.each(o,function(index,item){
                disabled?item.attr({'checked':false}):null;
                item.attr({disabled:disabled});
                if(disabled){
                    switch (item.attr('id')) {
                        case 'balancePay':
                            $('input[name="balance_to_pay"]').val(0);
                            break;
                        case 'couponPay':
                            $('input[name="coupon_amount"]').val(0);
                            $('input[name="coupon_list"]').val(0);
                            break;
                        case 'pointPay':
                            $('input[name="point_amount"]').val(0);
                            break;
                        case 'expressPay':
                            $('input[name="kj_amount"]').val(0);
                            $('#banklist').addClass('hide');
                            break;
                    }                    
                }
           }); 
        },
        getTotalAmount:function(){//需要支付的总金额
            return 100;
        },
        initialize:function(owner,options){
            var that = this;
            PayModel.superclass.initialize.apply(that,[options]);

            /**
             * 初始化对象
             */
            /**
              * pay_amount 应付总价
              * available_amount 可用余额
              * availablePoint 可用集分宝
              * balance_to_pay 余额支付
              * kj_amount 卡通支付
              * coupon_amount 红包支付
              * point_amount 集分宝支付（个）
              * point_amount2 集分宝支付（元）
             */
            that.mount = that.getInputMount();
            //console.log(that.mount);
            //console.log($('input[name=balance_to_pay]').val());
            //初始化页面对优惠标识的渲染
            //用户使用浏览器后退以后，页面对优惠标识的渲染会有错误因此需要初始化
            //Discount.render();            
            that.discount = new DiscountModel(that);



            //that.setPlan(that.mount);
            /**
             * 实例化滚动对象
             */
            /*
            document.addEventListener('touchmove', function(e){ 
                console.log('touchmove');
                //e.preventDefault(); 
            });
            that.iscroll = new iScroll({
                element:'#scrollCards-container',
                options:{
                    snap:true,
                    momentum:false,
                    hScrollbar:false,
                    vScrollbar:false,
                    vScroll:false
                }
            });
            that.iscroll.scrollToElement('#card-coupon',500);
             */
            /**
             * 实例化付款方式对象
             */
            that.payMethods = {};
            $.each(owner,function(index,item){
                var data_model = $(item).attr('data-model').replace(/\'/g,'"');
                data_model = Json.parse(data_model);
                !!data_model.model && (function(){
                    that.options.payMethodModels[data_model.model] && 'function' == typeof(that.options.payMethodModels[data_model.model]) && (function(){
                        that.payMethods[data_model.model] = that.options.payMethodModels[data_model.model](item,{pay:that,data_model:data_model});
                    })();
                })();
                /**
                 * 初始化页面时禁用复选框,待脚本加载完成启用
                 */
                //$(item).attr({disabled:false});
            });
            that.plan = that.getPlan();

            /**
             * LoadPayMethod
             * 老版本采用LoadPayMethod,是否废弃?
             * LoadPayMethod vs that.payMethods.OtherWayPay.fireEvent('use')
             * 确认后需更新至controller/otherMethod.js
             */
            that.loadAllPayMethod = new LoadPayMethodModel({
                trigger: $('#J_other_pay_method_trigger'),
                triggerBody: $('#J_other_pay_method_body'),
                scope: 'all'
            });
            /**
             * 无支付能力引导 后台来对用户的支付能力做判断
             * 若globalVars.needOpenChannels==true则触发使用其它付款方式事件,needOpenChannels由后端传递
             */
            //!!globalVars.needOpenChannels && that.payMethods.OtherWayPay.fireEvent('use');
            !!globalVars.needOpenChannels && that.loadAllPayMethod.load();
            //loadAllPayMethod.load();
            //
            //
            

            
            //console.log(that.discount);
            that.discount.render();//
            //这里必须先请求优惠金额在请求用户银行的服务费
            //因为服务费不能包含用户已经享受的优惠金额
            //这里有优化可能，现在用户老卡提前时会出现需要请求两次后台的情况
            //快捷提前时,检查默认的老卡是否有优惠
            that.discount.queryAmout();//待续

            that.checkHasChargeFee();


            //多笔合并查看交易详情
            //???没找到DOM
            //待续
            /*
            if($("#J-detailTrigger").get(0) && $("#card-goodsDetail").get(0) && $('.scrollCards').get(0)){
                var detailTrigger = $("#J-detailTrigger");
                var goodsDetail = $("#card-goodsDetail");
                
                goodsDetail.attr("role","card")
                           .appendTo(AI('.scrollCards'))
                           .css("float","none")
                           .find(".title").css("margin-bottom","5px");
                           
                detailTrigger.click(function(e){
                    e.preventDefault();
                    scrollCards.scrollToPos("card-goodsDetail");          
                });
                AI('.btn-nav-back',goodsDetail).click(function (e) {
                    e.preventDefault();
                    scrollCard0();
                });
            }   
            */
        }
    });
    module.exports = PayModel;
});