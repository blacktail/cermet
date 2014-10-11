define(["handlebars","text!demo/templates/AutoComplete.html","text!demo/templates/DemoTree.html","text!demo/templates/DemoWorkspace.html","text!demo/templates/partials/placeholder.html","text!demo/templates/placeholder.html"], function (Handlebars,arg0,arg1,arg2,arg3,arg4) {
	return {
		"demo/AutoComplete": Handlebars.compile(arg0),
		"demo/DemoTree": Handlebars.compile(arg1),
		"demo/DemoWorkspace": Handlebars.compile(arg2),
		"demo/partials/placeholder": Handlebars.compile(arg3),
		"demo/placeholder": Handlebars.compile(arg4)
	};
});