/* route.js */
define(function(require, exports, module) {
    var $ = require('jquery'), 
        _ = require('underscore'),
        Backbone = require('backbone');    
    var Router = Backbone.Router.extend({
        routes: {
            "orderId=:orderId&awid=:awid#help"         :         "help",
            "download/*path":     "download",
            "folder/:name":       "openFolder",
            "folder/:name-:mode": "openFolder"
        },
        help: function(orderId,awid) {
            console.log(orderId);
            console.log(help);
        }, 
        initialize: function(){
            var that = this;
        }
    });
    module.exports = Router;
});