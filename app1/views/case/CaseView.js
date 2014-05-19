define([
	'cmcore',
	'app1/templates'
], function (CM, templates) {
	return CM.View.extend({
		template: templates['app1/case/Case'],

		initialize: function () {

		},

		render: function () {
			this.$el.html(this.template());
		}
	});
});

