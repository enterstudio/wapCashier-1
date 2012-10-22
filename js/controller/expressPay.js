/**
 * bankcardPay.js
 * 银行卡支付模型bankcardPay.js
 */
define(function(require, exports, module) {
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone'),
        Handlebars = require('handlebars');    
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    var ExpressPayModel = BaseModel.extend({
        options:{
        	events:{
                use:function(params){
                    var that = this;
                    var plan = that.options.pay.getPlan();
                    ///console.log('expressPay');
                    var deltaAmount = that.options.pay.getDeltaAmount(plan);
                    var payAmount = deltaAmount;
                    if(deltaAmount<=0){
                        that.fireEvent('unuse');
                        setTimeout(function(){$(that.domContext).attr({checked:false,disabled:true});},0);
                    }else{
                        payAmount = that.options.pay.fixed(payAmount);
                        plan.expressPay = payAmount;
                        that.options.pay.setPlan(plan);

                        //页面显示
                        $('#bankcards').attr({disabled:false});
                        var showTxtUse = Handlebars.compile(that.data_model.showTxt.use); 
                        showTxtUse = showTxtUse({payAmount:payAmount});
                        $(that.domContext).closest('label').find('span').text(showTxtUse);
                    }
                },
                unuse:function(){
                    var that = this;
                    var plan = that.options.pay.getPlan();    
                    plan = _.omit(plan,'expressPay');
                    var deltaAmount = that.options.pay.getDeltaAmount(plan);
                    if(deltaAmount>0){
                        setTimeout(function(){$(that.domContext).attr({disabled:false});},0);  
                    }else{
                        setTimeout(function(){$(that.domContext).attr({disabled:true,checked:false});},0);      
                    }
                    $('#bankcards').attr({disabled:true});          
                    that.options.pay.setPlan(plan);
                    $(that.domContext).closest('label').find('span').text(that.data_model.showTxt.unuse);
                },
                'check':function(params){
                    var that = this;
                    that.fireEvent('unuse');
                    if($(that.domContext).attr('checked')){
                        that.fireEvent('use',params);
                    }
                    params.mode == 'active' && setTimeout(function(){that.options.pay.fireEvent('checkPlan','expressPay');},0);
                }
        	}
        },
        initialize:function(domContext,options){
        	var that = this;
            ExpressPayModel.superclass.initialize.apply(that,[options]);
            that.domContext = domContext;
            that.data_model = _.clone(that.options.data_model);
            !that.options.pay && console.log('config error');
            $(that.domContext).bind('checkuse',function(e,params){
                !params.behavior && (function(){params.behavior = 'manual'})();
                that.fireEvent('check',params);//主动模式
            }).bind('click',function(){
                $(that.domContext).trigger('checkuse',[{mode:'active'}]);
            }).trigger('checkuse',[{mode:'active'}]);

            $('#addBankcard').bind('click',function(){
                console.log('添加卡');
            });    

        }
    });
    module.exports = ExpressPayModel;
});
