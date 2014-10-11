define([
	'core',
	'demo/templates'
], function (LM, templates, AutoComplete) {
	return LM.View.extend({
		className: 'page-wrapper',

		template: templates['demo/Buttons'],

		initialize: function () {

		},

		render: function () {
			this.$el.html(this.template());
		}
	});
});
