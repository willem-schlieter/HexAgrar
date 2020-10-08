"use strict";
var Brett = /** @class */ (function () {
    function Brett() {
    }
    Object.defineProperty(Brett, "stellung", {
        /**Die aktuelle `Stellung`. Der Getter wendet die `Stellung` an, ohne diese zu überprüfen! */
        get: function () {
            return Brett._stellung;
        },
        set: function (s) {
            console.log("Setze Stellung: " + s.code);
            for (var _i = 0, _a = Brett.felder; _i < _a.length; _i++) {
                var f = _a[_i];
                if (s.x.includes(f.alnum))
                    f.fig = Player.X;
                else if (s.o.includes(f.alnum))
                    f.fig = Player.O;
                else
                    f.fig = null;
            }
            Brett._stellung = s;
            Hist.unshift(s);
            var result = Stellung.isFinal(s, Brett.amZug);
            if (result) {
                console.log("Spiel beendet mit Exit-Code " + result.code.toUpperCase());
                Brett.ende(result);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Brett, "amZug", {
        get: function () {
            return Brett._amZug;
        },
        set: function (a) {
            var _a, _b;
            (_a = Brett.brett) === null || _a === void 0 ? void 0 : _a.classList.remove("brett_amZug_" + Player.toggle(a).code);
            (_b = Brett.brett) === null || _b === void 0 ? void 0 : _b.classList.add("brett_amZug_" + a.code);
            Brett._amZug = a;
        },
        enumerable: false,
        configurable: true
    });
    Brett.feld = function (p1, p2) {
        switch (typeof p1 + typeof p2) {
            //coords
            case "number" + "number": {
                if (Number.isNaN(p1) || Number.isNaN(p2) || !Number.isInteger(p1) || !Number.isInteger(p2) || p1 > 5 || p1 < 0 || p2 > 5 || p2 < 0)
                    throw new Error("Invalid coordinates: " + p1 + "|" + p2);
                return Brett.felder[(6 * p2) + p1];
            }
            case "number" + "undefined":
            case "string" + "undefined": {
                var dez = (typeof p1 === "number") ? p1 : Number.parseInt(p1, 36);
                if (Number.isNaN(dez) || dez > 35 || dez < 0)
                    throw new Error("Invalid field index.");
                else
                    return Brett.felder[dez];
            }
            default: throw new Error("Invalid format!");
        }
    };
    /**Erstellt 36 `Feld`er und 12 `Indexer` im `Brett`, speichert die `Feld`er in `Brett.felder`.
     * Wendet dann ggf die übergeben Start-`Stellung` (ohne Überprüfung) an und gibt diese zurück.
     * @param start Die Start-`Stellung`. Wenn nicht angegeben, bleibt das Brett leer.
     */
    Brett.init = function (start) {
        if (!Brett.brett)
            throw new Error("Brett could not be found.");
        var brett = Brett.brett;
        Brett.amZug = Player.X;
        Panels.default();
        /**pseudoIndexer, indexer, feld */
        var pseudoIndexer = document.createElement("div");
        pseudoIndexer.className = "indexer";
        pseudoIndexer.id = "i_pseudo";
        brett.appendChild(pseudoIndexer);
        {
            for (var x = 0; x < 6; x++) {
                var i = document.createElement("div");
                i.className = "indexer indexer_X";
                i.id = "ix_" + x;
                i.innerHTML = String(x);
                brett.appendChild(i);
            }
        }
        {
            for (var y = 0; y < 6; y++) {
                var bf = [0, 2, 4, 7, 9, 11, 12, 14, 16, 19, 21, 23, 24, 26, 28, 31, 33, 35], i = 0, indexer = $c("div");
                indexer.id = "iy_" + y;
                indexer.className = "indexer indexer_Y";
                indexer.innerHTML = "<br>" + String(y);
                brett.appendChild(indexer);
                for (var x = 0; x < 6; x++) {
                    i = (6 * y) + x;
                    var feld = $c("div");
                    feld.className = "feld" + ((bf.indexOf(i) + 1) ? " feld_b" : "");
                    feld.id = "f_" + i.toString(36);
                    feld.innerHTML = String(i) + "." + i.toString(36);
                    feld.addEventListener('click', Brett.Feld.clickListener);
                    brett.appendChild(feld);
                }
            }
        }
        /**Brett.felder */
        {
            for (var dez = 0; dez < 36; dez++) {
                Brett.felder[dez] = new Brett.Feld(dez.toString(36));
            }
        }
        return (start) ? Brett.stellung = start : null;
    };
    /**Wendet einen `Zug` ggf. nach Überprüfung auf die aktuelle `Stellung` an.
     * @returns Ob der Zug ausgeführt wurde. */
    Brett.applyZug = function (zug, player) {
        // Wenn ein Feld mit der gleichen Figur angeklickt wird, soll dieses ausgewählt werden.
        // "re-select" dient als quasi-Befehl an Brett.Feld.clickListener().
        if (Panels.values.validate && zug.from.fig === zug.to.fig)
            return "re-select";
        // Ist der Zug ungültig?
        if (Panels.values.validate && !Stellung.Zug.validate(zug, player))
            return "invalid";
        // Sonst Zug ausführen
        Brett.amZug = Player.toggle(Brett.amZug);
        Brett.stellung = new Stellung(Brett.stellung.code.replace(zug.to.alnum, "").replace(zug.from.alnum, zug.to.alnum));
        return "done";
    };
    /**Macht den letzten `Zug` rückgängig und entfernt den Eintrag aus `Hist`. */
    Brett.redo = function () {
        if (Hist.length < 2)
            console.log("Rückgängig: Bin schon ganz am Anfang.");
        else {
            console.log("Rückgängig.");
            Hist.shift();
            Brett.stellung = Hist.shift();
            Brett.amZug = Player.toggle(Brett.amZug);
        }
    };
    /**Gibt an, ob das übergebene Feld ausgewählt werden kann. */
    Brett.canSelect = function (feld) {
        var _a, _b;
        if (Panels.values.validate && feld.fig !== Brett.amZug)
            return false;
        else
            return Boolean(((_a = feld.domElement) === null || _a === void 0 ? void 0 : _a.classList.contains("feld_x")) || ((_b = feld.domElement) === null || _b === void 0 ? void 0 : _b.classList.contains("feld_o")));
    };
    Brett.ende = function (exit) {
        if (exit instanceof Player)
            alert("!!!!! HURRA !!!!!\n " + exit.code.toUpperCase() + " HAT GEWONNEN!\n!!!!! HURRA !!!!!");
        else if (exit.code === "remis")
            alert("Tja, das ist wohl ein Remis geworden!");
        else
            alert("Hier ist irgendwas komisch. Beide haben gewonnen? Naja, ist ja auch mal schön.");
    };
    /*private*/ Brett.brett = document.getElementById("brett");
    /*private???*/ Brett.felder = [];
    Brett.selected = null;
    Brett.Feld = /** @class */ (function () {
        function Feld(alnum, player) {
            this._fig = null;
            this.dez = Number.parseInt(alnum, 36);
            if (Number.isNaN(this.dez) || !Number.isInteger(this.dez) || this.dez > 35 || this.dez < 0)
                throw new Error("Invalid alphanumeric field index.");
            this.alnum = alnum;
            this.x = this.dez % 6;
            this.y = (this.dez - (this.dez % 6)) / 6;
            this.domElement = $g("#f_" + alnum);
            if (player)
                this.fig = player;
        }
        Feld.clickListener = function (event) {
            var _a;
            var selected = document.getElementsByClassName("feld_s")[0], sF = (selected) ? Brett.feld(selected.id[2]) : null, _this = Brett.feld(event.currentTarget.id[2]);
            // un-select durch wiederholtes klicken
            if (Brett.selected === _this)
                return Brett.selected.unselect();
            if (sF) {
                switch (Brett.applyZug(new Stellung.Zug(sF.alnum, _this.alnum), sF.fig)) {
                    case "done":
                        (_a = Brett.selected) === null || _a === void 0 ? void 0 : _a.unselect();
                        break;
                    case "re-select":
                        _this.select();
                        break;
                }
            }
            else {
                // wenn möglich: select
                if (Brett.canSelect(_this))
                    _this.select();
                else
                    console.log("Could not select.");
            }
        };
        Object.defineProperty(Feld.prototype, "fig", {
            get: function () {
                return this._fig;
            },
            set: function (player) {
                var _a, _b, _c, _d;
                if (player instanceof Player) {
                    var classes = ["feld_x"];
                    classes[(player === Player.X) ? "push" : "unshift"]("feld_o");
                    (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.classList.add(classes[0]);
                    (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.classList.remove(classes[1]);
                }
                else {
                    (_c = this.domElement) === null || _c === void 0 ? void 0 : _c.classList.remove("feld_x");
                    (_d = this.domElement) === null || _d === void 0 ? void 0 : _d.classList.remove("feld_o");
                }
                this._fig = player;
            },
            enumerable: false,
            configurable: true
        });
        ;
        ;
        Feld.prototype.select = function () {
            var _a, _b;
            (_a = Brett.selected) === null || _a === void 0 ? void 0 : _a.unselect();
            (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.classList.add("feld_s");
            Brett.selected = this;
            // neue Ziele markieren
            Brett.stellung.zieleVon(this.dez).forEach(function (dez) {
                var _a;
                (_a = Brett.feld(dez).domElement) === null || _a === void 0 ? void 0 : _a.classList.add("feld_z");
            });
        };
        ;
        Feld.prototype.unselect = function () {
            var _a;
            (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.classList.remove("feld_s");
            Brett.selected = null;
            // "clear" alte Ziele
            document.querySelectorAll(".feld_z").forEach(function (f) {
                f.classList.remove("feld_z");
            });
        };
        return Feld;
    }());
    return Brett;
}());
