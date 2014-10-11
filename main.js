define([
	'lodash',
	'b2',
	'jquery',
	'handlebars',
	'core',
	'utils',

	'commons/logicmonitor/views/TopNavBarView',

	'lmsidebar',
	'lmexpandtable',
	'lmdialog',
	'lmformdialog',
	'lmmsgbox',
	'lmdropdown',
	'lmdropdownmenu',
	'lmtable',
	'lmpager',
	'lmcriteriatable',
	'lmsearchbox',
	'lmtooltip',
	'lmautocomplete',
	'lminfotable',
	'lmfilterbar',
	'lmcheckboxdropdown',
	'lmradiodropdown',
	'lmautocompletedropdown',
	'lmblockui'
], function (_, B2, $, Handlebars, LM, utils, TopNavBarView) {
	//require business js code begin
	var page = /\/(.*?)\.html/.exec(window.location.pathname);

	if (!page || !page[1]) {
		alert('The page you are visiting can not be accessible, please check your URL!');
		return;
	}

	page = page[1];

	// initialize the header view
	$('.header-con').append(new TopNavBarView().el);

	// we must use 'switchToPath/index' here for requirejs build optimization
	require([page + '/index'], function () {

	});
	//require business js code end
});
