define([
    'backbone',
    './views/workspace'
], function (Backbone, Workspace) {
    return Backbone.Router.extend({
        routes: {
            '(tab=:tab)': 'showWorkspace'
        },

        initialize: function () {

        },

        showWorkspace: function (tab) {
            if (this.workspace) {
                this.workspace.remove();
            }

            this.workspace = new Workspace({
                tab: tab
            });

			$('#main').append(this.workspace.$el);
			this.workspace.render();
        }
    });
});
