/**
 * sub package
 */
define([
    './AutoCompleteView',
	'./ButtonsView'
], function (AutoCompleteView, ButtonsView) {

    return {
        'auto-complete': AutoCompleteView,
	    'buttons': ButtonsView
    };
});
