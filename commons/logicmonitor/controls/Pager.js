/**
 * logicmonitor pager
 */
define([
	'lodash',
	'core',
	'commons/logicmonitor/controls/templates'
], function (_, LM, templates) {
	return LM.View.extend({
		className: 'lm-pager',
		tagName: 'div',
		template: templates['commons/logicmonitor/controls/Pager'],

		pagerSize: 5,
		pagerPos: 1,

		events: {
			'click .pager-num': '_onClickPagerNum',
			'click .pager-next': '_onClickPagerNext',
			'click .pager-prev': '_onClickPagerPrev'
		},

		initialize: function (options) {
			this.total = options.total;
			this.pageIndex = options.pageIndex;
			this.pageSize = options.pageSize;
			this.label = options.label;
		},

		_computePageRange: function () {
			this.maxPageIndex = Math.ceil(this.total / this.pageSize);
			this.maxPagerPos = Math.ceil(this.maxPageIndex / this.pagerSize);
			this.pagerPos = Math.ceil(this.pageIndex / this.pagerSize);

			this.start = this._getStartPage();
			this.end = this._getEndPage();
		},

		render: function () {
			this._computePageRange();

			this.$el.html(this.template({
				total: this.total,
				pageIndex: this.pageIndex,
				label: this.label,
				range: _.range(this.start, this.end)
			}));

			if (this.end - 1 < this.maxPageIndex) {
				this.$('.pager-next').show().css('display', 'inline-block');
			}

			if (this.start > this.pagerSize) {
				this.$('.pager-prev').show().css('display', 'inline-block');
			}
		},

		_onClickPagerNum: function (e) {
			var $pagerNum = $(e.currentTarget);
			this.selectPage(parseInt($pagerNum.text()));

			this.render();
		},

		_onClickPagerPrev: function () {
			this.pagerPos = Math.max(--this.pagerPos, 1);
			this.selectPage(this._getStartPage());

			this.render();
		},

		_onClickPagerNext: function () {
			this.pagerPos = Math.min(++this.pagerPos, this.maxPagerPos);
			this.selectPage(this._getStartPage());

			this.render();
		},

		_getStartPage: function () {
			return Math.max((this.pagerPos - 1) * this.pagerSize + 1, 1);
		},

		_getEndPage: function () {
			return Math.min(this.start + this.pagerSize, this.maxPageIndex + 1);
		},

		selectPage: function (pageIndex) {
			this.pageIndex = pageIndex;

			this.trigger('select', this.pageIndex);
		}
	});
});
