/**
 * logicmonitor table with secondary data with expanding table
 */
define([
	'core',
	'utils',
	'commons/logicmonitor/controls/templates',
	'lmtable'
], function (LM, utils, templates, Table) {
	return Table.extend({
		className: 'lm-table lm-expand-table',

		events: {
			'click .lm-button, .styled-checkbox': '_onClickFunction',
			'click tr.data-row': '_onToggleExpandedView',
			'click td .embed-handle .lm-button': '_onToggleEmbeddedView'
		},

		_onToggleExpandedView: function (e) {
			var $curTarget = $(e.target);
			var $row = $curTarget.closest('tr');
			var $arrowIcon = $row.find('.gray-arrow');
			var $expandedPanel = $row.nextAll('.expanded-panel').first();

			if ($row.hasClass('expand')) {
				$row.removeClass('expand');
				$arrowIcon.removeClass('down');
				$expandedPanel.find('.expanded-con').slideUp('fast', function () {
					$expandedPanel.removeClass('expand');
				});
			} else {
				$row.addClass('expand');
				$arrowIcon.addClass('down');
                var $expandedCon = $expandedPanel.find('.expanded-con');
                $expandedPanel.addClass('expand');
                $expandedCon.show().css('height', 0);
                $expandedCon.hide().css('height', 'auto').slideDown('fast');
			}
		},

		_onClickFunction: function (e) {
			e.stopPropagation();
		},


		_onToggleEmbeddedView: function (e) {
			var that = this;
			var $button = $(e.currentTarget);
			var $handle = $button.closest('.embed-handle');
			var $icon = $button.find('span');
			var $td = $button.closest('td');
			var $row = $button.closest('tr');
			var $embeddedPanel = $row.nextAll('.embedded-panel').first();
			var $embeddedCon = $embeddedPanel.find('.embedded-con');
			var id = $row.data('id');

			if ($handle.hasClass('active')) {
				$handle.removeClass('active');
				$embeddedCon.slideUp('fast', function () {
					$embeddedPanel.removeClass('active');
					$row.removeClass('active');
					$embeddedPanel.hide();

					that.freeChildren('embeddedView' + id);
				});

				// change the white icon to the gray icon
				$icon.prop('className', $icon.prop('className').replace('white', 'gray'));
			} else {
				this.freeChildren('embeddedView' + id);

				// reset all handle to gray icons
				$row.find('.embed-handle').removeClass('active')
					.find('.lm-button span').each(function () {
						var $icon = $(this);
						$icon.prop('className', $icon.prop('className').replace('white', 'gray'));
					});

				$embeddedPanel.addClass('active');
				$row.addClass('active');
				$embeddedPanel.show();

				// change the gray icon to the white icon
				$handle.addClass('active');
				$icon.prop('className', $icon.prop('className').replace('gray', 'white'));

				$embeddedCon.show().css('height', 0);

				var embeddedViewClass = /col-(\S+)/.exec($td.prop('className'));

				if (embeddedViewClass && embeddedViewClass[1]) {
					this._showEmbeddedView(id, embeddedViewClass[1], $embeddedPanel);
				}

				$embeddedCon.hide().css('height', 'auto').slideDown('fast');
			}
		},

		_showEmbeddedView: function (id, columnName, $embeddedPanel) {
			var subViewMethodName = utils.camelCase('_show-' + columnName + '-view');

			if (this[subViewMethodName]) {
				this.registerComponent('embeddedView' + id, this[subViewMethodName](id), $embeddedPanel.find('.embedded-con'));
			}
		},

		refresh: function (cb) {
			// cache expanded and embedded status

			this._super(function () {
				// after refresh, we should restore the expanded and embedded status at most
				if (cb) {
					cb();
				}
			});
		}
	});
});

