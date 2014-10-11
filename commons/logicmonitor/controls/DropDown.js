define([
    'lodash',
    'core',
    'jquery'
], function (_, LM, $) {
    var DropDown = LM.View.extend({
        className: 'lm-dropdown',

        events: {
        },

        initialize: function (options) {
            if (!this.options.triggerEl) {
                throw new Error('You must specify a trigger for dropdown.');
            }

            this.ifHideOnScroll = options.ifHideOnScroll;
            this.triggerEl = this.options.triggerEl;
            this._dropDownHandler = _.bind(this._dropDown, this);
            this._clickOutsideHandler = _.bind(this._onClickOutside, this);
            $(this.triggerEl).off('click.dropdown').on('click.dropdown', this._dropDownHandler);
        },

        _dropDown: function (event) {
            var that= this;

            if (this.$el.css('display') != 'none') {
                this.$el.slideUp();
                return;
            }

            $(document).trigger('click.outside');
            this.trigger('beforeShow');
            this.$el.show();
            var triggerOffset = $(this.triggerEl).offset(),
                triggerWidth = $(this.triggerEl).prop('offsetWidth') || 0,
                triggerHeight = $(this.triggerEl).prop('offsetHeight') || 0,
                dropdownWidth = this.$el.prop('offsetWidth') || 0;

            var left = triggerOffset.left + triggerWidth - dropdownWidth;

            if (this.options.position == 'left') {
                left = triggerOffset.left;
            }

            this.$el.offset({
                top: triggerOffset.top + triggerHeight,
                left: left
            });
            this.$el.hide();
            this.$el.slideDown(150, function () {
                that.trigger('afterShow', that);
            });

            if ($(event.target).closest(this.triggerEl).length > 0) {
                event.stopPropagation();
            }

            $(document).on('click.outside', this._clickOutsideHandler);
            if(this.ifHideOnScroll){
                $(document).on('scroll.outside', this._clickOutsideHandler);
            }
        },

        _onClickOutside: function (e) {

            if ($(e.target).closest('.ui-autocomplete').length > 0) {
                return;
            }

            if ($(e.target).closest('.ui-datepicker-div').length > 0) {
                return;
            }
            if ($(e.target).closest('.ui-timepickr').length > 0) {
                return;
            }

            if(this.ignoreOutsideElement){
                if(this.ignoreOutsideElement(e)){
                    return;
                }
            }

            if ((e.target == document || $.contains(document, e.target)) && !$.contains(this.el, e.target)) {
                $(document).off('click.outside', this._clickOutsideHandler).off('scroll.outside', this._clickOutsideHandler);
	            this.trigger('hide');
                this.$el.hide();
            }
        },

        _onRemove: function () {
            $(this.triggerEl).off('click.dropdown');
            $(document).off('click.outside', this._clickOutsideHandler).off('scroll.outside', this._clickOutsideHandler);
        },

        setTriggerEl: function (el) {
            $(this.triggerEl).off('click.dropdown');
            this.triggerEl = $(el);
            $(this.triggerEl).on('click.dropdown', this._dropDownHandler);
        },

        remove: function () {
            this._onRemove();
            this._super(arguments);
        }
    });

    return DropDown;
});
