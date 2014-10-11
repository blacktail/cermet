define([
	'lodash',
	'core',
	'commons/logicmonitor/controls/templates',
	'commons/3rdparty/jquery-ui/effect-slide'
], function (_, LM, templates) {
	return LM.View.extend({
		className: 'lm-filter-bar',

		template: templates['commons/logicmonitor/controls/FilterBar'],

		events: {
			'click .del': '_onDelete'
		},

		appEvents: {
			'filter:change filterDropDown': '_onFilterChange',
			'beforeShow filterDropDown': '_showFocusStatus',
			'hide filterDropDown': '_hideFocusStatus'
		},

		initialize: function (options) {
			// the label for the filter bar
			this.filterLabel = options.filterLabel;

			// the defaultText is used to determine the active status and used to show when the filter text is empty
			this.defaultText = typeof options.defaultText == 'undefined' ? 'All' : options.defaultText;

			// the initial filter text when the filter bar is created
			this.initText = typeof options.initText == 'undefined' ?  'All' : options.initText;

			// the inital filter value when the filter bar is created
			this.initValue = options.initValue || '';

			// the dropdown class used when the user click the filter bar
			this.dropDownClass = options.dropDownClass;

			// the dropDownOptions passed to the dropdown
			this.dropDownOptions = options.dropDownOptions || {};

			this.dropDownOptions.templateData = _.defaults(this.dropDownOptions.templateData || {}, {
				prefix: _.uniqueId('filterbar')
			});

			this.removable = options.removable || false;

			// control if hide the filter label when the filter is in active status
			this.hideActiveLabel = options.hideActiveLabel;

		},

		render: function () {
			this.$el.html(this.template({
				filterLabel: this.filterLabel,
				initText: this.initText,
				removable: this.removable
			}));

			if (this.hideActiveLabel) {
				this.$el.addClass('hide-active-label');
			}

			this.registerComponent('filterDropDown', new this.dropDownClass(_.extend(this.dropDownOptions, {
				triggerEl: this.$el
			})));
		},

		_onFilterChange: function (filterText, filterValue, $ui) {
			this.filterText = filterText;
			this.filterValue = filterValue;
			this.$('.filter-text').text(filterText || this.defaultText);
			this.trigger('filter:change', filterValue, $ui);

			this._refreshActiveStatus();
		},

		_showFocusStatus: function () {
			this.$el.addClass('focus');
		},

		_hideFocusStatus: function () {
			this.$el.removeClass('focus');
		},

		_refreshActiveStatus: function () {
			this._toggleActiveStatus(this.filterText != this.defaultText);
		},

		_toggleActiveStatus: function (active) {
			this.$el.toggleClass('active', active);
		},

		_onDelete: function (e) {
			e.stopPropagation();
			var that = this;

			this.clearFilter();

			this.$el.hide('slide',{
				direction:'left',
				duration: 'fast',
				complete: function () {
					that.remove();
				}
			});
		},

		clearFilter: function () {
			this.getComponent('filterDropDown').clearFilter();
		}
	});
});
