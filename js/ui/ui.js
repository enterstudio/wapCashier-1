/* arrow.js */
define(function(require, exports, module) {
    var Class = require('class');
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone');
	var Arrow = Class.create({
		options:{

		},
		rotate:function(deg){
			var that = this;
			//反转180度
            that.canvas.style.webkitTransform = 'rotate(' + deg + ')';
		},
		initialize:function(){
			var that = this;
            that.iArrows = $('.i-arrow');
            $.each(that.iArrows,function(key,item){
                console.log(item);
            });
            console.log(hat.iArrows);


            /*
			that.canvas = $('#payTypeMenuIcon').get(0),
			that.canvas.context = that.canvas.getContext('2d'),
			that.canvas.arcColor = '#8192ab';
            //绘制圆
            that.canvas.context.beginPath();
            that.canvas.context.arc(that.canvas.width/2,that.canvas.height/2,10,0,2*Math.PI,false);
            that.canvas.context.fillStyle = that.canvas.arcColor;
            that.canvas.context.fill();
            //绘制左箭头
            that.canvas.context.beginPath();
            that.canvas.context.translate(that.canvas.width/2+1,that.canvas.height/2);
            that.canvas.context.rotate(Math.PI/4);
            that.canvas.context.fillStyle = '#fff';
            that.canvas.context.fillRect(-5,1,7,2);
            //绘制右箭头
            that.canvas.context.rotate(Math.PI/-2);
            that.canvas.context.fillStyle = '#fff';
            that.canvas.context.fillRect(-3,0,7,2);
             */
		}
	});
	module.exports = Arrow;
});