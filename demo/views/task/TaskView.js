define([
	'cmcore',
	'app1/templates',
	'./TaskListView'
], function (CM, templates, TaskListView) {
	return CM.View.extend({
		template: templates['app1/task/Task'],

		appEvents: {
		},

		initialize: function () {

		},

		render: function () {
			this.$el.html(this.template());

			this.registerComponent('sub', new TaskListView(), '#task-list-con');
		}
	});
});

