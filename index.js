var fs = require('fs')
var minifier = require("uglify-js");
var outputPath = 'dnyana.js'

// do not change the sequence of the files 
var files = [
    'jquery.js',
    'utility.js',
    'template.js',
    'ruleEngine.js',
    'scriptlet.js',
    'rules.js',
    'dnyanaCore.js'
];

try {
    let content = "";
    let templateCache = createTemplateCache();
    let error = false

    for (var i = 0; i < files.length; i++) {
        let result = getFileData(`./lib/${files[i]}`);

        if (!result.error) {
            content += `\n/** ===== Start of file ${files[i]} ===== **/\n`;
            content += result.code;
            content += `\n/** ===== End of file ${files[i]} ===== **/\n\n`;
        } else {
            console.log('\x1b[41m', `Operation abort error in ${files[i]}: ${result.error}`, '\x1b[0m');
            error = true;
            break;
        }

        // putting tamplate cache after template.js
        if (files[i] == "template.js") {
            content += `\n/** ===== Start Of Tamplate Cache ===== **/\n`;
            content += templateCache;
            content += `\n/** ===== End Of Tamplate Cache ===== **/\n\n`;
        }
    };

    if (!error) {
        createFile(outputPath, content)
        console.log('\x1b[42m', `${outputPath} created!`, '\x1b[0m')
    }
} catch (e) {
    console.log('\x1b[41m', `error in ${e}, on ${e.path}`, '\x1b[0m')
}

function createFile(outputPath, content) {
    let os = fs.openSync(outputPath, 'w');
    fs.writeFileSync(outputPath, content, 'utf8');
    fs.closeSync(os);
}

function getFileData(path, doMinify = true) {
    return doMinify ? minifier.minify(fs.readFileSync(path, 'utf8')) : fs.readFileSync(path, 'utf8');
}

function createTemplateCache() {
    let files = fs.readdirSync('./templates');
    let templateCache = ""

    files.forEach(function (file) {
        let _file = getFileData('./templates/' + file, false)
        _file = _file.replace(/(\r\n|\n|\r)/g, '').replace(/'/g, "\\'");
        templateCache += `templates.put('${file}', '${_file}')\n`
    })

    // createFile("templateCache.js", templateCache);
    console.log('\x1b[42m', `Template Cache Created!`, '\x1b[0m')

    return "var templateCache = " + new Function('templates', templateCache)
}