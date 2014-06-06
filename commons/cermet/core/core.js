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

        registerComponent: function (name, component, container) {
            var i;

            this._components = this._components || {};

            if (this._components.hasOwnProperty(name)) {
                var comp = this._components[name];

                if (comp.trigger) {
                    comp.trigger('beforeRemove');
                }

                comp.remove();
            }

            if (container) {
                this.$(container).append(component.el);
                component.render();
            }

            this._components[name] = component;
            component._parentView = this;
            component._componentName = name;

            var delegateEventSplitter = /^(\S+)\s*(.*)$/;

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

        getComponent: function(name) {
            return _.isString(name) ? this._components[name] : _.find(name);
        },

        getComponents: function () {
            return this._components;
        },

		freeChildren: function () {
			_.each(this._components, function(component, name) {
                if (component === toRemove || !toRemove) {
                    component.remove();

                    if (this._components[name]) {
                        delete this._components[name];
                    }
                }
            }, this);
		},

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

    return CM;
});