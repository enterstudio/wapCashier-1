/**
 * wapCashierBase.js
 * 银行卡支付模型bankcardPay.js
 */
define(function(require, exports, module) {
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone'),
        Handlebars = require('handlebars');    
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    var Discount = require('http://localhost:8000/wapCashier/js/model/discount');
    var MoneyModel = require('http://localhost:8000/wapCashier/js/model/money');
    var LoadPayMethodModel = require('http://localhost:8000/wapCashier/js/model/loadPayMethod');
    var WapCashierBase = BaseModel.extend({
        initialize:function(options){
        	var that = this;
            WapCashierBase.superclass.initialize.apply(that,[options]);
            that.discount = new Discount();
            that.money = new MoneyModel();
            that.loadPayMethod = new LoadPayMethodModel();
        }
    });
    module.exports = WapCashierBase;
});
