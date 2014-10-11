define([
	'jquery',
	'backbone',
    './views/DemoWorkspaceView'
], function ($, Backbone, DemoWorkspaceView) {

	return Backbone.Router.extend({
		routes: {
			'(*module)': 'showWorkspace'
		},

		initialize: function () {
		},

		showWorkspace: function (module) {
			module = module || '';

			if (this.appView) {
				this.appView.remove();
			}

			this.appView = new DemoWorkspaceView({
				module: module
			});
			$('.workspace-con').append(this.appView.el);
			this.appView.render();
		}
	});
});
