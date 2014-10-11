define([
	'backbone',
	'./router'
], function(Backbone, Router) {
	new Router();
	Backbone.history.start();
});
