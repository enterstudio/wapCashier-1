/* orderDetail.js */
define(function(require, exports, module) {
    var Class = require('class');
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone');
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    var Arrow = require('http://localhost:8000/wapCashier/js/ui/arrow');
    var OrderDetailModel = BaseModel.extend({
        initialize:function(owner,options){
            var that = this;
            that.owner = owner;
            OrderDetailModel.superclass.initialize.apply(that);
            that.arrow = new Arrow($('#orderDetail-trigger').get(0));
            $(that.arrow.canvas).toggle(function(){
                that.owner.find('.orderDetail').slideDown('slow',function(){
                    that.arrow.fireEvent('rotate','-180deg'); 
                });
            },function(){
                that.owner.find('.orderDetail').slideUp('slow',function(){
                    that.arrow.fireEvent('rotate','0deg'); 
                });   
            });
        }
    });
    module.exports = OrderDetailModel;
});