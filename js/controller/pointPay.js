/**
 * pointPay.js
 * 集分宝支付模型couponPay.js
 */
define(function(require, exports, module) {
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone'),
        Handlebars = require('handlebars');    
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    var PointPayModel = BaseModel.extend({
        options:{
        	events:{
        		use:function(params){
                    var that = this;
                    var plan = that.options.pay.getPlan();
                    var payAmount = 0.1;
                    payAmount = that.options.pay.fixed(payAmount);
                    plan.pointPay = payAmount;
                    that.options.pay.setPlan(plan);

                    //页面显示
                    var showTxtUse = Handlebars.compile(that.data_model.showTxt.use); 
                    showTxtUse = showTxtUse({payAmount:payAmount});
                    $(that.domContext).closest('label').find('span').text(showTxtUse);
        		},
        		unuse:function(){
                    var that = this;
                    var plan = that.options.pay.getPlan();
                    plan = _.omit(plan,'pointPay');
                    that.options.pay.setPlan(plan);
                    $(that.domContext).closest('label').find('span').text(that.data_model.showTxt.unuse);
        		},
                'check':function(params){
                    var that = this;
                    $(that.domContext).attr({disabled:false});
                    that.fireEvent('unuse');
                    if($(that.domContext).attr('checked')){
                        that.fireEvent('use',params);
                    }
                    params.mode == 'active' && setTimeout(function(){that.options.pay.fireEvent('checkPlan','pointPay');},0);
                }
        	}
        },
        initialize:function(domContext,options){
        	var that = this;
            PointPayModel.superclass.initialize.apply(that,[options]);
            that.domContext = domContext;
            that.data_model = _.clone(that.options.data_model);
            //console.log(that.data_model);
            !that.options.pay && console.log('config error');
            $(that.domContext).bind('checkuse',function(e,params){
                !params.behavior && (function(){params.behavior = 'manual'})();
                that.fireEvent('check',params);//主动模式
            }).bind('click',function(){
                $(that.domContext).trigger('checkuse',[{mode:'active'}]);
            }).trigger('checkuse',[{'mode':'active'}]);
        }
    });
    module.exports = PointPayModel;
});
