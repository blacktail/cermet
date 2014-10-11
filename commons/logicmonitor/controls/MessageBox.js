/**
 * logicmonitor MessageBox, include alert, confirm and prompt box functions
 */
define([
    'lmdialog',
	'commons/logicmonitor/controls/templates'
], function(Dialog, templates) {
    var MessageBox = Dialog.extend({
	    className: 'lm-dialog lm-message-box',

        events: {
	        'click .btn-close, .btn-cancel': '_onClose',
	        'click .btn-submit, .btn-ok': '_onSubmit'
        },

	    width: 500,

	    type: 'alert', // the default type for the MessageBox is alert

	    defaultTitle: {
		    'alert': 'Warning',
		    'confirm': 'Please Confirm',
		    'prompt': 'Please Enter'
	    },

	    bodyTemplate: templates['commons/logicmonitor/controls/MessageBox'],
	    footTemplate: templates['commons/logicmonitor/controls/MessageBoxFoot'],

	    initialize: function (options) {
		    this.type = options.type || this.type;
		    this.title = options.title || this.defaultTitle[this.type];
		    this.onSubmit = options.onSubmit;

		    this.footParams = {
			    type: this.type
		    };

		    this.bodyData = {
			    type: this.type
		    };

		    this._super(options);
	    },

	    _onSubmit: function () {
		    if (this.onSubmit) {
			    if (this.type == 'confirm') {
				    this.onSubmit(this);
			    } else {
				    this.onSubmit(this.$('.prompt-value').val());
			    }
		    }

		    this.remove();
	    }
    }, {
	    alert: function (msg, title) {
		    new MessageBox({
			    type: 'alert',
			    title: title,
			    bodyData: {
				    msg: msg
			    }
		    });
	    },

	    confirm: function (msg, callback, title) {
		    new MessageBox({
			    type: 'confirm',
			    title: title,
			    bodyData: {
				    msg: msg
			    },
			    onSubmit: callback
		    });
	    },

	    prompt: function (msg, callback, title, initValue) {
		    new MessageBox({
			    type: 'prompt',
			    title: title,
			    bodyData: {
				    msg: msg,
				    initValue: initValue
			    },
			    onSubmit: callback
		    });
	    }
    });

	return MessageBox;
});
