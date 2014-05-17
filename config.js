require.config({
    urlArgs: 'v=',
	baseUrl: '/',
	waitSeconds: 0,
	packages: ['commons/cermet/templates', 'app1/templates'],
	paths: {
        'commons/cermet/partials_compiled': 'commons/cermet/templates/.auto_partials',
        'commons/cermet/templates_compiled': 'commons/cermet/templates/.auto_templates',
        'app1/partials_compiled': 'app1/templates/.auto_partials',
        'app1/templates_compiled': 'app1/templates/.auto_templates',

		'cmcore': 'commons/cermet/core/core',
		'cmutils': 'commons/cermet/core/utils',

        /* 3rd party libs*/
		'handlebars': 'commons/3rdparty/handlebars/handlebars-v1.3.0',
        'lodash': 'commons/3rdparty/lodash',
        'backbone': 'commons/3rdparty/backbone',
        'jquery': 'commons/3rdparty/jquery-2.1.1',
        'bootstrap': 'commons/3rdparty/bootstrap'
	},
	shim: {
        'handlebars': {
            exports: 'Handlebars'
        },
        'bootstrap': ['jquery']
	},
	map: {
		'*': {
			'underscore': 'lodash'
		}
	}
});

