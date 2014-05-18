define([
    'jquery',
    'lodash',
    'cmcore',
	'app1/templates'
], function ($, _, CM, templates) {
    return CM.View.extend({

		template: templates['app1/Workspace'],

		initialize: function (options) {
			this.activeTab = options.tab;
		},

		render: function () {
			this.freeChildren();

			this.$el.html(this.template({
				active: this.activeTab
			}));
		}
    });
});
