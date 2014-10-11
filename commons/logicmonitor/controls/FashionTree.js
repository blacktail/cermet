define([
    "lodash",
    "lmcore2",
    "lmutils2",
    "commons/logicmonitor2/controls/templates",
    "lmmodelurls2",
    "commons/logicmonitor2/models/UserDataModel",
	"lmmsgbox2",
	"commons/3rdparty/jquery-ui/draggable",
	"commons/3rdparty/jquery-ui/droppable"
], function (_, LM, Helper, templates, modelUrls, UserDataModel, MsgBox) {
    return LM.View.extend({
        template: templates["commons/logicmonitor2/controls/FashionTree"],
        favoriteTemplate: templates["commons/logicmonitor2/controls/FashionTreeFavorite"],
        favoriteItemTemplate: templates["commons/logicmonitor2/controls/FashionTreeFavoriteItem"],

        className: "fashion-tree-container",

        events: {
            //click tree node
            "click  li.folder": "_onClickFolder",
            "click  li.item": "_onClickItem",
            "click  li.fav-item": "_onClickItem",

            //hover tree for display long name
            "mouseenter .fashion-tree-body": "_onHoverTreeBody",
            "mouseleave .fashion-tree-body": "_onHoverTreeBody",

            //events on breadcrumb
            "click  div.breadcrumb-bar": "_onClickBar",
            "click  div.breadcrumb-home": "_onClickHome",
            "click  div.breadcrumb-item": "_onClickCurrentBreadcrumb",
            "mouseenter  div.breadcrumb-rollup": "_onEnterRollUp",
            "mouseleave  div.rollup-dropdown": "_onLeaveDropDown",
            "click  div.rollup-dropdown li": "_onClickAncestorFolder",

            //hover on favorite item
            "mouseenter .fav-item": "_onEnterFavNode",
            "mouseleave .fav-item": "_onLeaveFavNode",

            //remove item from favorite
            "click .fav-item .roundCancel-white": "_onRemoveFavItem",

            //expand or collapsed in sticky mode
            "click .favorite-sticky-title": "_onExpandAndCollapsedFavItem"

        },

        parentsCache: [],

        initialize: function (options) {
            var me = this;
            this.rootId = options.rootId;
            this.folderKey = options.folderKey;
            this.itemKey = options.itemKey;
            this.callbackAfterInit = options.callbackAfterInit;
            this.isShowFavorite = options.isShowFavorite;
            this.storageKey = options.storageKey;
            this.favPanelWidth = options.favPanelWidth;
            this.model.set("id", this.rootId, {silent: true});
            this.listenTo(this.model, "change", this.render);

            //capture keydown events
            $("body").on("keydown.fashionTree", function (e) {
                switch (e.which) {
                    case 37: //left arrow
                        me.$("div.breadcrumb-item").trigger("click");
                        break;
                    case 38: //up arrow
                        me._keyboardNav(e);
                        break;
                    case 39: //right arrow
                        me.$(".tree-list li.highlight").eq(0).trigger("click");
                        break;
                    case 40: //down arrow
                        me._keyboardNav(e);
                        break;
                    case 107: //+ key
                        //This action looks like little use for us.
                        break;
                    case 13: //enter key
                        me.$(".tree-list li.highlight").eq(0).trigger("click");
                        break;
                }
            });

            // bind window resize event
            $(window).on("resize.fashionTree", _.throttle(_.bind(this._onWindowResize, this), 250));
        },

        render: function (model) {

            if (model) {
                var me = this;
                if (me.searchResult) {
                    me.model.set(me.itemKey, me.searchResult, {silent: true});
                    me.model.set(me.folderKey, [], {silent: true});
                }
                me.folderData = me._parseModel(model.toJSON());

                this.$el.html(this.template(me.folderData)).find(".tree-list ul").fadeIn("fast");

                //split the long time function to many small block asynchronous functions to avoid block browser render
                var tasks = this.$(".tree-list li:not(.empty)").toArray();
                Helper.chunk(tasks, function (item) {
                    var $li = $(item);
                    var id = $li.data("id");
                    var nodeType = $li.data("nodeType");
                    var nodeData = _.findWhere(this.folderData.nodes, {id: id, nodeType: nodeType});
                    this._renderNodeIcon($li, nodeType, nodeData);
                }, 50, this);

                me._renderNodeIcon(me.$(".breadcrumb-item"), "folder", me.folderData);

                //favorite begin
                if (me.isShowFavorite) {
                    me.userDataModel = new UserDataModel({
                        key: me.storageKey,
                        adminId: window.securityUserId,
                        value: ""
                    });
                    LM.rajax({
                        url: modelUrls.userData + "?filter=adminId:" + window.securityUserId + ",key:" + me.storageKey
                    }).done(function (response) {
                        var items = response.data.items;
                        if (items.length > 0) {
                            me.userDataModel.set({
                                id: items[0].id,
                                value: items[0].value
                            });
                            me._renderFavorite();
                        } else {
                            me.userDataModel.save({}, {
                                success: function () {
                                    me._renderFavorite();
                                },
                                wait: true
                            });
                        }
                    });
                }
                //favorite end

                //when searching not run callbackAfterInit
                if (me.searchResult) {
                    me.searchResult = null;
                } else {
                    if (me.callbackAfterInit) {
                        me.callbackAfterInit(me.$el, model.id);
                    }
                }
                me._loadingShow(false);
                return me;
            }
        },

        _renderFavorite: function () {
            var me = this;
            me.$el.append(this.favoriteTemplate());
            me._renderFromStorage();
            me.$("li.item").draggable({
                containment: "div.list-tree",
                helper: "clone",
                appendTo: "body",
                drag: function (event, ui) {
                },
                start: function (event, ui) {
                    var $dropped = me.$(".panel-dropped");
                    var $content = me.$(".panel-content");
                    $content.hide();
                    $dropped.show();
                    $dropped
                        .find(".panel-title")
                        .children(".common")
                        .hide()
                        .end()
                        .children(".dragging")
                        .show()
                        .end()
                        .nextAll(".dropped-region")
                        .slideDown("fast");

                },
                stop: function (event, ui) {

                    me.$(".panel-title")
                        .children(".common")
                        .show()
                        .end()
                        .children(".dragging")
                        .hide()
                        .end()
                        .nextAll(".dropped-region")
                        .fadeOut("fast");
                    me._checkSubPanelVisible();
                }
            });

            me.$(".tree-favorite").droppable({
                accept: "li.item",
                tolerance: "touch",
                //hoverClass: "dropper",
                drop: function (event, ui) {
                    var id = ui.draggable.data("id");
                    var data = me._getData(id, "item", "next");
                    var nodeData = data.nodeData;
                    var folderData = data.folderData;

                    //not allow duplicated node in favorite panel
                    if (me.$(".panel-content li[data-id=" + id + "]").length > 0) {
                        return;
                    }

                    var $li = $(me.favoriteItemTemplate(nodeData));
                    me._renderNodeIcon($li, "item", nodeData);
                    me.$(".panel-content > ul").append($li);
                    $li.data("nodeData", nodeData).data("folderData", folderData);
                    me._checkSubPanelVisible();
                    me._setLocalStorage();
                }
            });
        },

        //keyboard shortcuts functions begin
        _keyboardNav: function (e) {
            var $nodes = this.$(".tree-list li");
            var $highlightNode = this.$(".tree-list li.highlight");

            if ($nodes.length > 0) {
                var index;
                if (e.keyCode === 38) { //up arrow
                    index = $highlightNode.length > 0 ? $highlightNode.index() - 1 : $nodes.length - 1;
                } else { //down arrow
                    index = $highlightNode.length > 0 ? $highlightNode.index() + 1 : 0;
                }

                $highlightNode.removeClass("highlight");
                $nodes.eq(index).addClass("highlight");
            }
        },
        //keyboard shortcuts functions end

        //animation functions begin
        _showNodeAnimation: function ($node, cb) {
            var $animationHolder = $("<div class=\"animation-holder\">" + $node.find(".node-name").text() + "</div>");
            $(document.body).append($animationHolder);

            $animationHolder.width($node.width() * 0.7);
            $animationHolder.height($node.height);
            $animationHolder
                .offset({
                    left: $node.offset().left,
                    top: $node.offset().top
                });

            var $destEle = this.$("div.breadcrumb");

            $animationHolder
                .offset({
                    left: $destEle.offset().left + $node.width() * 0.3,
                    top: $destEle.offset().top + 10
                })
                .css({
                    width: $destEle.width() + "px",
                    opacity: 0
                });


            _.delay(function () {
                $animationHolder.remove();

                if (cb) {
                    cb();
                }
            }, 400);
        },

        _showBounceAnimation: function (callback) {

            if(this.parentsCache.length === 0){
                callback();
                return;
            }

            var $rollUp = this.$(".breadcrumb-rollup");
            var rollUpWidth = $rollUp.width();

            $rollUp
                .find(".number").text(this.parentsCache.length)
                .end()
                .show()
                .width(0)
                .animate({ width: rollUpWidth }, 100)
                .animate({width: "-=5"}, 30, function () {
                    $(this).animate({width: "+=5"}, 50, function () {
                        $(this).width("auto").css("overflow", "visible");

                        //make it flash
                        $rollUp.addClass("rollup-flash", 100, function() {
                            $(this).removeClass("rollup-flash", 200);
                        });

                        if(callback){
                            callback();
                        }
                    });
                });
        },
        //animation functions end

        //sticky functions for favorite begin
        _checkIfSticky: function () {

            var $location = this.$(".position-locate");
            var elTop = $location.offset().top;
            //if you want to trace the position if correct,you may open below console function
            //console.log(elTop, $(window).height())

            //because the height of common favorite panel is about 100px
            return elTop > ( $(window).height() - 100);
        },

        _checkSubPanelVisible: function () {

            var isOutOfScreen = this._checkIfSticky();
            var $favorite = this.$(".tree-favorite"),
                $title = this.$(".favorite-title"),
                $dropped = this.$(".favorite-panel .panel-dropped"),
                $content = this.$(".favorite-panel .panel-content"),
                $sticky = this.$(".favorite-sticky-title");
            var $items = $content.find("li");

            if (isOutOfScreen) {
                $favorite.addClass("sticky");
                $title.hide();

                if ($sticky.find(".downArrowWhite").length) {
                    $content.show();
                } else {
                    $content.hide();
                }
                $dropped.hide();
                $sticky.show();
            } else {
                $favorite.removeClass("sticky");
                $title.show();
                $sticky.hide();


                if ($items.length > 0) {
                    $dropped.hide();
                    $content.show();
                } else {
                    $dropped.show();
                    $content.hide();
                }
            }

            this.refreshFavWidth();
        },

        refreshFavWidth: function(){
            //dynamic favorite panel width
            var $favorite = this.$(".tree-favorite");

            if (this.$el.parent().hasScrollBar()) {
                $favorite.width(this.favPanelWidth - Helper.getScrollWidth());
            } else {
                $favorite.width(this.favPanelWidth);
            }
        },

        _onExpandAndCollapsedFavItem: function (e) {
            var $content = this.$(".panel-content");
            if ($content.find("li").length === 0) {
                return;
            }

            var $el = $(e.currentTarget);
            var me = this;
            var $rightIcon = $el.find("span.right-icon");
            if ($rightIcon.hasClass("upArrowWhite")) {
                $rightIcon.removeClass("upArrowWhite").addClass("downArrowWhite");
                var maxHeight = me.$(".favorite-sticky-title").offset().top - me.$(".tree-list").offset().top;
                $content.css("maxHeight", maxHeight + "px").slideDown("fast", "swing", function () {
                    $(this).css("overflow", "auto");
                });
            } else {
                $rightIcon.removeClass("downArrowWhite").addClass("upArrowWhite");
                $content.slideUp("fast", "swing", function () {
                    $(this).css("maxHeight", "none");
                } );
            }
        },
        //sticky functions for favorite end

        _renderNodeIcon: function ($node, nodeType, nodeData) {
            var statusCls = Helper.getStatusCls(nodeType, nodeData);

            // render alert disabled icon
            if (statusCls.alertDisabledCls) {
                $node.append("<span class=\"icons24 " + statusCls.alertDisabledCls + " icon-alert-disabled\"></span>");
                Helper.setupStatusIconTooltip($node.children().last(), ["alertdisabled"]);

                if (statusCls.alertDisabledCls.indexOf("-down") == -1) {
                    $node.addClass("alert-disabled");
                }
            }

            // render sdt status if alert is not disabled
            if (!statusCls.alertDisabledCls && statusCls.sdtStatusCls) {
                $node.append("<span class=\"icons24 " + statusCls.sdtStatusCls + " icon-sdt-status\"></span>");
                Helper.setupStatusIconTooltip($node.children().last(), ["insdt"]);
            }

            // render alert status icon
            if (statusCls.alertStatusCls) {
                $node.append("<span class=\"icons24 " + statusCls.alertStatusCls + " icon-alert-status\"></span>");

                var alertStatus = statusCls.alertStatusCls.replace(/^alerts/, "").toLowerCase().split("-");
                var statusArr = [];
                statusArr.push(alertStatus[0]);

                if (alertStatus[1] == "ack") {
                    statusArr.push("acked");
                }

                Helper.setupStatusIconTooltip($node.children().last(), statusArr);

                if (statusCls.alertStatusCls == "alertsCritical") {
                    $node.addClass("alert-critical");
                }
            }

            // render device status icon
            if (statusCls.deviceDeadCls) {
                $node.append("<span class=\"icons16 " + statusCls.deviceDeadCls + " icon-device-dead\"></span>");
                $node.addClass("device-dead");
                Helper.setupStatusIconTooltip($node.children().last(), ["devicedead"]);
            }

            var statusIconNum = $node.find(".icon-alert-disabled, .icon-sdt-status, .icon-alert-status, .icon-device-dead").length;
            $node.addClass("has-status-icon-" + statusIconNum);
        },

        _isRoot: function (id) {
            if (id === undefined) {
                id = this.folderData.id;
            }
            return id === this.rootId;
        },

        _parseModel: function (modelJson) {
            var me = this;
            var subFolders = _.each(modelJson[me.folderKey], function (subFolder) {
                subFolder.nodeType = "folder";
            });
            var subItem = _.each(modelJson[me.itemKey], function (host) {
                host.nodeType = "item";
            });
            modelJson.breadcrumbName = me._isRoot(modelJson.id) ? null : modelJson.name;
            modelJson.nodeType = me._isRoot(modelJson.id) ? "root" : "folder";
            modelJson.nodes = subFolders.concat(subItem);
            modelJson.isEmpty = modelJson.nodes.length === 0;
            modelJson.parents = this.parentsCache;
            modelJson.parentsLength = this.parentsCache.length;
            modelJson.parentsLengthPlus = this.parentsCache.length + 1;
            modelJson.parentsLengthMinus = this.parentsCache.length - 1;

            return modelJson;
        },

        //get node data begin, hierarchy = "prev"| "self"| "next"
        _getData: function (id, nodeType, hierarchy) {
            var nodeData = {}, folderData = {};
            hierarchy = hierarchy || "self";
            id = Number(id);

            if(nodeType === "root" && id === this.folderData.id){
                hierarchy = "self";
            }

            if (hierarchy === "prev") {
                var index = this._getIndexFromParentsCache(id);
                nodeData = this.parentsCache[index];
                folderData = index === 0 ? null : this.parentsCache[index - 1];  //index === 0 is root,it has no folder data
            }

            if (hierarchy === "self") {
                nodeData = this.folderData;
                folderData = _.last(this.parentsCache);
            }

            if (hierarchy === "next") {
                nodeData = _.findWhere(this.folderData.nodes, {id: id, nodeType: nodeType});
                folderData = this.folderData;
            }

            return {
                nodeData: nodeData,
                folderData: folderData
            };
        },

        //this function been called by out view
        getCurrentFolderData: function () {
            return this.folderData;
        },

        _getIndexFromParentsCache: function (id) {
            var index = -1;
            _.each(this.parentsCache, function (folder, folderIndex) {
                if (folder.id == id) {
                    index = folderIndex;
                }
            });
            return index;
        },
        //get node data end

        firstRender: function (model) {
            this._selectNode(this.$("div.breadcrumb-home"), this.rootId, "self");
        },

        //change model functions begin
        _jumpToNewFolder: function ($el, id, hierarchy) {
            var me = this;
            me.$(".tree-list").
                fadeOut("fast", function () {
                    me.onFolderAnimation = false;
                    me._loadingShow(true);
                    me._selectNode($el, id, hierarchy);
                    me._changeModel(id);
                });
        },


        _onClickFolder: function (e) {
            var me = this;
            e.stopPropagation();
            var $el = $(e.currentTarget);
            var id = Number($el.data("id"));

            if(me.onFolderAnimation){
                return;
            }

            me.onFolderAnimation = true;
            me._showNodeAnimation($el, function () {
                me._showBounceAnimation(function () {
                    me._jumpToNewFolder($el, id, "next");
                });
            });
        },

        _onClickAncestorFolder: function (e) {
            e.stopPropagation();
            var $el = $(e.currentTarget);
            var id = Number($el.data("id"));
            this._jumpToNewFolder($el, id, "prev");
        },

        _onClickItem: function (e) {
            var me = this;
            e.stopPropagation();
            var $el = $(e.currentTarget);
            var id = Number($el.data("id"));
            me._selectNode($el, id, "next");
            $el.addClass("selected").siblings(".item").removeClass("selected");
        },

        _onClickBar: function (e) {
            e.stopPropagation();
            var $el = $(e.currentTarget);
            var index = $el.index();
            var id = this.parentsCache[index].id;
            this._jumpToNewFolder($el, id, "prev");
        },

        _onClickHome: function (e) {
            e.stopPropagation();
            var $el = $(e.currentTarget);
            this._jumpToNewFolder($el, this.rootId, "prev");
        },

        _onClickCurrentBreadcrumb: function (e) {
            e.stopPropagation();
            var $el = $(e.currentTarget);
            var id = $el.data("id");
            this._selectNode($el, id, "self");
            this._changeModel(id);
        },
        //change model functions end

        _selectNode: function ($el, id, hierarchy) {
            var nodeType = $el.data("nodeType");

            if ($el.hasClass("fav-item")) {
                this.trigger("nodeSelected", nodeType, $el.data("nodeData"), $el.data("folderData"));
            } else {
                if (nodeType === "folder" && this._isRoot(id)) {
                    nodeType = "root";
                }

                var data = this._getData(id, nodeType, hierarchy);
                this.trigger("nodeSelected", nodeType, data.nodeData, data.folderData);

                //if you want to trace the data if correct,you may open below console functions
                //console.log(nodeData);
                //console.log(this.parentsCache);
            }
        },

        //this function is called by out view
        selectDevice: function (id) {
            var $node = this.$(".tree-list").find("li.item[data-id=" + id + "]");
            $node.trigger("click");
        },

        _changeModel: function (id, oldSelectedItemId) {
            var me = this;
            var newFolderId = Number(id);
            var parentsCacheBackUp = me.parentsCache.slice();

            if (me.model.id !== newFolderId) {
                var index = me._getIndexFromParentsCache(newFolderId);

                if (index > -1) {
                    me.parentsCache = me.parentsCache.slice(0, index);
                } else {
                    me.parentsCache.push(me.model.toJSON());
                }
            }

            me.model.set("id", newFolderId, {silent: true});
            me.model.fetch({
                success: function () {
                    if (oldSelectedItemId) {
                        me.$(".tree-list li.item[data-id=" + oldSelectedItemId + "]").addClass("selected");
                    }
                },
                error: function (model, response, options) {
                    MsgBox.alert("Error - status(" + response.status + ")<br> errmsg:" + response.errmsg);

                    //if error, parents cache should roll-back
                    me.parentsCache = parentsCacheBackUp;
                }
            });
        },

        _onHoverTreeBody: function (e) {
            if (e.type === "mouseleave") {
                this.trigger("fashionTree.mouseleave");
            } else {
                var $nodeNames = $(e.currentTarget).find(".node-name");

                if ($nodeNames.length === 0) {
                    return;
                }

                var maxLength = 0;
                var $maxLengthNode;
                $nodeNames.each(function () {
                    var currLength = $(this).text().length;
                    if (currLength > maxLength) {
                        maxLength = currLength;
                        $maxLengthNode = $(this);
                    }
                });

                var cutWidth = $maxLengthNode.width();
                $maxLengthNode.css("maxWidth", "1000%");
                var realWidth = $maxLengthNode.width();
                $maxLengthNode.css("maxWidth", "85%");

                if (realWidth > cutWidth) {
                    this.trigger("fashionTree.mouseenter", cutWidth, realWidth);
                }
            }
        },

        _onEnterRollUp: function (e) {
            e.stopPropagation();

            //position
            var $rollUp = $(e.currentTarget);
            var left = $rollUp.position().left;
            var top = $rollUp.position().top + $rollUp.height() + 10;

            //show list
            this.$(".rollup-dropdown")
                .css({ left: left + "px", top: top + "px" })
                .slideDown(100);
        },

        _onLeaveDropDown: function (e) {
            e.stopPropagation();
            $(e.currentTarget).slideUp(100);
        },

        pushSearchResult: function (items) {
            this.searchResult = items;
            this.$("div.breadcrumb-home").trigger("click");
        },

        refresh: function (isBackToRoot) {
            var $selectedItem = this.$("li.selected").eq(0);
            var itemLength = $selectedItem.length;

            if (isBackToRoot) {
                this.$("div.breadcrumb-home").trigger("click");
            } else {
                this._changeModel(this.folderData.id, itemLength === 1 ? $selectedItem.data("id") : undefined);
            }
        },

        addNode: function (options){
            var index = options.index || 0;
            var className = options.className || "";
            var nodeName = options.nodeName || "";
            var clickFunc = options.clickFunc;
            var addTemplate =  _.template("<li class=\"custom {{=className}}\"><span class=\"node-name\">{{=nodeName}}</span></li>", {
                nodeName: nodeName,
                className: className
            });
            var $tree = this.$(".tree-list > ul");

            if(index === 0){
                $tree.prepend(addTemplate);
            }else{
                $tree.children("li").eq(index).before(addTemplate);
            }

            if(clickFunc){
                this.$("li."+className).on("click", function(e){
                    clickFunc.apply(this, arguments);
                });
            }
        },

        _onEnterFavNode: function (e) {
            e.stopPropagation();
            $(e.currentTarget).addClass("active");
        },

        _onLeaveFavNode: function (e) {
            e.stopPropagation();
            $(e.currentTarget).removeClass("active");
        },

        _onRemoveFavItem: function (e) {
            var me = this;
            e.stopPropagation();
            var $el = $(e.currentTarget);
            var $item = $el.closest("li");
            $item.slideUp("fast", function(){
                $item.remove();
                me._checkSubPanelVisible();
                me._setLocalStorage();
            });
        },

        _setLocalStorage: function(){
            var data = [];

            this.$("li.fav-item").each(function () {
                var $el = $(this);
                var folderData = $el.data("folderData");

                data.push({
                    nodeData: {
                        id: $el.data("nodeData").id
                    },
                    folderData: {
                        id: folderData.id,
                        name: folderData.name,
                        nodeType: folderData.nodeType,
                        userPermission: folderData.userPermission,
	                    fullPath: folderData.fullPath
                    }
                });
            });
            this.userDataModel.save({
                "value": JSON.stringify(data)
            }, {
                wait: true
            });
            this.$(".favorite-sticky-title > .devices-number").text(data.length);
        },

        _renderFromStorage: function(){
            var me = this;
            var favorData = me.userDataModel.get("value");
            if (!favorData) {
                return;
            }

            var data = JSON.parse(favorData);

            me.upgradeFavData(function(freshData){
                me.$(".favorite-sticky-title > .devices-number").text(freshData.length);

                _.each(freshData, function(item){
                    var $li = $(me.favoriteItemTemplate(item.nodeData));
                    me._renderNodeIcon($li, "item", item.nodeData);
                    me.$(".panel-content > ul").append($li);
                    $li.data("nodeData", item.nodeData).data("folderData", item.folderData);
                });
                me._checkSubPanelVisible();
                me._setLocalStorage();
            }, data);
        },

        upgradeFavData: function(func, data){
            func(data);
        },

        _loadingShow: function (isShow) {

            if (isShow) {
                var $elem = this.$(".fashion-tree-body");
                var posTop = $elem.offset().top;
                var posLeft = $elem.offset().left;

                //because the icon width is 32px, so minus 16 just its horizontal center point
                var offsetLeft = ($elem.width() / 2) - 16;
                var $temp = $("<div class=\"fashion-tree-loading loadingGray\"></div>");
                $temp
                    .css({
                        position: "fixed",
                        top: posTop + "px",
                        left: posLeft + offsetLeft + "px",
                        "margin-top": "50px"
                    })
                    .appendTo("body");
            } else {
                $("div.fashion-tree-loading").remove();
            }
        },

        _onWindowResize: function(){
          this._checkSubPanelVisible();
        },

        remove: function () {
            $(window).off("resize.fashionTree");
            $("body").off("keydown.fashionTree");
            LM.View.prototype.remove.apply(this, arguments);
        }
    });
});