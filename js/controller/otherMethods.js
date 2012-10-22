/* orderDetail.js */
/*
    other pay methods
 */
define(function(require, exports, module) {
    var Class = require('class');
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    var Arrow = require('http://localhost:8000/wapCashier/js/ui/arrow');
    var ListView = require('http://localhost:8000/wapCashier/js/ui/listview');
    var OtherMethodsModel = BaseModel.extend({
        options:{
            ui_templates:$('#ui-templates'),
            events:{
                use:function(params){
                    var that = this;
                    var plan = that.options.pay.getPlan();

                    var deltaAmount = that.options.pay.getDeltaAmount(plan);
                    if(deltaAmount<0){
                        that.fireEvent('unuse');
                        setTimeout(function(){$(that.domContext).attr({checked:false,disabled:true});},0);
                    }else{
                        var payAmount = deltaAmount;
                        payAmount = that.options.pay.fixed(payAmount);
                        plan.otherWayPay = payAmount;
                        that.options.pay.setPlan(plan);
                        //
                        //页面显示
                        that.trigger('load',{
                            data_url:'/wapCashier/json/otherWay.php'  
                        });                    
                        $(that.domContext).attr({checked:true});
                        var showTxtUse = Handlebars.compile(that.data_model.showTxt.use); 
                        showTxtUse = showTxtUse({payAmount:payAmount});
                        console.log(showTxtUse);
                        $(that.domContext).closest('label').find('span').text(showTxtUse);
                    }
                },
                unuse:function(){
                    var that = this;
                    $('#otherPayMethods').slideUp(300,function(){
                        $('#otherPayMethods').empty();
                    });
                    var plan = that.options.pay.getPlan();
                    plan = _.omit(plan,'otherWayPay');

                    var deltaAmount = that.options.pay.getDeltaAmount(plan);
                    if(deltaAmount>0){
                        setTimeout(function(){$(that.domContext).attr({disabled:false});},0);  
                    }else{
                        setTimeout(function(){$(that.domContext).attr({disabled:true,checked:false});},0);      
                    }
                    that.options.pay.setPlan(plan);

                    $(that.domContext).closest('label').find('span').text(that.data_model.showTxt.unuse);
                },
                'check':function(params){
                    var that = this;
                    that.fireEvent('unuse');
                    if($(that.domContext).attr('checked')){
                        that.fireEvent('use',params);
                    }
                    params.mode == 'active' && setTimeout(function(){that.options.pay.fireEvent('checkPlan','otherWayPay');},0);
                },
                'rotate':function(params){
                    var that = this;
                    that.arrow.rotate((params.deg||0) + 'deg');
                },
                'load':function(params){
                    var that = this;
                    params = params || {};
                    params.data_url && (function(){
                        $.ajax({
                            url:params.data_url,
                            method:'GET',
                            dataType:'json',
                            success:function(data){
                                data = data || {};
                                data.payMethods = data.payMethods || [];
                                $.each(data.payMethods,function(index,method){
                                    var template = that.ui_templates.clone().find('div.payMethod').andSelf();
                                    new ListView(that.ui_templates.clone().find('div.payMethod').andSelf().remove('div.payMethod-body'),{
                                        container : $('#otherPayMethods'),
                                        method : method
                                    });
                                });
                            },
                            complete:function(data){
                                $('#otherPayMethods').slideDown();
                            }
                        });
                    })();
                }                                
            }            
        },
        initialize:function(domContext,options){
            var that = this;

            OtherMethodsModel.superclass.initialize.apply(that,[options]);
            that.ui_templates = $('<div/>').append(that.options.ui_templates.html());
            that.ui_templates = that.ui_templates.clone();

            that.domContext = domContext;
            that.data_model = _.clone(that.options.data_model);

            //to be review and develop
            $('.button-dropdown-skin').live('click',function(){
                $.ajax({
                    url:'/wapCashier/ajax_processor.json',
                    method:'GET',
                    dataType:'json',
                    success:function(data){
                        data = data || {};
                        $.each(data.bankList || [],function(index,bank){
                            console.log(bank);
                        });
                    },
                    complete:function(data){
                        console.log('complete');
                    }                                    
                });
            });


            !that.options.pay && console.log('config error');
            $(that.domContext).bind('checkuse',function(e,params){
                !params.behavior && (function(){params.behavior = 'manual'})();
                that.fireEvent('check',params);//主动模式
            }).bind('click',function(){
                $(that.domContext).trigger('checkuse',[{mode:'active'}]);
            }).trigger('checkuse',[{mode:'active'}]);

        }
    });
    module.exports = OtherMethodsModel;
});