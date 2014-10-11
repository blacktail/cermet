/**
 * Create a global namespace 'LM', all global variables should put into this namespace
 */
define([
	'jquery',
	'b2',
    'lodash',
    'utils',
    'es5-shim'
], function($, B2, _, utils) {

    /**
     * localStorage namespace define:
     * localStorage.lm           global
     * localStorage.demo         demo page
     */
	var localStorage = {};

	try {
		localStorage = window.localStorage;
	} catch(e) {
	}

    var LM = window.LM || {
        localStorage: localStorage
     };

	LM.utils = utils;

    /**
     * We are JSP shop so the default underscore interpolate separator "<%=" and
     * evaluate separator "<%" don't work. This code below set them to "{{=" and
     * "{{", respectively.
     */
    _.templateSettings = {
        interpolate: /\{\{\=(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };

    /**
     * Enter keycode
     */
    LM.ENTER_KEY = 13;
    LM.TAB_KEY   = 9;


	/**
	 * Define LM.Model as the base model for all models
	 */
    LM.Model = B2.Model.extend({
	    parse: function (response) {
		    if (response.status != void 0 && response.data) {
			    return response.data;
		    } else {
			    return response;
		    }
	    },

	    save: function (key, val, options) {
		    var opts = options || {};

		    // Handle both `"key", value` and `{key: value}` -style arguments.
		    if (key == null || typeof key === 'object') {
			    opts = val || {};
		    }

		    if (!opts.error) {
			    opts.error = function (model, response, options) {
				    require(['lmmsgbox'], function (MessageBox) {
					    MessageBox.alert( 'Error - status(' + response.status  + ')<br> errmsg:' + response.errmsg);
				    });
			    };
		    }

		    this._super(key, val || opts, opts);
	    },

	    destroy: function (options) {
		    options = options ? _.clone(options) : {};

		    if (!options.error) {
			    options.error = function (model, response, options) {
				    require(['lmmsgbox'], function (MessageBox) {
					    MessageBox.alert( 'Error - status(' + response.status  + ')<br> errmsg:' + response.errmsg);
				    });
			    };
		    }

		    this._super(options);
	    }
    });

	/**
	 * Define LM.Collection as the base collection for all collections
	 */
    LM.Collection = B2.Collection.extend({
        parse: function (response) {
            if (response.status != void 0) {
                if (response.data && response.data.items)  {
                    return response.data.items || [];
                } else {
                    return response.data || [];
                }
            } else {
                return response;
            }
        }
    });

	/**
     * LM.View extends B2.View. All views & widgets have to
     * extends LM.View rather than Backbone.View.
     *
	 * LM.View has the app features, it can be used to manage sub views automatically
	 * to register a sub view, use "registerComponent"
	 * to listen the events of the sub view, use "appEvents"
	 * to get a registered component, use "getComponent"
     */
	LM.View = B2.View.extend({
	});


    //avoid console function throw error in IE
	(function () {
        var con = window.console;
        if (con !== undefined && con.log !== undefined) {
            return;
        }
        var noop = function () {
        };
        var methods = ['assert', 'clear', 'count', 'debug', 'dir',
            'dirxml', 'error', 'exception', 'group', 'groupCollapsed',
            'groupEnd', 'info', 'log', 'markTimeline', 'profile',
            'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd',
            'timeStamp', 'trace', 'warn'
        ];
        var length = methods.length;
        var console = window.console = {};
        while (length--) {
            console[methods[length]] = noop;
        }
    })();

	$.fn.hasScrollBar = function () {
		//scrollHeight = topPadding + bottomPadding + contentHeight
		//innerHeight = topPadding + bottomPadding + contentHeight
		return this.prop('scrollHeight') > this.innerHeight();
	};

	window.LM = LM;

    return LM;
});
