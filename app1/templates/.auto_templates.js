define(["handlebars","text!app1/templates/Workspace.html","text!app1/templates/partials/placeholder.html"], function (Handlebars,arg0,arg1) {
	return {
		"app1/Workspace": Handlebars.compile(arg0),
		"app1/partials/placeholder": Handlebars.compile(arg1)
	};
});