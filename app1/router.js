define([
    'backbone',
    './views/workspace'
], function (Backbone, Workspace) {
    return Backbone.Router.extend({
        routes: {
            '(tab=:tab)': 'showWorkspace',
			'*any': 'redirect'
        },

        initialize: function () {

        },

        showWorkspace: function (tab) {
			tab = tab || 'task';

            if (this.workspace) {
                this.workspace.remove();
            }

            this.workspace = new Workspace({
                tab: tab
            });

			$('#main').append(this.workspace.$el);
			this.workspace.render();
        },

		redirect: function (any) {
			console.log(any);

			this.showWorkspace();
		}
    });
});
