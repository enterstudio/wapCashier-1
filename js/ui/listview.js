/* listview.js */
define(function(require, exports, module) {
    var Class = require('class');
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone'),
        Handlebars = require('handlebars');
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    var Arrow = require('http://localhost:8000/wapCashier/js/ui/arrow');
    var ListView = BaseModel.extend({
        options:{

        },
        show:function(){

        },
        hide:function(){

        },
        initialize:function(owner,options){
            var that = this;
            ListView.superclass.initialize.apply(that);
            var template = Handlebars.compile(owner.html());
            var data = options.method;
            var html = template(data);
            that.owner = $(html);
            //
            that.owner.find('canvas.i-arrow').length && (function(){
                var arrow = new Arrow(that.owner.find('canvas.i-arrow').get(0));
            })();
            //
            options.container && (function(){
               that.owner.appendTo(options.container); 
            })();
        }
    });
	module.exports = ListView;
});