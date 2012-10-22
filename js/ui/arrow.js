/* arrow.js */
/*
    draw arrow and add arrow events
 */
define(function(require, exports, module) {
    var Class = require('class');
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone');
    var BaseModel = require('http://localhost:8000/wapCashier/js/model/base');
    var Arrow = BaseModel.extend({
        options:{
            patterns:[function(){
                //绘制圆
                var that = this;
                that.canvas.context = that.canvas.getContext('2d');
                that.canvas.arcColor = '#8192ab';
                that.canvas.context.beginPath();
                that.canvas.context.arc(that.canvas.width/2,that.canvas.height/2,10,0,2*Math.PI,false);
                that.canvas.context.fillStyle = '#8192ab';
                that.canvas.context.fill();
            },function(){
                var that = this;
                 //绘制左箭头
                that.canvas.context.beginPath();
                that.canvas.context.translate(that.canvas.width/2+1,that.canvas.height/2);
                that.canvas.context.rotate(Math.PI/4);
                that.canvas.context.fillStyle = '#000';
                that.canvas.context.fillRect(-5,1,7,2);
                //绘制右箭头
                that.canvas.context.rotate(Math.PI/-2);
                that.canvas.context.fillStyle = '#000';
                that.canvas.context.fillRect(-3,0,7,2);                  
            }],
            events:{
                'rotate':function(deg){
                    var that = this;
                    that.rotate(deg);
                }
            }
        },
        rotate:function(deg){
            var that = this;
            $(that.canvas).css({
                '-o-transform': 'rotate(' + deg + ')', /* Opera浏览器 */
                '-webkit-transform':'rotate(' + deg + ')', /* Webkit内核浏览器 */
                '-moz-transform': 'rotate(' + deg + ')' /* Firefox浏览器 */
            });
        },
        draw:function(patterns){
            var that = this;
            patterns = patterns || {};
            that.canvas.context = that.canvas.getContext('2d');
            $.each(patterns,function(key,pattern){
               !!pattern && 'function' == typeof(pattern) && pattern.apply(that);
            });            
        },
        initialize:function(canvas,options){
            var that = this;
            Arrow.superclass.initialize.apply(that);
            that.canvas = canvas;
            that.setOptions(options);
            that.addEvents(that.options.events||{});
            that.draw(that.options.patterns);
        }
    });
	module.exports = Arrow;
});