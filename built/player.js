"use strict";
var Remis = /** @class */ (function () {
    function Remis() {
        this.remis = true;
        this.code = "remis";
    }
    return Remis;
}());
;
var Both = /** @class */ (function () {
    function Both() {
        this.both = true;
        this.code = "both";
    }
    return Both;
}());
var Player = /** @class */ (function () {
    function Player(x) {
        this.o = !(this.x = x);
        this.code = (x) ? "x" : "o";
    }
    Player.toggle = function (player) {
        return (player.x) ? Player.O : Player.X;
    };
    /**Gibt ein `Array` mit allen `Zug`[Zügen] zurück, die in der aktuellen `Brett.stellung` für diesen `Player` möglich sind. */
    Player.prototype.zuege = function () {
        var _this = this;
        return Array.prototype.concat.apply([], Brett.felder.filter(function (f) { return f.fig === _this; }).map(function (f) { return Brett.stellung.zieleVon(f.dez).map(function (dez) { return new Stellung.Zug(f, Brett.feld(dez)); }); }));
    };
    Player.X = new Player(true);
    Player.O = new Player(false);
    Player.Remis = new Remis();
    Player.Both = new Both();
    return Player;
}());
