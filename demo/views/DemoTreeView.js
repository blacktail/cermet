define([
	'backbone',
	'core',
	'demo/templates'
], function (Backbone, LM, templates) {

	return LM.View.extend({

		className: 'lm-static-tree',

		template: templates['demo/DemoTree'],

		events: {
			'click li a[href]': '_onSelectMenuItem'
		},

		initialize: function (options) {
			this.module = options.module;
		},

		render: function () {
			this.$el.html(this.template({
				module: this.module
			}));

			// scroll the view into the selected menu item
			var $selectedItem = this.$('li.selected');

			if ($selectedItem[0]) {
				$selectedItem[0].scrollIntoView();
			}
		},

		_onSelectMenuItem: function (e) {
			var $anchor = $(e.currentTarget);
			var $li = $anchor.closest('li');

			this.$('li').removeClass('selected');
			$li.addClass('selected');

			// trigger menu:selected event
			// for some browsers(chrome), the $anchor.prop('href') will return the whole url
			// just use attr('href') here
			var module = $anchor.attr('href').replace(/^#/, '');
			this.trigger('menu:selected', module);


			// change browser urls
			Backbone.history.navigate(module);

			return false;
		}
	});
});
