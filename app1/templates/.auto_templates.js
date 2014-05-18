define(["handlebars","text!app1/templates/Case.html","text!app1/templates/Configuration.html","text!app1/templates/Plugin.html","text!app1/templates/ResourceBrowser.html","text!app1/templates/ResourceHost.html","text!app1/templates/Workspace.html","text!app1/templates/partials/placeholder.html","text!app1/templates/task/Task.html","text!app1/templates/task/TaskList.html"], function (Handlebars,arg0,arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8) {
	return {
		"app1/Case": Handlebars.compile(arg0),
		"app1/Configuration": Handlebars.compile(arg1),
		"app1/Plugin": Handlebars.compile(arg2),
		"app1/ResourceBrowser": Handlebars.compile(arg3),
		"app1/ResourceHost": Handlebars.compile(arg4),
		"app1/Workspace": Handlebars.compile(arg5),
		"app1/partials/placeholder": Handlebars.compile(arg6),
		"app1/task/Task": Handlebars.compile(arg7),
		"app1/task/TaskList": Handlebars.compile(arg8)
	};
});