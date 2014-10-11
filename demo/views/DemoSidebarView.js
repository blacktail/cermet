define([
	'core',
	'lmsidebar',
	'./DemoTreeView'
], function (LM, LMSidebar, DemoTreeView) {

	return LMSidebar.extend({
		storagePrefix: 'demo',

		initialize: function (options) {
			this.module = options.module;

			this._super(options);
		},

		render: function () {
			// call base class method
			this._super();

			this.registerComponent('tree', new DemoTreeView({
				module: this.module
			}), '.side-con');
		}
	});

});