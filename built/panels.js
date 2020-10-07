"use strict";
var _a, _b;
var Panels = {
    values: {
        validate: true
    },
    addChangeListener: function (listener) {
        this.changeListeners.push(listener);
    },
    removeChangeListener: function (listener) {
        var i = this.changeListeners.indexOf(listener);
        if (i)
            this.changeListeners.splice(i, 1);
    },
    changeListeners: [],
    default: function () {
        document.getElementById("lp-valid").checked = true;
        document.getElementById("lp-indicateAmZug").checked = true;
    }
};
(_a = document.getElementById("lp-valid")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", function (event) {
    var ev = {
        property: "validate",
        value: Panels.values.validate = event.currentTarget.checked
    };
    Panels.changeListeners.forEach(function (l) { return l(ev); });
});
(_b = document.getElementById("lp-indicateAmZug")) === null || _b === void 0 ? void 0 : _b.addEventListener("change", function (event) {
    Brett.indicateAmZug = event.currentTarget.checked;
});
