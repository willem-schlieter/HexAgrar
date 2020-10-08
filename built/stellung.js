"use strict";
var Stellung = /** @class */ (function () {
    function Stellung(code) {
        var _a;
        if (!code.match(Stellung.pattern))
            throw new Error("Invalid position code: " + code);
        this.code = code;
        _a = code.split("."), this.x = _a[0], this.o = _a[1];
    }
    /**Überprüft, ob ein Spiel mit der gegebenen `Stellung` beendet ist.
     *
     * Gibt den Gewinner `Player`, bei Remis `Player.Remis`, bei Unentschieden `Player.Both`, und bei einer nicht-finalen Stellung `null` zurück.
     *
     * (Unentschieden ist das Spiel, wenn beide `Player` in der `Stellung` die Endlinie erreicht haben.)
     *
     * @param p Der Spieler, der gerade an der Reihe ist. Das ist wichtig, um herauszufinden, ob Remis ist.
    */
    Stellung.isFinal = function (s, p) {
        var xe = s.x.match(/[uvwxyz]/), oe = s.o.match(/[012345]/);
        if (xe && oe)
            return Player.Both;
        if (xe)
            return Player.X;
        if (oe)
            return Player.O;
        if (!p.zuege().length)
            return Player.Remis;
        else
            return null;
    };
    /**Gibt die Felder (dezimaler Index) zurück, auf die die Figur eines Startfeldes ziehen könnte.
     * @param i Der dezimale Index des Startfeldes.
    */
    Stellung.prototype.zieleVon = function (i) {
        if (i > 35 || i < 0 || !Number.isInteger(i))
            throw new Error("Invalid field index: " + i);
        var c = Brett.feld;
        // Das Feld ist leer -> keine Figur?
        if (!this.code.includes(c(i).alnum)) {
            console.debug("Feld ist leer.");
            return [];
        }
        var pl = ((this.x.includes(c(i).alnum)) ? "x" : "o"), anti = ((pl === "x") ? "o" : "x"), result = [], p = (pl === "x") ? 1 : -1;
        // Steht in der letzten Reihe?
        if (c(i).y === 2.5 + 2.5 * p) {
            console.debug("Feld am Ende");
            return [];
        }
        // 1 SCHRITT
        if (!this.code.includes(c(i + p * 6).alnum))
            result.push(i + p * 6);
        // 2 SCHRITTE
        if (c(i).y == 2.5 + (p * -1 * 2.5)) { // Initialstellung?
            if (!(this.code.includes(c(i + p * 12).alnum)) &&
                !(this.code.includes(c(i + p * 6).alnum)))
                result.push(i + p * 12);
        }
        // LINKS SCHLAGEN
        if (c(i).x > 0) { // ist nicht ganz links
            var schlagLinks = c(c(i).x - 1, c(i).y + p);
            if (this[anti].includes(schlagLinks.alnum))
                result.push(schlagLinks.dez);
        }
        // RECHTS SCHLAGEN
        if (c(i).x < 5) { // ist nicht ganz rechts
            var schlagRechts = c(c(i).x + 1, c(i).y + p);
            if (this[anti].includes(schlagRechts.alnum))
                result.push(schlagRechts.dez);
        }
        return result;
    };
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
                    console.log("Zug: Ein Schritt.");
                    return true;
                }
                // 2 Schritt
                else if (deltaX === 0 && deltaY === 2 &&
                    zug.to.fig === null &&
                    Brett.feld((zug.to.dez + zug.from.dez) / 2).fig === null) {
                    if ((player.x && zug.from.dez < 6) ||
                        (player.o && zug.from.dez > 29)) {
                        console.log("Zug: Zwei Schritt.");
                        return true;
                    }
                    else {
                        console.log("Zug: Zwei Schritt – Ungültig weil nicht in Initialstellung.");
                    }
                }
                // Schlag
                else if (deltaX === 1 && deltaY === 1 &&
                    zug.to.fig === Player.toggle(player)) {
                    console.log("Zug: Schlag.");
                    return true;
                }
                // Ungültig
                else {
                    console.log("Zug ungültig.");
                    return false;
                }
            };
            return Zug;
        }()),
        _a.pattern = /^[a-z\d]\-[a-z\d]$/i,
        _a);
    return Stellung;
}());
