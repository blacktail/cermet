define([
	'lodash',
	'core',
	'jquery',
	'lmdropdown'
], function(_, LM, $, DropDown) {

	var CheckboxDropDown = DropDown.extend({

		className: 'lm-dropdown lm-filter-checkbox-dropdown',

		events: {
			'click input[type="checkbox"]': '_onClickCheckBox'
		},

		zeroIsAll: true,
		allText: 'All',

		initialize: function(options) {
			if(!options.template) {
				throw new Error('You must specify a template for dropdown menu.');
			}
			this.$el.width(options.width || 210 );
			this.template = options.template;
			this.templateData = options.templateData || {};
			this.zeroIsAll = typeof options.zeroIsAll == 'undefined' ? this.zeroIsAll : options.zeroIsAll;
			this.allText = typeof options.allText == 'undefined' ? this.allText : options.allText;
			this.appendTo = options.appendTo || document.body;
			this.ignoreEmpty = options.ignoreEmpty || false;

			this._super(options);

			this.render();
		},

		_onClickCheckBox: function (e) {
			e.stopPropagation();

			this._doFilterChange($(e.target));
		},

		_doFilterChange: function (target) {
			var filters = this._getFilters();
			var textArr = _.pluck(filters, 'text');

			if (this.ignoreEmpty) {
				textArr = _.compact(textArr);
			}

			var filterText = textArr.join(',');

			if ((this.zeroIsAll && filters.length === 0) || (filters.length > 0 && filters.length == this.$('input[type="checkbox"]').length)) {
				filterText = this.allText;
			}

			this.trigger('filter:change', filterText, filters, target);
		},

		_getFilters: function () {
			var filters = [];
			var $chkBoxes = this.$('input[type="checkbox"]:checked');

			$chkBoxes.each(function () {
				filters.push({
					name: $(this).data('filter-name'),
					text: $(this).data('filter-text')
				});
			});

			return filters;
		},

		render: function(params) {
			var that = this;
			this.$el.html(this.template(this.templateData)).appendTo(this.appendTo);

			// By default, we will trigger filter change event for the selected controls
			if (!this.silentInit) {
				_.defer(function () {
					if (that.$('input[type="checkbox"]:checked').length > 0) {
						that._doFilterChange(null);
					}
				});
			}
		},

		clearFilter: function () {
			var $chkBoxes = this.$('input[type="checkbox"]:checked');

			$chkBoxes.each(function () {
				$(this).prop('checked', false);
			});

			this._doFilterChange();
		}
	});

	return CheckboxDropDown;
});
