/**
 * logicmonitor basic data table
 */
define([
	'lodash',
	'core',
	'commons/logicmonitor/controls/templates',
	'lmpager',
	'lmblockui'
], function (_, LM, templates, Pager, BlockUI) {
	return LM.View.extend({
		className: 'lm-table',
		tagName: 'table',

		events: {
			'click > thead > tr > th.sortable': '_onSort',
            'click th.col-chkbox input': '_onToggleSelectAll',
            'click td.col-chkbox input': '_onClickRowSelection'
		},

		pagerPosition: 'both',

		appEvents: {
			'select topPager': '_onSelectPage',
			'select bottomPager': '_onSelectPage'
		},

		initialize: function (options) {
			options = options || {};

			this.pageSize = options.pageSize || 25;
			this.pageIndex = 1;
			this.sortBy = options.sortBy;
			this.sortDirection = this.sortBy ? options.sortDirection || 'asc' : this.sortDirection;
			this.pagerLabel = options.pagerLabel || '';
			this.pagerPosition = options.pagerPosition || this.pagerPosition;
			this.fullData = this.pageData = options.data;
			this.topPagerCon = options.topPagerCon;
			this.bottomPagerCon = options.bottomPagerCon;

			this.blockUI = new BlockUI({
				$blockEl: $(options.blockEl || this.el)
			});

			if (this.fullData) {
				this.total = this.fullData.length;
			}

			if (this.collection) {
                //TODO: The page will be blocked if open 'Manage Collector' 20 more times
				this.listenTo(this.collection, 'reset', this.render);
			}

			this.refresh();
		},

		render: function () {
			var data;

			if (this.prepareRenderData) {
				data = this.prepareRenderData();
			} else if (this.collection) {
				data = this.collection.toJSON();
			} else if (this.fullData) {
				this._sortData();
				this._updatePageData();
				data = this.pageData;
			}

			data = data || [];

			this.trigger('before:render');
			this.$el.html(this.template(data));
			this.trigger('after:render');

			this._postRender(data);
		},

		_postRender: function (data) {
			if (data.length === 0) {
				this.$el.addClass('empty');
			}

			// init sort status
			var $sortByHeader = this.$('th[data-sort-by=' + this.sortBy + ']');

			$sortByHeader.addClass(this.sortDirection);
			this.$('.data-row:last').addClass('last');

			this._renderPager();
		},

		/**
		 * The Default sort handler
		 *
		 * @param e
		 * @private
		 */
		_onSort: function (e) {
			e.stopPropagation();

			var $header = $(e.currentTarget);
			var sortBy = $header.data('sortBy');
			var direction;

			if ($header.hasClass('asc')) {
				$header.removeClass('asc').addClass('desc');
				direction = 'desc';
			} else {
				$header.removeClass('desc').addClass('asc');
				direction = 'asc';
			}

			this.sortBy = sortBy;
			this.sortDirection = direction;

			this.refresh();
		},

		_getFetchParams: function () {
			var data = {
				size: this.pageSize,
				offset: (this.pageIndex - 1) * this.pageSize
			};

			if (this.sortBy) {
				data.sort = (this.sortDirection === 'desc' ? '-' : '') + this.sortBy;
			}

			return data;
		},

		refresh: function (cb) {
			var that = this;

			this.blockUI.unBlock();
			this.blockUI.block({
				message: 'loading...'
			});

			if (this.collection) {
				this.collection.fetch({
					reset: true,
					data: this._getFetchParams(),
					success: function (collection, response, options) {
						that.total = response.data.total;
						that._renderPager();

						that.blockUI.unBlock();

						if (cb) {
							_.defer(cb);
						}
					},
					error: function () {
						that.blockUI.unBlock();
					}
				});
			} else if (this.fullData) {
				this.total = this.fullData.length;
				this.render();
				this._renderPager();

				that.blockUI.unBlock();

				if (cb) {
					_.defer(cb);
				}
			}
		},

		_sortData: function () {
			if (!this.fullData || !this.sortBy) {
				return;
			}

			var that = this;

			this.fullData.sort(function (prev, next) {
				var sortBy = that.sortBy;
				var prevValue = prev[sortBy];
				var nextValue = next[sortBy];

				if (prevValue < nextValue) {
					return that.sortDirection == 'desc' ? 1 : -1;
				} else if (prevValue > nextValue) {
					return that.sortDirection == 'desc' ? -1 : 1;
				} else {
					return 0;
				}
			});
		},

		_updatePageData: function () {
			if (!this.fullData) {
				return;
			}

			// Paging the data according to current paging params
			var totalNum = this.fullData.length;
			var startIndex = Math.min((this.pageIndex - 1) * this.pageSize, totalNum);
			var endIndex = Math.min(startIndex + this.pageSize, totalNum);

			this.pageData = this.fullData.slice(startIndex, endIndex);
		},

		_renderPager: function () {
			if (this.fullData) {
				this.total = this.fullData.length;
			}

			var pagerPosition = this.pagerPosition;

			if (pagerPosition == 'none') {
				return;
			}

			var supportTopPager = pagerPosition == 'top' || pagerPosition == 'both';
			var supportBottomPager = pagerPosition == 'bottom' || pagerPosition == 'both';

			if (supportTopPager && this.$('caption.pager-top').length === 0 && !this.topPagerCon) {
                this.$('thead').before('<caption class="pager-top"></caption>');
            }

			if (supportBottomPager && this.$('.pager-bottom').length === 0 && !this.bottomPagerCon) {
				this.$('tbody').after('<tfoot><tr><td class="pager-bottom" colspan="10000"></td></tr></tfoot>>');
			}

			var $topPagerCon = $(this.topPagerCon || this.$('caption.pager-top'));
			var $bottomPagerCon = $(this.bottomPagerCon || this.$('tfoot'));

			if (this.total > this.pageSize) {
				if (supportTopPager) {
					$topPagerCon.show();
                    this.$el.addClass('with-top-pager');
                    this.registerComponent('topPager', this._createTablePager(), $topPagerCon);
				}

				if (supportBottomPager) {
					$bottomPagerCon.show();
					this.registerComponent('bottomPager', this._createTablePager(), this.bottomPagerCon || '.pager-bottom');
				}
			} else {
				$topPagerCon.hide();
				$bottomPagerCon.hide();
			}
		},

		_createTablePager: function () {
			return new Pager({
				pageIndex: this.pageIndex,
				pageSize: this.pageSize,
				total: this.total,
				label: this.pagerLabel
			});
		},

		_onSelectPage: function (pageIndex) {
			this.pageIndex = pageIndex;

			this.refresh();
		},

        _onToggleSelectAll: function (e){
            e.stopPropagation();
            var selectStatus = $(e.currentTarget)[0].checked;
            $(e.currentTarget).closest('table').find('td.col-chkbox input').each(function () {
                $(this)[0].checked = selectStatus;
            });
        },

        _onClickRowSelection: function(e){
            var dataRowCount = this.$('> tbody >tr.data-row').length;
            var selectedRowCount = this.$('> tbody >tr > td.col-chkbox input:checked').length;

            var headCheckbox = this.$('> thead th.col-chkbox input');
            if(headCheckbox.length){
                headCheckbox[0].checked = dataRowCount ===  selectedRowCount;
            }
        },

        getSelectedIds: function(){
            var checkedIds = [];
            this.$(' > tbody > tr.data-row').each(function(){
                var $this = $(this);
                var checkbox = $this.find('> .col-chkbox input');
                if(checkbox.length && checkbox[0].checked){
                    checkedIds.push($this.data('id'));
                }
            });
            return checkedIds;
        }
	});
});

