/* wapCashierBase.js */
define(function(require, exports, module) {
    var Class = require('class');
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone');
    var BaseModel = Class.create({
        options:{
            author:'想当当'
        },
        setOptions:function(options){
            var that = this;
            $.extend(true,that.options||{},options||{});
            return that;
        },
        addEvents:function(events){
            var that = this;
            $.each(events,function(event,fn){
                !!event && 'function'==typeof(fn) && that.on(event,fn);          
            });
            return that;
        },
        removeEvent:function(event){
            var that = this;
            that.off('event');
            return that;
        },
        removeEvents:function(){
            var that = this;
            that.off();
            return that;
        },
        fireEvent:function(eventName,args){
            var that = this;
            that.trigger(eventName,args);
            return that;
        },
        initialize:function(options){
            var that = this;
            _.extend(that, Backbone.Events);
            that.setOptions(options);
            that.removeEvents().addEvents(that.options.events || {});     
            //that.options.init && 'function' == typeof(that.options.init) && that.options.init.apply(that,that.options);
            //console.log(that.options);
        }
    });
    module.exports = BaseModel;
});