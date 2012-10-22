/* discount.js */
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
    var DiscountModel = BaseModel.extend({
        options:{
            availableDiscount:true, //{ Boolean } 优惠是否可用，默认可用
            html:'<span class="discount" data-campaignId="{campaignId}">{discountText}</span>', //{ String } 渠道优惠html模板
            desHtml:'<p class="discountDes hide"></p>', //{ String } 老卡提前时提示优惠
        },
        hide:function(){//隐藏打折区域
            $(".discount").addClass("hide");
            $("#J_disAmountBox").get(0) && $("#J_disAmountBox").addClass("hide");
            $(".discountDes").get(0) && $(".discountDes").addClass("hide");
            //对已存卡提前的下拉框处理
            var select = $('#kj_select').get(0);
            if(select){
                var options = select.options;
                for(var i=0;i<options.length;i++){
                    var option = AI(options[i]);
                    var text = option.text().replace(" 惠","");
                    option.text(text).removeClass("t-orange");
                }
            }
        },
        show:function(){//显示打折区域
            $(".discount").removeClass("hide");
            //对已存卡提前的下拉框处理
            var select = $('#kj_select').get(0);
            if(select){
                var options = select.options;
                for(var i=0;i<options.length;i++){
                    var option = AI(options[i]);
                    if(option.attr("isDiscount") == "true"){
                        var text = option.text().indexOf(" 惠") > -1 ? option.text() : option.text() + ' 惠';
                        option.text(text).addClass("t-orange");
                    }
                }
            }
        },
        buildHTML:function(data){
            var disHtml = '';
            if((data.discount || data.discount == "true") && data.discount != "false"){
                var discountText = data.discountText ? data.discountText : "";
                var campaignId = data.campaignId ? data.campaignId : '';
                disHtml = Discount.html.replace('{discountText}',discountText);
                disHtml = disHtml.replace('{campaignId}',campaignId);
            }
            return disHtml;
        },
        buildURL:function(link){
            var _link = link,url = _link.attr("href");
            //检查该资金渠道是否有优惠活动
            var channelHasDiscount = _link.find(".discount").length > 0;
            //用于替换url中的campaignId
            //如果已经存在campaignId,campaignId有值则替换,campaignId无值则加上值
            //不存在campaignId,将campaignId加入到url最后
            var _replaceCamId = function(url,id){
                if(url){
                    var id = id || "";
                    if(url.indexOf("&campaignId=") > -1){
                        url.replace(/&campaignId=[^&]{0,}&?/,'&campaignId=' + id + '&');
                    }else{
                        url = url + '&campaignId=' + id;
                    }
                }
                return url;
            }
            if(channelHasDiscount && !_link.find(".discount").hasClass("hide")){
                var campaignId = _link.find(".discount").attr("data-campaignId") ? _link.find(".discount").attr("data-campaignId") : "";
                //替换campaignId值
                url = _replaceCamId(url,campaignId);
            }else{
                url = url.replace(/&campaignId=[^&]{0,}&?/,"");
            }
            //修改url的href值
            _link.attr("href",url);
            return {
                link:_link,
                url:url
            }
        },
        exaAvailableDiscount:function(){//判断是否支持打折
            var that = this;
            var plan = that.pay.getPlan();
            var pay_amount = plan.pay_amount,
                total = plan.balance_to_pay + plan.coupon_amount + plan.point_amount2;   
            if(total > 0 && total < pay_amount){
                that.availableDiscount = false;
            }else{
                that.availableDiscount = true;
            }
            return that.availableDiscount;
        },
        render:function(){
            var that = this;
            //检查是否显示优惠渠道标识
            var availableDiscount = that.exaAvailableDiscount();
            //显示或者隐藏优惠
            if(availableDiscount){
                that.show();
            }else{
                that.hide();
            }
        },
        queryAmout:function(){
            var that = this;
            //检查是否显示优惠渠道标识
            var availableDiscount = that.exaAvailableDiscount();
            //获取快捷提前的下拉框Dom原生对象
            var select = $('#bankcards').get(0);
            //引入几个其他组件的对象
            var plan = that.pay.getPlan();

            //确保和老卡提前的两个数据时隐藏状态
            $("#J_disAmountBox").addClass('hide');
            $(".discountDes").addClass('hide');
            //三个条件下执行：1.有快捷老卡，2.用户使用了快捷，3.用户没有使用组合支付
            if(select && !$('#bankcards').hasClass("hide") && availableDiscount){
                /*
                *将优惠相关的节点加入文档中并初始化
                */
                //显示优惠提示信息
                if(!$(".discountDes").get(0)){
                    $('#kj_select').after(that.options.desHtml);
                }
                //显示抵扣金额
                if(!$('#J_disAmountBox').get(0)){
                    $("#pay_result_text").before("<p class='hide' id='J_disAmountBox'>抵扣金额：<mark class='t-orange t-size-16px'></mark>元（集分宝兑换券）</p>");
                }else{
                    $('#J_disAmountBox').find("mark").empty();
                }
                //服务端需要的优惠金额参数
                if(!$('[name="discountAmount"]').get(0)){
                    $("#paymentForm").append('<input type="hidden" name="discountAmount" value="0.00" />');
                }else{
                    $('[name="discountAmount"]').val("0.00");
                }
                
                //获取一些需要的数据
                var option = $(select.options[select.selectedIndex]),
                    awid = $('input[name="awid"]').val(),
                    orderId = $('input[name="orderId"]').val(),
                    AjaxUrl = $('input[name="AjaxUrl"]').val(),
                    campaignId = option.attr("campaignId"),
                    pay_result_text = $("#pay_result_text"),
                    _desNode = $(".discountDes"),  
                    discountAmount = $('[name="discountAmount"]'),
                    disAmountBox = $("#J_disAmountBox");
                        
                //老卡银行有优惠时请求优惠金额                
                if(option.attr("isDiscount") == "true"){
                    var requestData = '{"campaignId":"'+campaignId+'","orderId":"'+ orderId +'"}';
                    var data = 'awid='+ awid +'&operationType=GET_DIS_DETAIL&requestData='+ requestData +'';
                    //请求数据
                    var io = new $.ajax(AjaxUrl, {
                        type: 'post',
                        data: data,
                        on: {
                            failure:function(){
                                _desNode.empty().removeClass('hide').addClass("t-red").html("优惠请求失败");
                                disAmountBox.addClass('hide');
                            },
                            success:function(data){
                                if(data.resultStatus == "100"){
                                    _desNode.empty().text(data.desc);
                                    _desNode.removeClass("t-red").removeClass('hide');
                                    disAmountBox.find("mark").empty().text(data.amount);
                                    discountAmount.val(data.amount);
                                    var _kj_amount = MoneyModule.fixed((parseFloat(MoneyModule.mount.pay_amount) - parseFloat(data.amount)),'str');
                                    MoneyModule.data("kj_amount",_kj_amount);
                                    disAmountBox.next().find("mark:eq(0)").text(_kj_amount);
                                    disAmountBox.removeClass('hide');
                                }else{
                                    _desNode.empty().html("优惠请求失败");
                                    _desNode.addClass("t-red").removeClass('hide');
                                    disAmountBox.addClass('hide');
                                }
                            }
                        },
                        timeout: 12000,
                        dataType: 'json'
                    });
                    io.send();
                }else{
                    _desNode.empty().addClass('hide');
                    disAmountBox.addClass('hide');
                }
            }
        },
        initialize:function(pay,options){
            var that = this;
            DiscountModel.superclass.initialize.apply(that,[options]);
            that.pay = pay;
            //console.log(that.options);
        }
    });
    module.exports = DiscountModel;
});