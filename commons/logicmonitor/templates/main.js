define([
	'handlebars',
	'./helpers',
	'commons/cermet/partials_compiled',
	'commons/cermet/templates_compiled',
	'lodash'
], function (Handlebars, helpers, partials, templates, _) {
	// register helpers
	_.each(helpers || [], function (helper, name) {
		Handlebars.registerHelper(name, helper);
	});

	return templates;
});
