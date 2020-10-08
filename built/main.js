"use strict";
var $g = document.querySelector.bind(document), $a = document.querySelectorAll.bind(document), $c = document.createElement.bind(document);
;
Brett.init();
Brett.stellung = new Stellung("012345.uvwxyz");
Panels.addChangeListener(function (event) {
    var _a, _b;
    if (event.property === "indicateAmZug")
        (_a = Brett.brett) === null || _a === void 0 ? void 0 : _a.classList[(event.value) ? "add" : "remove"]("brett_indicateAmZug");
    if (event.property === "indicateZiele")
        (_b = Brett.brett) === null || _b === void 0 ? void 0 : _b.classList[(event.value) ? "add" : "remove"]("brett_indicateZiele");
    if (event.property === "redo")
        Brett.redo();
});
window.addEventListener("keypress", function (event) {
    if (event.key === "z")
        Brett.redo();
});
"XXX       XXX\n  XXX     XXX\n   XXX   XXX\n    XXX XXX\n     XXXXX\n    XXX XXX\n   XXX   XXX\n  XXX     XXX\n XXX       XXX";
"   OOOOOOO   \n  OOO     OOO\n OOO       OOO\n OOO       OOO\n OOO       OOO\n OOO       OOO\n OOO       OOO\n  OOO     OOO\n    OOOOOOO   ";
