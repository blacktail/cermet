define(["handlebars","text!commons/logicmonitor/templates/TopNavBar.html","text!commons/logicmonitor/templates/partials/placeholder.html"], function (Handlebars,arg0,arg1) {
	return {
		"commons/logicmonitor/TopNavBar": Handlebars.compile(arg0),
		"commons/logicmonitor/partials/placeholder": Handlebars.compile(arg1)
	};
});