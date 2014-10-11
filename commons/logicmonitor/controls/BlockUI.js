/**
 * @name BlockUI
 * @description a wrapper base on jquery blockUI plug in.
 * @usage BlockUI(options)
 * options: {
     *   message: '',   //string,
     *   $blockEl: [O], //jquery object, default global $
     *   uiOptions: { //blockUI options. @link http://www.malsup.com/jquery/block/#options
 *   }
 * }
 */
define([
	'lodash',
	'core',
	'jquery',
	'commons/logicmonitor/controls/templates',
	'jq-blockUI'
], function (_, LM, $, templates) {
	return LM.View.extend({
		//TODO... need define a professional css
		template: templates['commons/logicmonitor/controls/BlockMessage'],

		_defaultUiOptions: {
			css: {
				border: 'none',
				padding: '5px',
				backgroundColor: '#000',
				'-webkit-border-radius': '10px',
				'-moz-border-radius': '10px',
				opacity: 0.5,
				color: '#fff'
			},
			// styles for the overlay
			overlayCSS:  {
				backgroundColor: '#000',
				opacity:         0.6,
				cursor:          'wait'
			}
		},

		initialize: function(options) {
			this.options.uiOptions = this.options.uiOptions || {};
			this.options.uiOptions.css = this.options.uiOptions.css || {};
			this.options.uiOptions.overlayCSS = this.options.uiOptions.overlayCSS || {};

			_.defaults(this.options.uiOptions.css, this._defaultUiOptions.css);
			_.defaults(this.options.uiOptions.overlayCSS, this._defaultUiOptions.overlayCSS);

			if (this.options.uiOptions.message === void 0 && this.options.message === void 0) {
				this.options.message = 'Please wait...';
			}
		},

		/** options: {
         *   message: 'loading' // string
         *   $blockEl: [O] //jquery object
         *   uiOptions: [O] { //blockUI options. @link http://www.malsup.com/jquery/block/#options
		 */
		block: function(options) {
			options = options || {};
			options.uiOptions = options.uiOptions || {};
			options.uiOptions.css = options.uiOptions.css || {};
			options.uiOptions.overlayCSS = options.uiOptions.overlayCSS || {};

			if (options.uiOptions.message !== void 0) {
				delete this.options.message;
			}

			if (options.uiOptions.onUnblock) {
				delete this.options.onUnblock;
			}

			// merge uiOptions to this.options.uiOptions
			_.extend(this.options.uiOptions.css, options.uiOptions.css);
			delete options.uiOptions.css;

			_.extend(this.options.uiOptions.overlayCSS, options.uiOptions.overlayCSS);
			delete options.uiOptions.overlayCSS;

			_.extend(this.options.uiOptions, options.uiOptions);
			delete options.uiOptions;

			// merge other options to this.options
			_.extend(this.options, options);

			// process message
			if (this.options.message !== void 0) {
				var message = this.options.message;

				this.options.uiOptions.message = message !== null ? this.template({
					message: message
				}) : null;
			}

			// process onUnblock
			var that = this,
				callback = this.options.onUnblock || this.options.uiOptions.onUnblock;

			this.options.uiOptions.onUnblock = function() {
				if (callback) {
					callback();
				}

				that.remove();
			};

			// process blockEl
			if (this.options.hasOwnProperty('$blockEl')) {
				this.options.$blockEl.block(this.options.uiOptions);
			}
			else {
				$.blockUI(this.options.uiOptions);
			}
		},

		unBlock: function() {
			if (this.options.hasOwnProperty('$blockEl')) {
				this.options.$blockEl.unblock(this.options.uiOptions);
			}
			else {
				$.unblockUI(this.options.uiOptions);
			}
		}
	});
});

