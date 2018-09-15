"use strict";

var scriptlet = function (w, templates, ruleEngine) {
    var $throttle_id;
    return extendProto(function (options) {
        this.stage = options.stage;
        this.template = options.template;
        this.data = options.data;
        this.methods = options.methods;
        this.bindings = [];
        this.ruleEngine = ruleEngine;
        this.setup();
    }, {
        setup: function () {
            if (this.methods) {
                for (var method in this.methods) {
                    this[method] = this.methods[method];
                }
            }
        },
        run: function () {
            this.init();
        },
        init: function () {
            this.$el = templates.get(this.template).el;
            this.ruleEngine.init(this);
        },
        getValue: function (val) {
            var fn = new Function("return " + val);
            return fn.apply(this);
        },
        update: function (options, config) {
            if (options && !config) {
                this.updateBinding(options);
                config != false && this.applyBinding();
            } else if (options && config) {
                if (config.delay) {
                    setTimeout(function (options, config) {
                        this.updateBinding(options);
                        this.applyBinding();
                        config.onUpdate && config.onUpdate.apply(this);
                    }.bind(this, options, config), config.delay)
                }
            } else {
                this.applyBinding();
            }
        },
        updateBinding: function (options) {
            var keys = Object.keys(options),
                fn, val;
            for (var i = 0; i < keys.length; i++) {
                val = options[keys[i]];
                fn = Function("this.data." + keys[i] + ' = ' + this.makeValue(val));
                fn.apply(this);
            }
        },
        makeValue: function (_val) {
            var val = typeof _val == "string" ? ('"' + _val.replace(/\n/g, '\\n') + '"') : _val;
            if (typeof val == "object" && val !== null) {
                val = JSON.stringify(val);
                val = val.replace(/'/g, "\\'");
                val = "JSON.parse('" + val + "')";
            }

            return val;
        },
        applyBinding: function (callback) {
            this.bindings.forEach(function (binding) {
                binding.$rule.apply();
            });

            typeof callback == "function" && callback.apply(this);
        },
        applyEvent: function (el, event, handel, applyBinding) {
            var _this = this;
            $(el)[event](function (e) {
                handel.apply(_this, [e, this]);
                applyBinding && _this.applyBinding();
            })
        },
        $event: function (selector, event, handel, applyBinding) {
            applyBinding = applyBinding == undefined && true;
            if (typeof selector == "string") {
                this.applyEvent(this.$el.find(selector), event, handel, applyBinding);
            } else {
                this.applyEvent(selector, event, handel, applyBinding);
            }
        },
        $timeout: function (handler, time) {
            return setTimeout(function () {
                handler.apply(this);
                this.applyBinding(); // updating all binding
            }.bind(this), time);
        },
        $throttle: function (handler, time) {
            clearTimeout($throttle_id);
            $throttle_id = setTimeout(function () {
                handler.apply(this)
                this.applyBinding(); // updating all binding
            }.bind(this), time);
        }
    });
}(window, templates, ruleEngine);