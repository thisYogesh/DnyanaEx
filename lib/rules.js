"use strict";

(function (rule, $) {
    rule.createRule(":if", function (sl, el, scope, type) {
        this.init = function () {
            this.comment = document.createComment('[:if="' + scope.replace(/this.data./g, '') + '"]');
            this.space = document.createDocumentFragment();
            $(el).after(this.comment);
            this.space.append(el);
            return this;
        };

        this.apply = function (forceState) {
            try {
                if (forceState === undefined) {
                    if (sl.getValue(scope)) {
                        if (!el.parentElement) {
                            el != sl.$el.get(0) && this.bindElement();
                            $(this.comment).after(el);
                            sl.$el.get(0) == el && sl.stage && sl.stage();
                        }
                    } else {
                        this.space.append(el);
                        el != sl.$el.get(0) && this.unbindElement();
                        sl.$el.get(0) == el && sl.unstage && sl.unstage();
                    }
                } else if (forceState) {
                    $(this.comment).after(el);
                } else if (!forceState) {
                    this.space.append(el);
                }

            } catch (e) {
                this.space.append(el);
                el != sl.$el.get(0) && this.unbindElement();
                sl.$el.get(0) == el && sl.unstage && sl.unstage();
            }
        };

        this.bindElement = function () {
            this.bindings = rule.bind(sl, el);
        };

        this.unbindElement = function () {
            if (this.bindings && this.bindings.length) {
                rule.unbind(sl, this.bindings);
                this.bindings = null;
            }
        }
    });

    rule.createRule(":value", function (sl, el, scope, type) {
        this.init = function () {
            var _this = this;
            this.isRC = this.checkRC(el);

            sl.$event(el, "change", function (e, $el) {
                var updateObj = {};
                if (_this.isRC && _this.isRC == "radio" && $el.checked) {
                    updateObj[scope.replace('this.data.', '')] = $el.value;
                } else if (_this.isRC && _this.isRC == "checkbox") {
                    updateObj[scope.replace('this.data.', '')] = $el.checked;
                } else {
                    updateObj[scope.replace('this.data.', '')] = $el.value;
                }
                this.update(updateObj);
            });

            return this;
        };

        this.checkRC = function (el) {
            if (el && (el.type == "radio" || el.type == "checkbox")) {
                return el.type
            }
        }

        this.apply = function () {
            try {
                var val = sl.getValue(scope);
                if (this._prev_val !== val && !this.isRC) {
                    this._prev_val = el.value = val;
                }
            } catch (e) {

            }
        };
    });

    rule.createRule(":event", function (sl, el, scope, type) {
        this.init = function () {
            var _this = this,
                writableEl = "[type=text],[type=email],[type=number],[type=password],textarea",
                keyEv = "keyup, keydown, keypress",
                isInputWithKeyEv;
            this.setup();

            isInputWithKeyEv = keyEv.indexOf(this.event) > -1 && $(el).is(writableEl);

            if (isInputWithKeyEv) {
                sl.$event(el, this.event, function (e, $el) {
                    var inputValueRule = el.attributes[':value'] && el.attributes[':value'].value
                    if (inputValueRule) {
                        var updateObj = {};
                        updateObj[inputValueRule] = $el.value;
                        this.update(updateObj, false);
                    }

                    _this.applyEv(this, e);
                }, false);
            } else {
                sl.$event(el, this.event, function (e) {
                    _this.applyEv(this, e);
                });
            }

            return this;
        };

        this.applyEv = function (_this, e) {
            try {
                if (this.args) {
                    _this[this.handle].apply(_this, this.getArgs(e));
                } else {
                    _this[this.handle].apply(_this);
                }
            } catch (e) {
                console.log("Error in method", this.handle);
            }
        };

        this.setup = function () {
            var EvRx = /[a-z0-9]+:[a-z0-9$_]+\(|\)/ig,
                args = scope.replace(EvRx, ''),
                scopeSplit = scope.split(":"),
                ev = scopeSplit[0],
                handle = scopeSplit[1].match(/(\$?\w+)+/)[0];

            this.event = ev;
            this.handle = handle;
            this.args = args.split(",");
        };

        this.apply = function () {};

        this.getArgs = function (e) {
            var args = [];
            this.args.forEach(function (arg) {
                args.push(arg != "$event" ? sl.getValue(arg) : e);
            });

            return args;
        }
    });

    rule.createRule(":src", function (sl, el, scope, type) {
        this.init = function () {
            return this;
        };

        this.apply = function () {
            var val;
            try {
                val = sl.getValue(scope);
                if (this._prev_val !== val) {
                    this._prev_val = el.src = val;
                }
            } catch (e) {}
        };
    })

    rule.createRule(":show", function (sl, el, scope, type) {
        this.init = function () {
            return this;
        };

        this.apply = function () {
            if (sl.getValue(scope)) {
                el.style.display = "";
            } else {
                el.style.display = "none";
            }
        };
    });

    rule.createRule(":hide", function (sl, el, scope, type) {
        this.init = function () {
            return this;
        };

        this.apply = function () {
            if (sl.getValue(scope)) {
                el.style.display = "none";
            } else {
                el.style.display = "";
            }
        };
    });

    rule.createRule(":bind", function (sl, el, scope, type, filter) {
        this.init = function () {
            if (filter) {
                this.initFilter(filter)
            }
            return this;
        };

        this.initFilter = function (filter) {
            this.filter = filter;

            for (var i = 0; i < filter.length; i++) {
                filter[i] = sl[filter[i]];
            }
        };

        this.apply = function () {
            try {
                var val = sl.getValue(scope);
                if (this._prev_val !== val) {
                    if (this.filter) {
                        for (var f = 0, len = this.filter.length; f < len; f++) {
                            val = this.filter[f].call(sl, val);
                        }
                    }
                    el.innerText = val;
                    this._prev_val = val;
                }
            } catch (e) {

            }
        };
    });

    rule.createRule(":html", function (sl, el, scope, type) {
        this.init = function () {
            return this;
        };

        this.apply = function () {
            var val = sl.getValue(scope);
            if (this._prev_val !== val) {
                this._prev_val = el.innerHTML = val;
            }
        };
    });

    rule.createRule(":class", function (sl, el, scope, type) {
        this.init = function () {
            this.object = type == "object" ? JSON.parse(scope) : sl.getValue(scope);
            if (typeof this.object == "object") {
                this.keys = Object.keys(this.object);
            }
            return this;
        };

        this.apply = function () {
            if (typeof this.object == "object") {
                var className;
                for (var k = 0, len = this.keys.length; k < len; k++) {
                    className = this.keys[k];
                    if (sl.getValue(this.object[className])) {
                        $(el).addClass(className);
                    } else {
                        $(el).removeClass(className);
                    }
                }
            } else {
                var cls = sl.getValue(scope);
                if (cls != this.prevClass) $(el).removeClass(this.prevClass).addClass(cls);
                this.prevClass = scope;
            }
        };
    });

    rule.createRule(":loop", function (sl, el, scope, type) {
        this.init = function () {
            try {
                var $collection = sl.getValue(scope);
                this.bindings = [];
                this._scope = scope.replace("this.data.", '');
                this.prevLength = $collection.length;
                this.setup(el);
                this.template = el.outerHTML;
                this.loopElements = [];
                this.parentEle = el.parentElement;
                el.remove();
                $collection.forEach(function ($item, index) {
                    this.createLoopElement($item, index);
                }.bind(this));
                this.installed = true;
            } catch (e) {
                this.installed = false;
            }
            return this;
        };

        this.setup = function (el) {
            var _scope = this._scope,
                nel, iHTML, nestedLoopHtml = this.setNestedLoop();

            iHTML = el.innerHTML;
            el.innerHTML = "";
            this.replaceAttrValue(el, "this", _scope);
            iHTML = iHTML.replace(/this/g, _scope);
            el.innerHTML = iHTML;

            if (nestedLoopHtml) {
                nel = el.querySelector("[\\:\\:nested]");
                nel.innerHTML = nestedLoopHtml;
                nel.removeAttribute("::nested");
            }
        };

        this.setNestedLoop = function () {
            var nastedEl = el.querySelector("[\\:loop]"),
                _loop, html = "";

            if (nastedEl) {
                _loop = nastedEl.attributes[":loop"];
                _loop.value = _loop.value.replace(/this/g, this._scope);
                html = nastedEl ? nastedEl.outerHTML : "";
                nastedEl.parentNode.setAttribute("::nested", "");
                nastedEl.remove();
            }

            return html;
        }

        this.createLoopElement = function ($item, index) {
            var _el = $(this.template).get(0),
                bindings = this.compileElement(index, _el, this._scope);

            this.loopElements.push({
                el: _el,
                bindings: bindings
            });

            if (index) {
                $(this.prevEle).after(_el);
                this.prevEle = _el;
            } else {
                $(this.parentEle).append(_el);
                this.prevEle = _el;
            }
        };

        this.compileElement = function (index, el, scope) {
            var _this = this,
                context = scope + "[" + index + "]",
                allRules = [],
                mapEles = [];

            this.replaceAttrValue(el, scope, context);

            pushArray(allRules, this.applyRule(el, sl, true));
            pushArray(mapEles, el.querySelectorAll("[\\:\\:map]"));

            this.remove_If_Loop_Rule_Dependency(mapEles);

            for (var i = 0; i < mapEles.length; i++) {
                _this.replaceAttrValue(mapEles[i], scope, context);
                pushArray(allRules, _this.applyRule(mapEles[i], sl, false));
            }

            return allRules;
        };

        this.remove_If_Loop_Rule_Dependency = function (els) {
            for (var i = 0; i < els.length; i++) {
                if (els[i].attributes[rule.rules.loop]) {
                    var len = els[i].querySelectorAll("[\\:\\:map]").length;
                    els.splice(i + 1, len);
                }
            }
        };

        this.replaceAttrValue = function (el, key, value) {
            for (var i = 0; i < el.attributes.length; i++) {
                var node = el.attributes[i];
                if (node.nodeName.indexOf(":") > -1) {
                    node.nodeValue = node.nodeValue.indexOf(key) > -1 ? node.nodeValue.replace(RegExp(escapeSpecialChar(key), 'g'), value) : node.nodeValue;
                }
            }
        };

        this.removeLoopElement = function (el, index) {
            rule.unbind(sl, lastArrayObj(this.loopElements).bindings);
            this.loopElements.pop();
            index > 0 && (this.prevEle = this.loopElements[index - 1].el);
            $(el).remove();
        }

        this.applyRule = function (_el, sl, isMainLoopNode) {
            var rules = rule.getRules(_el, sl, isMainLoopNode);
            pushArray(this.bindings, rules);
            pushArray(sl.bindings, rules);
            rules.forEach(function (bind) {
                rule.initRule(bind, sl);
            });

            return rules;
        };

        this.apply = function () {
            try {
                var $collection = sl.getValue(scope),
                    len;
                if ($collection.length > this.prevLength) {
                    for (var i = this.prevLength; i < $collection.length; i++) {
                        this.createLoopElement($collection[i], i);
                    }
                    this.prevLength = $collection.length;
                } else if ($collection.length < this.prevLength) {
                    for (var i = $collection.length; i < this.loopElements.length; i++) {
                        len = this.loopElements.length - 1;
                        this.removeLoopElement(this.loopElements[len].el, len);
                        i--;
                    }
                    this.prevLength = $collection.length;
                }
            } catch (e) {

            }
        };

        this.unbind = function (bind) {
            var _el;
            if (this.installed) {
                for (var i = 0; i < this.loopElements.length; i++) {
                    len = this.loopElements.length - 1;
                    this.removeLoopElement(this.loopElements[len].el, len);
                    i--;
                }
                this.prevLength = 0;
                _el = $(this.template).get(0);
                this.parentEle.append(_el);
                bind.el = _el;
            }
        }
    });

    rule.createRule(":prop-property", function (sl, el, scope, type) {
        this.init = function (property) {
            this.property = property;
            return this;
        }

        this.apply = function () {
            var val = sl.getValue(scope)
            if (val && val !== this._prev_val) {
                el.setAttribute(this.property, true);
            } else if (!val && val !== this._prev_val) {
                el.removeAttribute(this.property);
            }

            this._prev_val = val;
        }
    });

    rule.createRule(":attr-attribute", function (sl, el, scope, type) {
        this.init = function (attribute) {
            this.attribute = attribute;
            return this;
        }

        this.apply = function () {
            var val = sl.getValue(scope)
            if (val && val !== this._prev_val) {
                el.setAttribute(this.attribute, val);
            }

            this._prev_val = val;
        }
    })

    rule.createRule(":data-property", function (sl, el, scope, type) {
        this.init = function (property) {
            this.property = property;
            return this;
        }

        this.apply = function () {
            var val = sl.getValue(scope)
            if (val && val !== this._prev_val) {
                el.dataset[this.property] = val;
            }

            this._prev_val = val;
        }
    })
})(ruleEngine, $);