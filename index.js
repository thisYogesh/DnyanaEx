var fs = require('fs')
var minifier = require("uglify-js");
var outputPath = 'dnyana.js'
var files = ['jquery.js', 'utility.s', 'template.js', 'ruleEngine.js', 'scriptlet.js', 'rules.js'];
var os = fs.openSync(outputPath, 'w');

try {
    let content = "";
    for (var i = 0; i < files.length; i++) {
        let result = minifier.minify(fs.readFileSync(`./lib/${files[i]}`, 'utf8'));
        content += `\n/** ===== Start of file ${files[i]} ===== **/\n`;
        content += result.code;
        content += `\n/** ===== End of file ${files[i]} ===== **/\n\n`;
    };

    fs.writeFileSync(outputPath, content, 'utf8');
    fs.closeSync(os);

    console.log('\x1b[42m', `${outputPath} created!`, '\x1b[0m')
} catch (e) {
    console.log('\x1b[41m', `error in ${e.path}`, '\x1b[0m')
}