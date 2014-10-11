define(["handlebars","text!demo/templates/DemoTree.html","text!demo/templates/DemoWorkspace.html","text!demo/templates/partials/placeholder.html","text!demo/templates/placeholder.html"], function (Handlebars,arg0,arg1,arg2,arg3) {
	return {
		"demo/DemoTree": Handlebars.compile(arg0),
		"demo/DemoWorkspace": Handlebars.compile(arg1),
		"demo/partials/placeholder": Handlebars.compile(arg2),
		"demo/placeholder": Handlebars.compile(arg3)
	};
});