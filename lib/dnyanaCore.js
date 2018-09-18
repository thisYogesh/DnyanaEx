window.dnyana = (function ($w, $, ruleEngine, templates) {
    var $jquery = $;
    var $ruleEngine = ruleEngine;
    var $templates = templates($w, $jquery);

    // load templates string
    templateCache($templates);

    // initiate core rules
    ruleSet($ruleEngine, $jquery);

    // export functionality
    var dnyana = {
        $conroller: conroller($w, $templates, $ruleEngine),
        $rule: $ruleEngine
    }

    // return Object of Dnyana
    return dnyana;
})(window, $, ruleEngine, templates)