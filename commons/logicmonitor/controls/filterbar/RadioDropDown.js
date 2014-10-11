define([
	'lodash',
	'core',
	'jquery',
	'lmdropdown'
], function(_, LM, $, DropDown) {

	var RadioDropDown = DropDown.extend({
		className: 'lm-dropdown lm-filter-radio-dropdown',

		events: {
			'click input[type="radio"]': '_onClickRadio'
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
			this.allText = options.allText || this.allText;
			this.appendTo = options.appendTo || document.body;

			this._super(options);

			this.render();
		},

		_onClickRadio: function (e) {
			e.stopPropagation();

			this._doFilterChange();
		},

		_doFilterChange: function () {
			var filters = this._getFilters();
			var filterText = _.pluck(filters, 'text').join(',');

			if ((this.zeroIsAll && filters.length === 0) || filters.length == this.$('input[type="radio"]').length) {
				filterText = this.allText;
			}

			this.trigger('filter:change', filterText, filters);
		},

		_getFilters: function () {
			var filters = [];
			var $radios = this.$('input[type="radio"]:checked');

			$radios.each(function () {
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
			if (!that.silentInit) {
				_.defer(function () {
					if (that.$('input[type="radio"]:checked').length > 0) {
						that._doFilterChange();
					}
				});
			}
		},

		clearFilter: function () {
			var $radios = this.$('input[type="radio"]:checked');


			$radios.each(function () {
				$(this).prop('checked', false);
			});

			this._doFilterChange();
		}


	});

	return RadioDropDown;
});