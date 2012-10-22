/* init.js */
define(function(require, exports, module) {
    var Class = require('class');
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone');
    var WapCashierModel = require('http://localhost:8000/wapCashier/js/model/wapCashier');
    var WapCashier = WapCashierModel.extend({
        initialize:function(options){
            var that = this;
            WapCashier.superclass.initialize.apply(that,[options]);
        }
    });
    module.exports = WapCashier;
});