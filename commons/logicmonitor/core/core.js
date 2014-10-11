/**
 * Create a global namespace 'CM', for some core logics and global definitions
 */
define([
    'backbone',
    'lodash'
], function(Backbone, _) {

    window.localStorage = window.localStorage || {};

    var CM = {
        localStorage: window.localStorage || {},
        ENTER_KEY: 13,
        TAB_KEY: 9
    };

    CM.Model = Backbone.Model.extend({

    });

    CM.Collection = Backbone.Collection.extend({

    });

    CM.View = Backbone.View.extend({
        appEvents: {

        },

        /**
         * Register a sub view/component to the current view
         *
         * @param name The component name for the registered component, can be used in appEvents
         * @param component The component reference
         * @param container A dom container, used to append the component
         * @returns {CM.View}
         */
        registerComponent: function (name, component, container) {
            var i;

            this._components = this._components || {};

            if (this._components.hasOwnProperty(name)) {
                var comp = this._components[name];

                if (comp.trigger) {
                    comp.trigger('beforeRemove');
                }

                this.stopListening(comp, 'all');
                comp.remove();
            }

            if (container) {
                this.$(container).append(component.el);
                component.render();
            }

            this._components[name] = component;
            component._parentView = this;
            component._componentName = name;

            var delegateEventSplitter = /^(\S+)\s*(\S+)$/;

            for (var key in this.appEvents) {
                if (this.appEvents.hasOwnProperty(key)) {
                    var funcName = this.appEvents[key];
                    var match = key.match(delegateEventSplitter);
                    var eventName = match[1],
                        selector = match[2];

                    if (selector === name) {
                        var eventNames = eventName.split(/,/);

                        for (i = 0; i < eventNames.length; i++) {
                            this.listenTo(component, eventNames[i], this[funcName]);
                        }
                    }
                }
            }

            this.listenTo(component, 'all', function (eventName) {
                if (!component._events || !component._events[eventName]) {
                    this.trigger.apply(this, arguments);
                }
            });

            return this;
        },


        /**
         * Get a component by the name
         * @param name
         * @returns {CM.View}
         */
        getComponent: function(name) {
            return this._components[name];
        },

        getComponents: function () {
            return this._components;
        },

        /**
         * Remove some subviews or all subviews from current view
         * @param toRemove Only the specified components will be removed. Leave undefined to remove all subviews
         */
        freeChildren: function (toRemove) {
            _.each(this._components, function(component, name) {
                var removeFlag = false;

                if (toRemove) {
                    if (_.isRegExp(toRemove)) {
                        removeFlag = toRemove.test(name);
                    } else {
                        removeFlag = toRemove === name || toRemove === component;
                    }
                } else {
                    removeFlag = true;
                }

                if (removeFlag) {
                    this.stopListening(component, 'all');

                    component.remove();

                    if (this._components[name]) {
                        delete this._components[name];
                        delete component._parentView;
                    }
                }
            }, this);
        },

        /**
         * remove current view
         *
         * First, remove the sub views/components
         * Second, remove self from the parent view
         * Third, remove self
         */
        remove: function() {
            // remove all children view
            this.freeChildren();

            // remove self from parent view and stop all event listeners from parent which used to listen the child events
            var parentView = this._parentView;
            if (parentView) {
                parentView.stopListening(this, 'all');

                if (parentView._components) {
                    delete parentView._components[this._componentName];
                }

                delete this._parentView;
            }

            this.trigger('beforeRemove');
            Backbone.View.prototype.remove.apply(this, arguments);
        }
    });

    var _oldExtend = CM.View.extend;

    // redefine extend to inject the freeChildren method at the top of the render to prevent memory leak
    CM.View.extend = function (protoProps, staticProps) {
        if (protoProps.render) {
            var _oldRender = protoProps.render;
            protoProps.render = function () {
                if (this.freeChildren) {
                    this.freeChildren();
                }

                return _oldRender.apply(this, arguments);
            };
        }

        return _oldExtend.call(this, protoProps, staticProps);
    };


    return CM;
});