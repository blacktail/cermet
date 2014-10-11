define([
    'core',
    'jquery',
    'lmdropdown'
], function (LM, $, DropDown) {
    return DropDown.extend({

        className: 'lm-menu lm-dropdown',
        tagName: 'ul',

        events: {
            'click li': '_onClickMenuItem'
        },

        initialize: function (options) {
            if(!options.template) {
                throw new Error('You must specify a template for dropdown menu.');
            }
            this.$el.width(options.width || 240 );
            this.template = options.template;
	        this.templateData = options.templateData || {};
            this._super(arguments);
            this.render();
        },

        render: function () {
            this.$el.html(this.template(this.templateData)).appendTo(document.body);
        },

        _onClickMenuItem: function (e) {
            this.trigger('select', $(e.currentTarget).data('menuOption'));
	        this.$el.hide();
        }
    });
});
