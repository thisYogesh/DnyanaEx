"use strict";

function extendProto(Class, proto) {
    for (var handel in proto) {
        Class.prototype[handel] = proto[handel];
    }

    return Class;
};

function pushArray(mainObj, values) {
    Array.prototype.push.apply(mainObj, values);
}

function lastArrayObj(mainObj) {
    return mainObj[mainObj.length - 1];
}

function escapeSpecialChar(str) {
    for (var i = 0; i < str.length; i++) {
        if (/\[|\]/.test(str[i])) {
            str = str.substr(0, i) + "\\" + str[i] + str.substr(i + 1);
            i += 1;
        }
    }
    return str;
}

function deepClone(Obj) {
    return JSON.parse(JSON.stringify(Obj));
}

function extentThis(obj, extObj) {
    if (typeof obj == "object" && typeof extObj == "object") {
        for (var key in extObj) {
            obj[key] = extObj[key];
        }
    }
}