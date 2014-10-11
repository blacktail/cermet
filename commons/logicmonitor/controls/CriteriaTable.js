/**
 * logicmonitor table with secondary data with expanding table
 */
define([
	'lodash',
	'core',
	'utils',
	'commons/logicmonitor/controls/templates',
	'lmexpandtable',
	'lmmsgbox'
], function (_, LM, utils, templates, ExpandTable, MessageBox) {
	return ExpandTable.extend({
		className: 'lm-table lm-expand-table lm-criteria-table',

		rowTemplate: function () {
			return '';
		},

		editColumnTHTemplate: templates['commons/logicmonitor/controls/partials/CriteriaEditColumnTH'],

		editColumnTDTemplate: templates['commons/logicmonitor/controls/partials/CriteriaEditColumnTD'],

		/**
		 * The default clone data operation, delete the id. Sub class should override this function for
		 * customerize logics
		 *
		 * @param cloneData
		 */
		onBeforeCloneData: function (cloneData) {
			return cloneData;
		},

		/**
		 * The default validate row function, return true means any value in the row is valid. Sub class should override
		 * this function for validation
		 *
		 * @param $tr
		 * @returns {boolean}
		 */
		validateDataRow: function ($tr) {
			return true;
		},

		events: {
			'click tr.data-row': '_onClickDataRow',
			'focus tr.data-row .editable-control': '_onFocusEditableControl',
			'click tr.data-row td.col-edit-column .cancel-btn': '_onClickCancelBtn',
			'click tr.data-row td.col-edit-column .save-btn': '_onClickSaveBtn',
			'click tr.data-row td.col-edit-column .delete-btn': '_onClickDeleteBtn',
			'click tr.data-row td.col-edit-column .clone-btn': '_onClickCloneBtn',
			'click th.col-edit-column .add-btn': '_onClickAddBtn'
		},

		initialize: function (options) {
            this.showOptions = {showClone: true};
            if(options && options.showClone === false){
                this.showOptions.showClone = false;
            }

			this.getRowData = options.getRowData || this.getRowData;

			if (!this.getRowData) {
				throw new Error('Criteria Table need a getRowData function!');
			}

			this.onBeforeCloneData = options.onBeforeCloneData || this.onBeforeCloneData;
			this.editableRowMap = {};
			this.editablePathMap = {};
			this.deltaData = {
				add: [],
				del: [],
				update: []
			};
			this.deleteConfirm = options.deleteConfirm || false;

			options.data = options.data || [];

			this._setUniqDataId(options.data);

			this.listenTo(this, 'after:render', this._onAfterRender);

			this._super(options);
		},

		_setUniqDataId: function (data) {
			_.each(data, function (item) {
				item._uniqueId = this._genUniqRowId();
			}, this);
		},

		_genUniqRowId: function () {
			return _.uniqueId('ctitem');
		},

		_onClickDataRow: function () {
			//@TODO now, do nothing to avoid expand table behavior
		},

		_onFocusEditableControl: function (e) {
			var $td = $(e.target).closest('td');
			var $tr = $(e.target).closest('tr');

			// for new row, should do nothing for focus event
			if ($tr.hasClass('new-row')) {
				return;
			}

			// When begin to edit the data row, we should store the old data for restoring it later
			if (!$tr.hasClass('editable')) {
				var uniqueId = $tr.data('unique-id');
				var rowData = this.getRowData($tr);
				rowData._uniqueId = uniqueId;
				$tr.data('oldData', rowData);
			}

			$tr.find('> td').removeClass('editable');

			$td.addClass('editable');
			$tr.addClass('editable');
		},

		_onClickCancelBtn: function (e) {
			var $tr = $(e.target).closest('tr');

			if ($tr.hasClass('new-row')) {
                this._removeNewRow($tr);
				this.$el.removeClass('adding-mode');
				this.$('th.col-edit-column .add-btn').removeClass('blue').addClass('gray');
				return;
			}

			var oldRowData = $tr.data('oldData');
			var $newRow = $(this.rowTemplate(oldRowData));
			var $lastTD = $newRow.find('> td:last-child');

			if (!$lastTD.hasClass('col-edit-column')) {
				$lastTD.after(this.editColumnTDTemplate(this.showOptions));
			}

			$tr.replaceWith($newRow);
		},

		_onClickSaveBtn: function (e) {
			var $tr = $(e.target).closest('tr');
			var uniqueId = $tr.data('unique-id');
			var dataIndex;
			var isNew = $tr.hasClass('new-row');

			if (!this.validateDataRow($tr)) {
				return;
			}

			this.$el.removeClass('adding-mode');
			$tr.removeClass('new-row');
			$tr.removeClass('editable');
			$tr.find('> td').removeClass('editable');

			if (isNew) {
				var $nextTr = $tr.next();

				if ($nextTr.length) {
					dataIndex = _.findIndex(this.fullData, {_uniqueId: $nextTr.data('unique-id')});
				}
			} else {
				dataIndex = _.findIndex(this.fullData, {_uniqueId: uniqueId});
			}

			// update row data
			var rowData = this.getRowData($tr);
			rowData._uniqueId = uniqueId;

			if (isNew) {
				rowData._newFlag = true;
				this.fullData.splice(Math.max(dataIndex, 0), 0, rowData);
				this.deltaData.add.push(rowData);
				this.refresh();
			} else if (dataIndex > -1) {
				var oldRowData = this.fullData[dataIndex];
				rowData._newFlag =  oldRowData._newFlag;

				this.fullData.splice(dataIndex, 1, rowData);

				if (rowData._newFlag) {
					_.remove(this.deltaData.add, {_uniqueId: uniqueId});
					this.deltaData.add.push(rowData);
				} else {
					_.remove(this.deltaData.update, {_uniqueId: uniqueId});
					this.deltaData.update.push(rowData);
				}
			}
		},

		_onClickDeleteBtn: function (e) {
			var that = this;
			var $tr = $(e.target).closest('tr');

			if (this.deleteConfirm) {
				MessageBox.confirm('Are you sure to delete this row?', function () {
					that._deleteDataRow($tr);
				});
			} else {
				that._deleteDataRow($tr);
			}

		},

		/**
		 * The default remove implementation for delete a DOM row, the sub classes should override this function if
		 * need special behavior.
		 * @param tr
		 * @private
		 */
		_removeDataRow: function (tr) {
			$(tr).remove();
		},

        _removeNewRow: function (tr) {
            $(tr).remove();
        },

		_deleteDataRow: function ($tr) {
			var uniqueId = $tr.data('unique-id');

			this._removeDataRow($tr);

			var toRemoveData = _.find(this.fullData, {_uniqueId: uniqueId});

			if (toRemoveData) {
				// delete row data from fullData
				_.remove(this.fullData, {_uniqueId: uniqueId});

				// delete from delta data
				_.remove(this.deltaData.add, {_uniqueId: uniqueId});
				_.remove(this.deltaData.update, {_uniqueId: uniqueId});

				if (!toRemoveData._newFlag) {
					this.deltaData.del.push(toRemoveData);
				}

				this.refresh();
			}
		},

		_onClickAddBtn: function (e) {
			if (this.$el.hasClass('adding-mode')) {
				this.$('tr.new-row td:first input').focus();
				return;
			}

			this.$el.addClass('adding-mode');
			this.$('th.col-edit-column .add-btn').removeClass('gray').addClass('blue');


			var $newRow = $(this.rowTemplate({
				_uniqueId: this._genUniqRowId()
			}));

			var $lastTD = $newRow.find('> td:last-child');

			if (!$lastTD.hasClass('col-edit-column')) {
				$lastTD.after(this.editColumnTDTemplate(this.showOptions));
			}

			$newRow.addClass('new-row').addClass('editable');
			$newRow.find('> td').addClass('editable');

			$newRow.prependTo(this.$('tbody'));

			$newRow.find('> td:first input').focus();
		},

		_onClickCloneBtn: function (e) {
			var that = this;
			var $tr = $(e.target).closest('tr');
			var uniqueId = $tr.data('unique-id');
			var rowData = _.find(this.fullData, {_uniqueId: uniqueId});
			var rowIndex = _.findIndex(this.fullData, {_uniqueId: uniqueId});

			var newData = _.cloneDeep(rowData);
			newData._uniqueId = this._genUniqRowId();
			newData._newFlag = true;

			// allow caller to modify the cloned data before clone operation
			if (this.onBeforeCloneData) {
				newData = this.onBeforeCloneData(newData) || newData;
			}

			this.fullData.splice(rowIndex + 1, 0, newData);
			this.deltaData.add.push(newData);

			this.refresh(function () {
//				var $clonedTr = that.$('tr[data-unique-id="' + newData._uniqueId + '"]');
//				$clonedTr.addClass('editable');
//
//				$clonedTr.find('td:first').addClass('editable');
//				$clonedTr.find('td:first input').focus();
			});
		},

		refresh: function (cb) {
			var that = this;
			// before refresh, store the editable status for restore later
			var $newRow = this.$('tr.new-row');

			this.$('tr.data-row').each(function () {
				var $tr = $(this);
				var uniqueId = $tr.data('unique-id');

				if ($tr.hasClass('editable')) {
					that.editableRowMap[uniqueId] = true;
					that.editablePathMap[uniqueId] = [];

					$tr.find('.editable').each(function () {
						that.editablePathMap[uniqueId].push(that._getRelativeDomPath($tr, this));
					});
				} else {
					that.editableRowMap[uniqueId] = false;
					that.editablePathMap[uniqueId] = [];
				}
			});

			this._super(function () {
				that.$('tr.data-row').each(function () {
					var $tr = $(this);
					var uniqueId = $tr.data('unique-id');

					if (that.editableRowMap[uniqueId]) {
						$tr.addClass('editable');
						$tr.data('oldData', _.find(that.fullData, {_uniqueId: uniqueId}));

						_.each(that.editablePathMap[uniqueId], function (path) {
							$tr.find(path).addClass('editable');
						});
					}
				});

				if ($newRow.length && that.$el.hasClass('adding-mode')) {
					$newRow.prependTo(that.$('tbody'));
				}

				if (cb) {
					cb();
				}
			});
		},

		_getRelativeDomPath: function (ancestor, leaf) {
			var path = '';
			var $ancestor = $(ancestor);
			var $leaf = $(leaf);

			while($ancestor[0] != $leaf[0]) {
				var realNode = $leaf[0], name = realNode.localName;

				if (!name) {
					break;
				}

				name = name.toLowerCase();

				var $parent = $leaf.parent();

				var $siblings = $parent.children(name);

				if ($siblings.length > 1) {
					name += ':eq(' + $siblings.index(realNode) + ')';
				}

				path = name + (path ? '>' + path : '');

				$leaf = $parent;
			}

			return path;
		},

		getFullData: function () {
			var fullData = _.cloneDeep(this.fullData);

			_.each(fullData, function (item) {
				delete item._uniqueId;
				delete item._newFlag;
			});

			return fullData;
		},

		getDeltaData: function () {
			var deltaData = _.cloneDeep(this.deltaData);

			_.each(deltaData.add, function (item) {
				delete item._newFlag;
				delete item._uniqueId;
			});

			_.each(deltaData.update, function (item) {
				delete item._uniqueId;
			});

			_.each(deltaData.del, function (item) {
				delete item._uniqueId;
			});

			return deltaData;
		},

		_onAfterRender: function () {
			var that = this;
			var $lastTH = this.$('> thead th:last-child');
			var $lastTD = this.$('> tbody > tr.data-row > td:last-child');

			if (!$lastTH.hasClass('col-edit-column')) {
				$lastTH.after(this.editColumnTHTemplate());
			}

			$lastTD.each(function () {
				var $td = $(this);
				if (!$td.hasClass('col-edit-column')) {
					$td.after(that.editColumnTDTemplate(that.showOptions));
				}
			});
		}
	});
});
