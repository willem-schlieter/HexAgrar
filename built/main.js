"use strict";
var $g = document.querySelector.bind(document), $a = document.querySelectorAll.bind(document), $c = document.createElement.bind(document);
;
var Player = /** @class */ (function () {
    function Player(x) {
        this.o = !(this.x = x);
        this.code = (x) ? "x" : "o";
    }
    Player.toggle = function (player) {
        return (player.x) ? Player.O : Player.X;
    };
    Player.X = new Player(true);
    Player.O = new Player(false);
    return Player;
}());
Brett.init();
Brett.stellung = new Stellung("012345.uvwxyz");
document.getElementById("lp-back").onclick = function () {
    if (Hist.length < 2)
        console.log("Rückgängig: Bin schon ganz am Anfang.");
    else {
        console.log("Rückgängig.");
        Hist.shift();
        Brett.stellung = Hist.shift();
        Brett.amZug = Player.toggle(Brett.amZug);
    }
};
window.addEventListener("keypress", function (event) {
    var _a;
    if (event.key === "z")
        (_a = document.getElementById("lp-back")) === null || _a === void 0 ? void 0 : _a.click();
});
// Panels.addChangeListener((event) => {
// if (event.property === "validate") Brett.indicateAmZug = event.value;
// });
