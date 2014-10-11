define([
	'core',
	'demo/templates',
	'lmautocomplete'
], function (LM, templates, AutoComplete) {
	return LM.View.extend({
		className: 'page-wrapper',

		template: templates['demo/AutoComplete'],

		initialize: function () {

		},

		render: function () {
			this.$el.html(this.template());

			// the demo for the autocomplete control
			this.registerComponent('autoStatic', new AutoComplete({
				el: this.$('#auto-comp-static'),
				source: [
					'auto1',
					'auto2',
					'auto3'
				],
				select: function(event, ui, $el){
					console.log('select');
				}
			}));
		}
	});
});
