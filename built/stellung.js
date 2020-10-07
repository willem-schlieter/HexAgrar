"use strict";
var Stellung = /** @class */ (function () {
    function Stellung(code) {
        var _a;
        if (!code.match(Stellung.pattern))
            throw new Error("Invalid position code: " + code);
        this.code = code;
        _a = code.split("."), this.x = _a[0], this.o = _a[1];
    }
    var _a;
    Stellung.pattern = /^[a-z\d]{0,6}\.[a-z\d]{0,6}$/i;
    Stellung.Zug = (_a = /** @class */ (function () {
            function Zug(p1, p2) {
                if (p1 instanceof Brett.Feld && p2 instanceof Brett.Feld) {
                    this.from = p1;
                    this.to = p2;
                    this.code = this.from.alnum + "-" + this.to.alnum;
                }
                else if (typeof p1 === 'string') {
                    if (typeof p2 === 'string') {
                        this.from = Brett.feld(p1);
                        this.to = Brett.feld(p2);
                        this.code = this.from.alnum + "-" + this.to.alnum;
                    }
                    else {
                        if (!p1.match(Zug.pattern))
                            throw new Error("Invalid movement code: " + p1);
                        this.code = p1;
                        this.from = Brett.feld(p1.split("-")[0]);
                        this.to = Brett.feld(p1.split("-")[1]);
                    }
                }
                else
                    throw new Error("Invalid parameter format: " + p1 + ", " + p2);
            }
            Zug.validate = function (zug, player) {
                var deltaX = Math.abs(zug.to.x - zug.from.x), deltaY = (zug.to.y - zug.from.y) * ((player.o) ? -1 : 1);
                // 1 Schritt
                if (deltaX === 0 && deltaY === 1 && zug.to.fig === null) {
                    console.log("Ein Schritt.");
                    return true;
                }
                // 2 Schritt
                else if (deltaX === 0 && deltaY === 2 &&
                    zug.to.fig === null &&
                    Brett.feld((zug.to.dez + zug.from.dez) / 2).fig === null) {
                    if ((player.x && zug.from.dez < 6) ||
                        (player.o && zug.from.dez > 29)) {
                        console.log("Zwei Schritt.");
                        return true;
                    }
                    else {
                        console.log("Ungültig weil nicht in Initialstellung.");
                    }
                }
                // Schlag
                else if (deltaX === 1 && deltaY === 1 &&
                    zug.to.fig === Player.toggle(player)) {
                    console.log("Schlag.");
                    return true;
                }
                // Ungültig
                else {
                    console.log("Ungültig.");
                    return false;
                }
            };
            return Zug;
        }()),
        _a.pattern = /^[a-z\d]\-[a-z\d]$/i,
        _a);
    return Stellung;
}());
