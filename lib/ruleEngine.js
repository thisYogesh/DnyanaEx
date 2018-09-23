"use strict";

var ruleEngine = (function (w) {
    return new(extendProto(function (options) {
        this.options = options;
    }, {
        createRule: function (ruleName, handel) {
            var rule, exArgsRule, rn, rd;
            if (arguments.length == 2 && ruleName && handel) {
                exArgsRule = ruleName.match(/^(:[a-z]+)-([a-z]+)$/);
                if (!exArgsRule) {
                    rn = ruleName;
                    rule = {
                        name: rn,
                        handel: handel
                    }
                } else {
                    rn = exArgsRule[1]
                    rd = exArgsRule[2]
                    rule = {
                        name: rn,
                        handel: handel,
                        args: rd
                    }
                }

                this.rules[rn.replace(':', '')] = rn;
                this.ruleMap[rn] = rule;
            } else {
                throw "createRule doesen't satisfy args";
            }
        },
        init: function (sl, el) {
            this.bind(sl, el)
        },
        bind: function (sl, el) {
            var rules = this.collectRules(sl, el);
            this.initBindRules(sl, rules);
            return rules;
        },
        unbind: function (sl, binds) {
            var sb;
            if (sl && !binds) {
                sl.bindings = null;
            } else if (sl && binds && binds.length) {
                for (var j = 0; j < binds.length; j++) {
                    if (binds[j].rule == this.rules.if) {
                        binds[j].$rule.apply(true);
                        binds[j].$rule.unbindElement();
                    } else if (binds[j].rule == this.rules.loop) {
                        binds[j].$rule.unbind(binds[j]);
                    }
                    for (var i = 0; i < sl.bindings.length; i++) {
                        if (sl.bindings[i].el == binds[j].el) {
                            sb = sl.bindings.splice(i, 1);
                            sb = null;
                        }
                    }
                }
            }
        },
        initRule: function (bind, sl) {
            var rule = this.ruleMap[bind.rule];
            if (rule) {
                try {
                    bind.$rule = new rule.handel(sl, bind.el, bind.scope, bind.type, bind.filter)
                    bind.$rule.init(bind.args).apply();
                } catch (e) {
                    console.warn("Error in", rule.name, bind.scope);
                }
            }
        },
        initBindRules: function (sl, rules) {
            this.addRules(sl, rules);
            for (var i = 0; i < rules.length; i++) {
                this.initRule(rules[i], sl);
            }
        },
        collectRules: function (sl, el) {
            var dataMap = el ? el.querySelectorAll("[\\:\\:map]") : sl.$el[0].querySelectorAll("[\\:\\:map]"),
                dataMapArr = [],
                $el,
                isRootMap = !el ? sl.$el.get(0).attributes['::map'] ? true : false : el.attributes['::map'] ? true : false,
                rulesCollection = []

            if (dataMap.length == 0 && isRootMap && !el) {
                this.addRuleToCollection(sl.$el.get(0), sl, rulesCollection);
            } else {
                [].push.apply(dataMapArr, dataMap);
                this.remove_If_Loop_Rule_Dependency(dataMapArr);
                for (var i = 0; i < dataMapArr.length; i++) {
                    if (isRootMap && !i && !el) {
                        this.addRuleToCollection(sl.$el.get(0), sl, rulesCollection);
                    }

                    $el = dataMapArr[i];
                    this.addRuleToCollection($el, sl, rulesCollection);
                }
            }

            return rulesCollection;
        },
        remove_If_Loop_Rule_Dependency: function (els) {
            for (var i = 0; i < els.length; i++) {
                if (els[i].attributes[this.rules.if] || els[i].attributes[this.rules.loop]) {
                    var len = els[i].querySelectorAll("[\\:\\:map]").length;
                    els.splice(i + 1, len);
                }
            }
        },
        addRuleToCollection: function (el, sl, rulesCollection) {
            var binds = this.getRules(el, sl);
            pushArray(rulesCollection, binds);
        },
        addRules: function (sl, binds) {
            pushArray(sl.bindings, binds)
        },
        getRules: function ($el, sl, loop) {
            var attrs = $el.attributes,
                bindings = [],
                isLoop = !attrs[':loop'] ? false : !loop,
                name, value, build, _rule;

            if (!isLoop) {
                for (var a = 0; a < attrs.length; a++) {
                    name = attrs[a].nodeName;
                    value = attrs[a].value;
                    if (name.indexOf(":") > -1 && name != "::map") {
                        _rule = this.getRuleName(name);
                        if (!loop || (loop && name != ":loop")) {
                            build = this.buildScope(value, _rule.name);
                            bindings.push({
                                rule: _rule.name,
                                scope: build.scope,
                                type: build.type,
                                el: $el,
                                filter: build.filter,
                                args: _rule.args
                            });
                        }
                    }
                };
            } else {
                var build = this.buildScope(attrs[':loop'].value);
                bindings.push({
                    rule: attrs[':loop'].nodeName,
                    scope: build.scope,
                    type: build.type,
                    el: $el,
                    filter: build.filter
                });
            }

            return bindings;
        },
        buildScope: function (expr, ruleName) {
            var i, scope, type, ObjSplit, key, value, hasFilter = null;

            if (ruleName == this.rules.event) {
                var EvRx = /[a-z0-9]+:[a-z0-9$_]+\(|\)/ig,
                    _expr, evObj;

                type = "expression";

                if (expr.replace(EvRx, '')) {
                    _expr = expr.replace(EvRx, '').split(",");
                    evObj = _expr.indexOf("$event");
                    if (evObj > -1) {
                        _expr.splice(evObj, 1);
                    }
                    _expr = _expr.join(",") && this.createExpr(_expr.join(","));
                    if (evObj > -1) {
                        _expr = _expr.split(",");
                        _expr.splice(evObj, 0, "$event");
                        _expr = _expr.join(",");
                    }
                    expr = expr.match(EvRx);
                    expr.splice(1, 0, _expr);
                    expr = expr.join("");
                }

                scope = expr;
            } else if (ruleName == this.rules.bind) {
                type = "expression";
                hasFilter = expr.split("|");
                if (hasFilter.length > 1) {
                    expr = hasFilter.splice(0, 1).join("");
                    hasFilter = hasFilter.join("|").replace(/\s+/g, '').split("|");
                } else {
                    hasFilter = null;
                }
                scope = this.createExpr(expr);
            } else if (/^\{/.test(expr) && /\}$/.test(expr)) {
                type = "object";
                scope = expr.substr(1, expr.length - 2).split(",");
                for (i = 0; i < scope.length; i++) {
                    ObjSplit = scope[i].split(":");
                    key = ObjSplit[0];
                    value = ObjSplit[1];

                    key = key.replace(/'/g, '"');
                    key.indexOf('"') == -1 && (key = '"' + key + '"');

                    value = '"' + this.createExpr(value) + '"';

                    scope[i] = key + ':' + value;
                }
                scope = "{" + scope.join(",") + "}";
            } else if (/^(\$?\w+)+$/.test(expr)) {
                type = "expression";
                scope = 'this.' + expr;
            } else {
                type = "expression";
                scope = this.createExpr(expr);
            }

            return {
                scope: scope,
                type: type,
                filter: hasFilter
            };
        },
        getRuleName: function (_name) {
            var isMapNode = _name.indexOf("::") > -1,
                nameSplit = _name.split("-"),
                isArgsRule = nameSplit.length > 1,
                rule = this.ruleMap[nameSplit[0]],
                n = {};

            if ((rule && isArgsRule && rule.args) || (rule && !isArgsRule)) {
                n.name = rule.name
                n.args = nameSplit[1]
            } else if (isMapNode) {
                n.name = _name;
            }

            return n;
        },
        createExpr: function (expr) {
            var i, $var = [],
                escapeChar = ['true', 'false', '+', '-'];

            _scope = expr.replace(/([.]\w+)/g, '').replace(/(^\d+)|["']((\s+)?[\d+\w-\)\(\$\%\^\&\*]+(\s+)?)+["']/ig, '').match(/(?!\d)[\$\w+]+/g);
            if (_scope) {
                for (i = 0; i < _scope.length; i++) {
                    if ($var.indexOf(_scope[i]) == -1 && escapeChar.indexOf(_scope[i]) == -1) {
                        $var.push(_scope[i]);
                    }
                }
                $var.forEach(function (_var) {
                    expr = expr.replace(RegExp("\\b" + _var + "\\b"), 'this.' + _var);
                });
            }

            return expr;
        },
        rules: {},
        ruleMap: {}
    }));

})(window);