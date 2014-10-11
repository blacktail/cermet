define([
    'cmcore',
	'app1/templates',
	'./task/TaskView',
	'./resource-host/ResourceHostView',
	'./resource-browser/ResourceBrowserView',
	'./case/CaseView',
	'./configuration/ConfigurationView',
	'./plugin/PluginView'
], function (CM, templates, TaskView, ResourceHostView, ResourceBrowserView,
	CaseView, ConfigurationView, PluginView) {

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

			var SubView;
			switch(this.activeTab) {
				case 'task':
					SubView = TaskView;
					break;
				case 'resource-host':
					SubView = ResourceHostView;
					break;
				case 'resource-browser':
					SubView = ResourceBrowserView;
					break;
				case 'case':
					SubView = CaseView;
					break;
				case 'configuration':
					SubView = ConfigurationView;
					break;
				case 'plugin':
					SubView = PluginView;
					break;
				default:
					SubView = TaskView;
			}

			this.registerComponent('sub', new SubView(), '#main-content');
		}
    });
});

