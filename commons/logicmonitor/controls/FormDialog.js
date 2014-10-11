/**
 * logicmonitor Dialog control
 */
define([
    'lodash',
    'core',
    'jquery',
    'backbone',
    'commons/logicmonitor/controls/templates',
	'lmdialog'
], function (_, LM, $, Backbone, templates, Dialog) {
    return Dialog.extend({

        className: 'lm-dialog lm-form-dialog',

	    footTemplate: templates['commons/logicmonitor/controls/FormDialogFoot'],

        events: {
	        'click .toggle-link': '_toggleSectionBox',
	        'click .btn-save': '_onSave',
	        'click .btn-save-close': '_onSaveClose',
	        'click .btn-clone': '_onClone',
	        'click .btn-delete': '_onDelete'
        },

        initialize: function (options) {
            if(!this.footParams){
                this.footParams = {
                    showFootSave: options.showFootSave,
                    showFootClone: options.showFootClone,
                    showFootSaveClose: options.showFootSaveClose,
                    showFootDelete: options.showFootDelete
                };
                _.defaults(this.footParams, {
                    showFootSave: true,
                    showFootClone: false,
                    showFootSaveClose: false,
                    showFootDelete: false
                });
            }

	        this._super(options);
        },

	    _onSave: function () {
		    console.log('form save');
	    },

	    _onSaveClose: function () {
		    console.log('form save close');
	    },

	    _onClone: function () {
		    console.log('form clone');
	    },

	    _onDelete: function () {
		    console.log('form delete');
	    },

	    _toggleSectionBox: function (e) {
		    var $sectionContent = $(e.target).closest('.section-header').next('.section-content');

		    if ($sectionContent.is(':hidden')) {
			    $sectionContent.show();
		    } else {
			    $sectionContent.hide();
		    }

		    this.resetPosition();
	    }
    });
});