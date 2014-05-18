define([
	'cmcore',
	'app1/templates'
], function (CM, templates) {
	return CM.View.extend({
		template: templates['app1/Plugin'],

		initialize: function () {

		},

		render: function () {
			this.$el.html(this.template());
		}
	});
});
