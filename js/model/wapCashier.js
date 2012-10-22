/* wapCashier.js */
/**
 * wapCashier开发小结
 * 收银台主要关注2个问题：需要支付多少钱，如何支付这笔钱
 * 哪些因素会影响到需要支付总金额
 * 哪些因素会改变支付的方案
 */
define(function(require, exports, module) {
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone'),
        Handlebars = require('handlebars');    
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    //var Router = require('http://localhost:8000/wapCashier/js/router');
    var Pay = require('http://localhost:8000/wapCashier/js/model/pay');
    //var PayMethods = require('http://localhost:8000/wapCashier/js/model/payMethods')
    var OrderDetail = require('http://localhost:8000/wapCashier/js/model/orderDetail');
    
    

    var WapCashierModel = BaseModel.extend({
        options:{
            ui_templates:$('#ui-templates')
        },
        initialize:function(options){
            var that = this;
            WapCashierModel.superclass.initialize.apply(that,[options]);
            /**
             * 付款方式
             */
            var pay = new Pay($('input.pay-Method'));
            /**
             * 订单详情
             */
            var orderDetail = new OrderDetail($('#orderDetail'));
        }
    });
    module.exports = WapCashierModel;
});