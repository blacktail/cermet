define([
    './router',
    'backbone'
], function (Router, Backbone) {
    new Router();

    Backbone.history.start();
});
