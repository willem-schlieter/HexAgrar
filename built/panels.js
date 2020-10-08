"use strict";
var _a;
var Panels = {
    values: {
        validate: true,
        indicateAmZug: true,
        indicateZiele: true,
        redo: null,
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
        document.getElementById("lp-validate").checked = true;
        document.getElementById("lp-indicateAmZug").checked = true;
        document.getElementById("lp-indicateZiele").checked = true;
    },
    emitChangeEvent: function (property, value) {
        Panels.values[property] = value || null;
        this.changeListeners.forEach(function (l) { return l({ property: property, value: value || null }); });
    }
};
// Listeners for Checkboxes
["validate", "indicateZiele", "indicateAmZug"].forEach(function (prop) {
    var _a;
    (_a = document.getElementById("lp-" + prop)) === null || _a === void 0 ? void 0 : _a.addEventListener("change", function (event) {
        Panels.emitChangeEvent(prop, event.currentTarget.checked);
    });
});
// Further Listeners
(_a = document.getElementById("lp-redo")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
    Panels.emitChangeEvent("redo");
});
