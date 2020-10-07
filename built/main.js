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
Brett.applyStellung(new Stellung("012345.uvwxyz"));
// Panels.addChangeListener((event) => {
// if (event.property === "validate") Brett.indicateAmZug = event.value;
// });
