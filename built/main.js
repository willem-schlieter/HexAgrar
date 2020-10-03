"use strict";
var $g = document.querySelector.bind(document), $a = document.querySelectorAll.bind(document), $c = document.createElement.bind(document);
;
function validateZug(start, ziel) {
    console.log("Zug von " + start + " zu " + ziel + " wird zugelassen.");
    return true;
}
var brett = $g("#brett");
if (!brett)
    throw new Error("Missing #brett.");
var felder = $a(".feld");
felder.forEach(function (feld) {
    feld.addEventListener('click', function (event) {
        var _this = event.currentTarget, s = $g(".feld_s");
        if (_this.classList.contains("feld_s"))
            return _this.classList.remove("feld_s");
        if (s) {
            if (validateZug(Number(s.id.replace(/\D/g, "")), Number(_this.id.replace(/\D/g, "")))) {
                if (s.classList.contains("feld_o")) {
                    _this.classList.add("feld_o");
                    _this.classList.remove("feld_x");
                    s.classList.remove("feld_o");
                }
                else {
                    _this.classList.add("feld_x");
                    _this.classList.remove("feld_o");
                    s.classList.remove("feld_x");
                }
                s.classList.remove("feld_s");
            }
            else
                console.warn("Ungültiger Zug – Ignoriere.");
        }
        else {
            if (_this.classList.contains("feld_x") || _this.classList.contains("feld_o"))
                _this.classList.add("feld_s");
            else
                console.warn("Felder ohne Figuren können nicht ausgewählt werden.");
        }
    });
});
var Brett = /** @class */ (function () {
    function Brett() {
    }
    Brett.feld = function (p1, p2) {
        switch (typeof p1 + typeof p2) {
            //coords
            case "number" + "number": {
                if (Number.isNaN(p1) || Number.isNaN(p2) || !Number.isInteger(p1) || !Number.isInteger(p2) || p1 > 5 || p1 < 0 || p2 > 5 || p2 < 0)
                    throw new Error("Invalid coordinates.");
                return this.felder[(6 * p2) + p1];
            }
            case "number" + "undefined":
            case "string" + "undefined": {
                var dez = (typeof p1 === "number") ? p1 : Number.parseInt(p1, 36);
                if (Number.isNaN(dez) || dez > 35 || dez < 0)
                    throw new Error("Invalid field index.");
                else
                    return this.felder[dez];
            }
            default: throw new Error("Invalid format!");
        }
    };
    /**Erstellt 36 `Feld`er und 6 `Y-Indexer` im `Brett`, speichert die `Feld`er in `Brett.felder`.
     * Wendet dann die übergeben Start-`Stellung` an und gibt diese zurück.
     * @param start Die Start-`Stellung`. Default: `012345.uvwxyz`
     */
    Brett.init = function (start) {
        if (!this.brett)
            throw new Error("Brett could not be found.");
        var brett = Brett.brett;
        var pseudoIndexer = document.createElement("div");
        pseudoIndexer.className = "indexer";
        pseudoIndexer.id = "i_pseudo";
        brett.appendChild(pseudoIndexer);
        {
            for (var x = 0; x < 6; x++) {
                var i = document.createElement("div");
                i.className = "indexer indexer_X";
                i.id = "ix_" + x;
                brett.appendChild(i);
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
            {
                for (var dez = 0; dez < 36; dez++) {
                    this.felder[dez] = new Brett.Feld(dez.toString(36));
                }
            }
            return this.applyStellung(start || new Stellung("012345.uvwxyz"));
        }
        /**Wendet eine `Stellung` an, ohne diese zu überprüfen. */
    };
    /**Wendet eine `Stellung` an, ohne diese zu überprüfen. */
    Brett.applyStellung = function (stellung) {
        for (var _i = 0, _a = this.felder; _i < _a.length; _i++) {
            var f = _a[_i];
            if (stellung.x.includes(f.alnum))
                f.fig = Player.X;
            else if (stellung.o.includes(f.alnum))
                f.fig = Player.O;
            else
                f.fig = null;
        }
        return this.current = stellung;
    };
    /**Wendet einen `Zug` nach Überprüfung auf die aktuelle `Stellung` an. Gibt `true` zurück, wenn der `Zug` gültig war und ausgeführt wurde, sonst `false`. */
    Brett.applyZug = function (zug) {
        // ZUG VALIDATION!!!
        // {
        //     let deltaX = zug.to.x - zug.from.x,
        //         deltaY = zug.to.y - zug.from.y;
        // }
        this.current = new Stellung(this.current.code.replace(zug.from.alnum, zug.to.alnum));
        this.feld(zug.to.alnum).fig = this.feld(zug.from.alnum).fig;
        this.feld(zug.from.alnum).fig = null;
        return true;
    };
    Brett.canSelect = function (feld) {
        var _a, _b;
        return Boolean(((_a = feld.domElement) === null || _a === void 0 ? void 0 : _a.classList.contains("feld_x")) || ((_b = feld.domElement) === null || _b === void 0 ? void 0 : _b.classList.contains("feld_o")));
    };
    /*private*/ Brett.brett = $g("#brett");
    /*private???*/ Brett.felder = [];
    /*private?*/ Brett.enPassant = false;
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
        Feld.clickListener = function (event) {
            var _this = event.currentTarget, s = $g(".feld_s");
            // un-select durch wiederholtes klicken
            if (_this.classList.contains("feld_s"))
                return _this.classList.remove("feld_s");
            if (s) {
                // Zug-code extrahieren, Zug konstruieren und ausführen, wenn erfolgreich: un-select
                if (Brett.applyZug(new Stellung.Zug(s.id[2], _this.id[2])))
                    s.classList.remove("feld_s");
            }
            else {
                // wenn möglich: select
                if (Brett.canSelect(Brett.feld(_this.id[2])))
                    _this.classList.add("feld_s");
                else
                    console.log("Could not select.");
            }
        };
        return Feld;
    }());
    return Brett;
}());
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
            return Zug;
        }()),
        _a.pattern = /^[a-z\d]\-[a-z\d]$/i,
        _a);
    return Stellung;
}());
var Player = /** @class */ (function () {
    function Player() {
    }
    Player.X = new Player();
    Player.O = new Player();
    return Player;
}());
// class FeldBAK {
//     /**Construct a `Feld`-object with `dez`, `x`, `y`, `alnum` properties. */
//     constructor (dez: number);
//     constructor (x: 1 | 2 | 3 | 4 | 5 | 0, y: 1 | 2 | 3 | 4 | 5 | 0);
//     constructor (alnum: string);
//     constructor (p1: number | string | 1 | 2 | 3 | 4 | 5 | 0, p2?: 1 | 2 | 3 | 4 | 5 | 0) {
//         switch (typeof p1 + typeof p2) {
//             //coords
//             case "number" + "number": {
//                 if (Number.isNaN(p1) || Number.isNaN(p2) || ! Number.isInteger(p1) || ! Number.isInteger(p2) || p1 > 5 || p1 < 0 || p2! > 5 || p2! < 0) throw new Error("Invalid coordinates.");
//                 this.x = p1 as 1 | 2 | 3 | 4 | 5 | 0;
//                 this.y = p2!;
//                 this.dez = (6 * p2!) + (p1 as 1 | 2 | 3 | 4 | 5 | 0);
//                 this.alnum = this.dez.toString(36);
//                 break;
//             }
//             case "number" + "undefined":
//             case "string" + "undefined": {
//                 let alnum = "", dez = 0;
//                 if (typeof p1 === "number") {
//                     dez = p1 as number;
//                     if (Number.isNaN(dez) || dez > 35 || dez < 0) throw new Error("Invalid decimal field index.");
//                     alnum = dez.toString(36);
//                 } else {
//                     alnum = p1 as string;
//                     dez = Number.parseInt(alnum, 36);
//                     if (Number.isNaN(dez) || dez > 35 || dez < 0) throw new Error("Invalid alphanumeric field index.");
//                 }
//                 this.alnum = alnum;
//                 this.dez = dez;
//                 this.x = dez % 6 as 1 | 2 | 3 | 4 | 5 | 0;
//                 this.y = (dez - this.x) / 6 as 1 | 2 | 3 | 4 | 5 | 0;
//                 break;
//             }
//             default: throw new Error("Invalid format!");
//         }
//         this.domElement = $g("#f_" + this.dez) as HTMLElement | null;
//     }
//     dez: number;
//     x: 1 | 2 | 3 | 4 | 5 | 0;
//     y: 1 | 2 | 3 | 4 | 5 | 0;
//     alnum: string;
//     domElement?: HTMLElement | null;
// }
