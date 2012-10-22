/* payMethod.js */
define(function(require, exports, module) {
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone'),
        Handlebars = require('handlebars'),
        Json = require('json');    
    var PayMethodsModel = BaseModel.extend({
        options:{
            payMethodModels:{
                'CouponPay':function(owner){
                    return new CouponPay(owner,{
                        init:function(){
                            var that = this;
                        }
                    });
                },
                'PointPay':function(owner){
                    return new PointPay(owner,{
                        init:function(){
                            var that = this;
                        }
                    });
                },
                'BalancePay':function(owner){
                    return new BalancePay(owner,{
                        init:function(){
                            var that = this;
                        }
                    });
                },
                'BankcardPay':function(owner){
                    return new BankcardPay(owner,{
                        init:function(){
                            var that = this;
                        }
                    });
                }
            }
        },
        initialize:function(options){
            var that = this;
            PayMethodsModel.superclass.initialize.apply(that);
        }
    });
    module.exports = PayMethodsModel;
});
