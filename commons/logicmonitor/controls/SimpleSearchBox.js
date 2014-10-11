/**
 * SimpleSearchBox
 * trigger the simple search with the given query
 *       new SimpleSearchBox({
 *           container: '#reportSimpleSearch',
 *           placeholder: 'Search Report',
 *           query: ''
 *       });
 *
 * @event search(String query)
 */
define([
    'jquery',
    'core',
    'lodash',
    'commons/logicmonitor/controls/templates'
], function($, LM, _, templates) {
    return LM.View.extend({
        className: 'simple-search-box',

        template: templates['commons/logicmonitor/controls/SimpleSearchBox'],

        events: {
            'click .clear-handle':    '_onClearQuery',
            'keyup input': '_onChangeQuery'
        },

        initialize: function () {
            this.query = this.options.query || '';

            this.render();
        },

        render: function () {
            this.$el.html(this.template({
                query: this.query,
                placeholder: this.options.placeholder || ''
            }));

	        this._processClearHandle();
        },

        _onChangeQuery: function(e) {
            var queryString = $.trim(this.$('input').val());

            if (e.keyCode === LM.ENTER_KEY) {
                this.query = this.$('input').val().trim();
                this._beginSearch();
            } else {
                if (this.query !== queryString) {
                    this.query = queryString;
                    this._beginSearch();
                }
            }

            this._processClearHandle();
        },

        _onClearQuery: function() {
            this.$('input').val('');

            if (this.query !== '') {
                this.query = '';
                this._beginSearch();
            }

            this._processClearHandle();
        },

        _beginSearch: _.debounce(function () {
            this.trigger('search', this.query);

            if (this.options.onSearch) {
                this.options.onSearch(this.query);
            }
        }, 400),

        setQuery: function(queryString) {
            if(queryString) {
                this.$('input').val(queryString);
                this.query = queryString;

                this._processClearHandle();
            }
        },

        _processClearHandle: function() {
            if (this.$('input').val()) {
                this.$el.addClass('active');
            } else {
                this.$el.removeClass('active');
            }
        }
    });
});
