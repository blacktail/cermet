/**
 * logicmonitor Sidebar control
 */
define([
    'core',
	'lodash',
    'commons/logicmonitor/controls/templates',
	'commons/3rdparty/jquery-ui/resizable',
	'commons/3rdparty/jquery-ui/effect-slide'
], function (LM, _, templates) {

    return LM.View.extend({
        className: 'lm-sidebar',

        events: {
            'click .sidebar-collapse': '_onCollapseSidebar'
        },

        template: templates['commons/logicmonitor/controls/Sidebar'],

        initialize: function (options) {
	        this.$expandBtn = options.sidebarExpand || $('.sidebar-expand');
	        this.storagePrefix = options.storagePrefix || this.storagePrefix || 'global';

	        this.$expandBtn.on('click.sidebar', _.bind(this._onExpandSidebar, this));
        },

	    render: function () {
		    var that = this;

		    this.$el.html(this.template());

		    this._resetSidebarWidth();

		    this.$el.resizable({
			    handles:'e',
			    minWidth:190,
			    start: function(){
				    that._onResizing = true;
			    },
			    stop: function(){
				    LM.localStorage[that.storagePrefix + '.sidebarWidth'] = that.$el.prop('offsetWidth');
				    that._onResizing = false;
			    }
		    });

		    this.trigger('resize');
	    },

	    _onExpandSidebar: function () {
		    var that = this,
			    $expandBtn = this.$expandBtn;

		    $expandBtn.hide();
		    this.$('.sidebar-collapse').show();

		    this.$el.show('slide',{
			    direction:'left',
			    duration: 'fast',
			    complete: function () {
				    that.trigger('resize');
			    }
		    });
	    },

	    _onCollapseSidebar: function () {
		    var that = this,
			    $expandBtn = $('.sidebar-expand');

		    this.$el.hide('slide',{
			    direction:'left',
			    duration: 'fast',
			    complete: function () {
				    that.trigger('resize');
			    }
		    });

		    $expandBtn.show();
		    this.$('.sidebar-collapse').hide();
	    },

	    _animateSideBar: function (addWidth) {
		    var width = LM.localStorage[this.storagePrefix + '.sidebarWidth'];

		    if (addWidth === 0 && addWidth != 'reset') {
			    return;
		    }

		    this.$el.stop(true, true).animate({
			    width: (Number(width) + (Number(addWidth) || 0)) + 'px'
		    }, 400, function () {
			    $(this).css('overflow', 'visible');
		    });
	    },

	    _resetSidebarWidth: function(){
		    var sideBarWidth = parseInt(LM.localStorage[this.storagePrefix + '.sidebarWidth']);

		    if(sideBarWidth){
			    this.$el.width(sideBarWidth);
		    } else {
			    LM.localStorage[this.storagePrefix + '.sidebarWidth'] = this.$el.width();
		    }
	    }
    });
});
