define([
    'lodash',
    'jquery',
    'core',
    'commons/logicmonitor/templates',
    'lmdropdownmenu'
], function (_, $, LM, templates, DropDownMenu) {

    return LM.View.extend({

	    template: templates['commons/logicmonitor/TopNavBar'],

        events: {
        },

        appEvents: {
        },

        initialize: function (options) {
            options = options || {};
	        this.render();
        },

        render: function () {
	        this.$el.html(this.template());
        }

    });
});