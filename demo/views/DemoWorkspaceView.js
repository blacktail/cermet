define([
	'core',
	'./DemoSidebarView',
	'demo/templates',
	'./sub'
], function (LM, DemoSidebarView, templates, subViewClasses) {

	return LM.View.extend({
		className: 'workspace',

		template: templates['demo/DemoWorkspace'],

		events: {
		},

		appEvents: {
			'menu:selected sidebar': '_onSidebarMenuSelected',
			'resize sidebar': '_onSidebarResize'
		},

		initialize: function (options) {
			this.module = options.module;
		},

		render: function () {
			var module = this.module;

			this.$el.html(this.template());

			// register sidebar
			this.registerComponent('sidebar', new DemoSidebarView({
				module: module
			}), '.sidebar-con');

			this._registerMainContentView(module);
		},

		_onSidebarMenuSelected: function (module) {
			this._registerMainContentView(module);
		},

		_registerMainContentView: function (module) {
			var SubView = subViewClasses[module];

			if (!SubView) {
				console.log ('not implemented yet, for the module', module);
				return;
			}

			// register maincontent subview
			this.registerComponent('main', new SubView({
				module: module
			}), '.main-con');
		},

		_onSidebarResize: function () {
			this.adjustMainBox();
		},

		adjustMainBox: function () {
			var sidebarWidth = this.$('.sidebar-con').prop('offsetWidth');

			this.$('.main-con').css('paddingLeft', sidebarWidth);
		}
	});
});
