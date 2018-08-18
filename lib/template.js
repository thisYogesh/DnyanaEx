"use strict";

var templates = function (win, $) {
    return new(extendProto(function () {
        this.templatesLoadedEV = win.document.createEvent("Event");
        this.templatesLoadedEV.initEvent("templatesLoaded", true, true);

        this.root = "templates/";
        this.extention = ".html";
    }, {
        render: function (config) {
            var template = this.templates[config.template] || {},
                selector = typeof template.el == "string" ? template.el.replace(':', '\\:') : template.el,
                el, $el = $(selector);

            if ($el.length) {
                template.content = template.content.replace(/>\s+/g, '>');
                el = $(template.content);
                this.copyRules($el, el);
                $el.replaceWith(el);
                template.el = el;
            }
        },
        add: function (config, ind) {
            var _this = this,
                tInd = ind || 0;

            if (!config.content) {
                if (typeof config.template == "string") {
                    this.loadTemplate(config.template, {
                        success: function (html) {
                            _this.templates[config.template] = {
                                content: html,
                                el: "template:" + config.template
                            };
                            _this.render({
                                template: config.template
                            });
                            config.onLoaded && config.onLoaded();
                        },
                        error: function (error) {
                            config.onError && config.onError(error);
                        }
                    });
                } else {
                    this.loadTemplate(config.template[tInd], {
                        success: function (html) {
                            var temp = config.template[tInd - 1];
                            _this.templates[temp] = {
                                content: html,
                                el: "template:" + temp
                            };

                            _this.render({
                                template: temp
                            });

                            if (tInd < config.template.length) {
                                _this.add(config, tInd);
                            } else {
                                config.onLoaded && config.onLoaded();
                            }
                        },
                        error: function (error) {
                            config.onError && config.onError(error);
                        }
                    });

                    tInd++;
                }

            } else {
                this.templates[config.template] = {
                    content: config.content,
                    el: "template:" + config.template
                };
                this.render({
                    template: config.template
                });
            }

            return this;
        },
        loadTemplate: function (template, config) {
            var templateUrl = this.root + template + this.extention;
            $.get({
                url: templateUrl,
                success: function (resp) {
                    console.log(templateUrl + " get!");
                    config.success && config.success(resp)
                },
                error: function () {
                    console.log("This template(" + templateUrl + ") doesen't exists")
                }
            });
        },
        get: function (templateName) {
            return this.templates[templateName];
        },
        copyRules: function ($el, el) {
            var attrs = $el.get(0).attributes;
            for (var i = 0; i < attrs.length; i++) {
                el.attr(attrs[i].nodeName, attrs[i].value);
            }
        },
        templates: {}
    }));
}(window, jQuery);