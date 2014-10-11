/**
 * @name AutoComplete
 * @description a comboBox that you can filter the select by your input and read the data from remote
 */
define([
	'lodash',
	'utils',
	'core',
	'jquery',
	'commons/3rdparty/jquery-ui/autocomplete'
], function (_, utils, LM, $) {
	return LM.View.extend({
		el: null,

		defaultOptions: {
			resultsLimit: 15,
			defaultAll: false,
			queryParam: 'query',
			filedName: 'query',
			ignoreStar: false,
			filter: {},
			valueField: null,       // specify a field to receive the real value
			isRest: true            // default to support rest apis
		},

		initialize: function (options) {
			var that = this;

			options = options || {};

			_.defaults(options, this.defaultOptions);

			this.$el.autocomplete({
				minLength: 0,
				create: function (event, ui) {
					$(this).bind('click', function () {  //to support click to show when there is no input
						$(this).autocomplete('search', '');
					});
				},

				source: options.source ? options.source : function (request, response) {
					var term = request.term || '';
					var url = that.options.url;

					term = term.trim();

					if (_.isFunction(url)) {
						url = that.options.url();
					}


					var filterStr;
					var paramsData = {size: options.resultsLimit};

					if (options.isRest && options.queryParam != 'query') {
						var filterObject = options.filter || {};
						filterObject[options.queryParam] = '*' + term + '*';

						// because $.ajax will auto encode the url params, so here, we decode it first
						filterStr = decodeURIComponent(utils.getFilterStr(filterObject));

						paramsData.filter = filterStr;
					} else {
						paramsData[options.queryParam] = term;
					}

					LM.rajax({
						url: url,
						data: paramsData,
						success: function (j) {
							var results = _.isArray(j.data) ? j.data : j.data.items;

							if (options.defaultAll) {
								var tmp = {};
								tmp[options.queryParam] = '(all)';

								if (options.valueField) {
									tmp[options.valueField] = 'all';
								}

								results.splice(0, 0, tmp);
							}

							response(results);
						}
					});
				},
				select: function (event, ui) {
					var uiValue = ui.item[options.fieldName] ? ui.item[options.fieldName] : (ui.item[options.queryParam] ?
						ui.item[options.queryParam] : (ui.item.label || ui.item.displayedAs || ui.item.name));

					if (options.ignoreStar && uiValue === '(all)') {
						$(this).val('');
					} else if (uiValue === '(all)') {
						$(this).val('*');
					} else {
						$(this).val(uiValue);
					}

					if (options.valueField) {
						$(this).data('select-value', ui.item[options.valueField]);
					}

					if (options.select) {
						options.select(event, ui, $(this));
					}

					that.$el.trigger('change');

					return false;
				}
			}).data('ui-autocomplete')._renderItem = function (ul, item) {
				var itemText = item[options.fieldName] ? item[options.fieldName] : (item[options.queryParam] ?
					item[options.queryParam] : (item.label || item.displayedAs || item.name));

				return $('<li>')
					.append('<a href="javascript:;">' + itemText + '</a>')
					.appendTo(ul);
			};
		},

		remove: function () {
            try{
                this.$el.autocomplete('destroy');
            } catch (e){
                console.log(e.message);
            }
            this.stopListening();
		}
	});
});


