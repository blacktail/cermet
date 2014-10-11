define([
	'lodash',
	'core',
	'jquery',
	'lmdropdown',
	'commons/logicmonitor/controls/templates',
	'lmautocomplete'
], function(_, LM, $, DropDown, templates, AutoComplete) {

	var AutoCompleteDropDown = DropDown.extend({
		className: 'lm-dropdown lm-filter-autocomplete-dropdown',

		template: templates['commons/logicmonitor/controls/filterbar/AutoCompleteDropDown'],

		events: {
			'click .add-filter-item': '_onAddFilterItem',
			'click .filter-item .del': '_onDeleteFilterItem'


		},

		zeroIsAll: true,
		allText: 'All',

		initialize: function(options) {
			this.$el.width(options.width || 245 );

			// zeroIsAll defines if the user select nothing, should we take it equal to select all?
			this.zeroIsAll = typeof options.zeroIsAll == 'undefined' ? this.zeroIsAll : options.zeroIsAll;

			// allText defines the text when the user select all
			this.allText = options.allText || this.allText;

			// appendTo is used to control which element to append for the auto complete dropdown
			this.appendTo = options.appendTo || document.body;

			// autoCompleteParams will be passed through to the auto complete control
			this.autoCompleteParams = options.autoCompleteParams;

			// textPlaceHolder is used to display as the placeholder of the auto complete text input
			this.textPlaceHolder = options.textPlaceHolder || this.allText;

			this.initFilters = options.initFilters || [];

			this._super(options);

			this.render();
		},

		_onClickRadio: function (e) {
		},

		render: function(params) {
			var that = this;
			var acParams = this.autoCompleteParams;

			this.$el.html(this.template({
				textPlaceHolder: this.textPlaceHolder,
				initFilters: this.initFilters
			})).appendTo(this.appendTo);

			this.registerComponent('auto', new AutoComplete(_.extend({
				el: this.$('.styled-lookup input'),
				queryParam: acParams.queryParam || 'query',
				select: function (event, ui, $el) {
					that._addSelection($el.val());
					$el.val('');
				}
			}, acParams)));

			// By default, we will trigger filter change event for the selected controls
			if (!this.silentInit) {
				_.defer(function () {
					if (that.$('.filter-item').length > 0) {
						that._doFilterChange();
					}
				});
			}
		},

		_addSelection: function (selectionValue) {
			this.$('.selected-con').append('<div class="filter-item"><span class="filter-item-text">' + selectionValue +
				'</span><span class="icons16 roundCancel-gray del"></span></div>');

			this._doFilterChange();

		},

		_onAddFilterItem: function () {
			var $input = this.$('.styled-lookup input');
			var value = $.trim($input.val());

			this._addSelection(value);
			$input.val('');
		},

		_onDeleteFilterItem: function (e) {
			$(e.target).closest('.filter-item').remove();

			this._doFilterChange();

		},

		_doFilterChange: function () {
			var filterText = this._getFilterText();
			var filters = this._getFilters();

			if (this.zeroIsAll && filters.length === 0) {
				filterText = this.allText;
			}

			this.trigger('filter:change', filterText, filters);
		},

		_getFilterText: function () {
			var textArray = [];

			this.$('.filter-item-text').each(function () {
				textArray.push($(this).text());
			});

			return textArray;
		},

		_getFilters: function () {
			var filters = [];
			var useValueField = !!this.autoCompleteParams.valueField;

			this.$('.filter-item-text').each(function () {
				filters.push(useValueField ? $(this).data('select-value') : $(this).text());
			});

			return filters;
		},

		clearFilter: function () {
			this.$('.selected-con').html('');

			this._doFilterChange();
		}
	});

	return AutoCompleteDropDown;
});
