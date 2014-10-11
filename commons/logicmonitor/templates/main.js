define([
	'handlebars',
	'./helpers',
	'commons/logicmonitor/partials_compiled',
	'commons/logicmonitor/templates_compiled',
	'lodash'
], function (Handlebars, helpers, partials, templates, _) {
	// register helpers
	_.each(helpers || [], function (helper, name) {
		Handlebars.registerHelper(name, helper);
	});

	return templates;
});
