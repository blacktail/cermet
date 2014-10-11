define(["handlebars","text!demo/templates/AutoComplete.html","text!demo/templates/Buttons.html","text!demo/templates/DemoTree.html","text!demo/templates/DemoWorkspace.html","text!demo/templates/partials/placeholder.html","text!demo/templates/placeholder.html"], function (Handlebars,arg0,arg1,arg2,arg3,arg4,arg5) {
	return {
		"demo/AutoComplete": Handlebars.compile(arg0),
		"demo/Buttons": Handlebars.compile(arg1),
		"demo/DemoTree": Handlebars.compile(arg2),
		"demo/DemoWorkspace": Handlebars.compile(arg3),
		"demo/partials/placeholder": Handlebars.compile(arg4),
		"demo/placeholder": Handlebars.compile(arg5)
	};
});