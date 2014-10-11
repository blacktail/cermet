/**
 * logicmonitor Dialog control
 */
define([
	'lodash',
	'core',
	'jquery',
	'commons/logicmonitor/controls/templates',
	'commons/3rdparty/jquery-ui/draggable'
], function (_, LM, $, templates) {
	return LM.View.extend({

		className: 'lm-dialog',

		dialogTemplate: templates['commons/logicmonitor/controls/Dialog'],

		// Here, we support use bodyTemplate to render static dialog contents
		bodyTemplate: function () {
			return '';
		},

		bodyData: {},

		footTemplate: function () {
			return '';
		},

		title: 'Hello Dialog',

		titleIcon: 'no-title-icon',

		events: {
			'click a.head-close': '_onClose'
		},

		initialize: function (options) {
			this.width = options.width || this.width;
			this.height = options.height || this.height;
			this.isModal = options.isModal === false ? options.isModal : true;
			this._uniqueNameSpace = _.uniqueId('dialog');
			this._overlayId = this._uniqueNameSpace + '-overlay';
			this.bodyData = _.defaults(options.bodyData || {},  this.bodyData);

			// set proper z-index for the dialog and overlay
			var $dialogs = $('.lm-dialog'),
				maxZIndex = 1000;

			$dialogs.each(function () {
				maxZIndex = Math.max(maxZIndex, $(this).css('zIndex'));
			});

			var diaOptions = {
				title: options.title || this.title,
				titleIcon: options.titleIcon || this.titleIcon
			};

			var cssParams = {
				width: this._addPX(this.width || 400),
				minWidth: this._addPX(options.minWidth || 100),
				maxWidth: this._addPX(options.maxWidth || 1000),
				height: this._addPX(this.height || 'auto'),
				minHeight: this._addPX(options.minHeight || 100),
				maxHeight: this._addPX(options.maxHeight || 'none'),
				zIndex: maxZIndex + 1
			};

			this.$el
				.html(this.dialogTemplate(diaOptions))
				.appendTo('body')
				.css(cssParams);

			if (this.isModal) {
				this.$el.after('<div id="' + this._overlayId + '" class="dialog-overlay"></div>');
				this._bodyOldOverflow = $(document.body).css('overflow');
				$(document.body).css('overflow', 'hidden'); //for modal style
				this.$el.next('.dialog-overlay').css('zIndex', maxZIndex);
			}

			var me = this;

			$(window)
				.on('resize.' + me.uniqueNameSpace, $.proxy(this._onWindowResize, this))
				.on('scroll.' + me.uniqueNameSpace, $.proxy(this._onWindowScroll, this));

			$(document).on('keyup.' + me.uniqueNameSpace, function (e) {
				// esc
				if (e.keyCode == 27) {
					me._onClose(e);
				}
			});

			me.$el.draggable({
				handle: '.dialog-head'
			});

			me.render();
		},

		//need overwrite in child class
		render: function () {

			// Here, we support use bodyTemplate to render static dialog contents
			this.$('.dialog-body').html(this.bodyTemplate(this.bodyData || {}));
			this.$('.dialog-foot').html(this.footTemplate(this.footParams || {}));
			this.resetPosition();

			return this;
		},

		_addPX: function (value) {
			return _.isNumber(value) ? value + 'px' : value;
		},

		_onWindowResize: _.throttle(function () {
			this.resetPosition();
		}, 200),

		_onWindowScroll: _.throttle(function () {
			this.resetPosition();
		}, 200),

		resetPosition: function () {
			var windowHeight = $(window).height();
			var windowWidth = $(window).width();

			//50 = 25margin-top + 25margin-bottom
			var headAndFootHeight = this.$('.dialog-head').outerHeight(true) + this.$('.dialog-foot').outerHeight(true);
			var bodyScrollHeight = this.$('.dialog-body').prop('scrollHeight');
			var originElHeight = _.isNumber(this.height) ? this.height : bodyScrollHeight + headAndFootHeight;
			var originElWidth = _.isNumber(this.width) ? this.width : this.$el.prop('scrollWidth');

			var elHeight = Math.min(Math.max(this.$el.height(), originElHeight), windowHeight - 50);
			var elWidth = Math.min(Math.max(this.$el.width(), originElWidth), windowWidth - 50);

			var bodyHeight = elHeight - headAndFootHeight;
			this.$('.dialog-body').height(bodyScrollHeight > bodyHeight ? bodyHeight : bodyScrollHeight);

			this.$el
				.height(elHeight)
				.width(elWidth)
				.offset({
					top: (windowHeight - elHeight) / 2,
					left: (windowWidth - elWidth) / 2
				});

			// compute auto box
			var $dialogBody = this.$('.dialog-body');
			var $autoBox = this.$('.dlg-auto-box');
			$autoBox.css('height', 'auto');
			var autoBoxHeight = $autoBox.height();

			if ($dialogBody.hasScrollBar()) {
				var deltaHeight = $dialogBody.prop('scrollHeight') - $dialogBody.prop('clientHeight') + 2;
				var minHeight = Math.min(80, autoBoxHeight);
				var newAutoBoxHeight = Math.max(minHeight, autoBoxHeight - deltaHeight);

				if (newAutoBoxHeight < autoBoxHeight) {
					$autoBox.height(newAutoBoxHeight);
					$autoBox.prev('.top-border').show();
					$autoBox.next('.bottom-border').show();
				}
			} else {
				$autoBox.prev('.top-border').hide();
				$autoBox.next('.bottom-border').hide();
			}

			this._toggleBorder();

		},

		_toggleBorder: function () {
			var $diaBody = this.$('.dialog-body');
			var scrollHeight = $diaBody.prop('scrollHeight'),
				clientHeight = $diaBody.prop('clientHeight');

			if (scrollHeight <= clientHeight) {
				this.$('.dialog-top-border, .dialog-bottom-border').hide();
			} else {
				this.$('.dialog-top-border, .dialog-bottom-border').show();
			}
		},

		setTitle: function (title) {
			this.$('.head-title-txt').text(title);
		},

		_onClose: function (e) {
			e.preventDefault();
			this.remove();
		},

		close: function () {
			this.remove();
		},

		remove: function () {
			this.trigger('dialog:closing', this);

			$(document).off('keyup.' + this.uniqueNameSpace);
			$(window).off('resize.' + this.uniqueNameSpace + ' scroll.' + this.uniqueNameSpace);

			if (this.isModal) {
				this.$el.next('.dialog-overlay').remove();

				// restore the body overflow style
				$(document.body).css('overflow', this._bodyOldOverflow);
			}

			this._super(arguments);
		}
	});
});