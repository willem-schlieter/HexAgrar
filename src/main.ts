let $g: typeof document.querySelector = document.querySelector.bind(document),
    $a: typeof document.querySelectorAll = document.querySelectorAll.bind(document),
    $c: typeof document.createElement = document.createElement.bind(document);
;

interface Feld {
    dez: number;
    x: 1 | 2 | 3 | 4 | 5 | 0;
    y: 1 | 2 | 3 | 4 | 5 | 0;
    alnum: string;
    domElement: HTMLElement | null;
    fig: Player | null;
}
class Brett {
    /*private*/ static brett = $g("#brett") as HTMLElement | null;
    /*private???*/ static felder: Feld[] = [];
    /*private*/ static current: Stellung;
    /*private?*/ static enPassant: boolean = false;

    /**Die Methode nimmt als Parameter einen alphanumerischen Index,
     * einen dezimalen Index, oder xy-Koordinaten eines Feldes entgegen
     * und gibt dieses `Feld` zurück. */
    static feld (dez: number): Feld;
    static feld (x: 1 | 2 | 3 | 4 | 5 | 0, y: 1 | 2 | 3 | 4 | 5 | 0): Feld;
    static feld (alnum: string): Feld;
    static feld (p1: number | string | 1 | 2 | 3 | 4 | 5 | 0, p2?: 1 | 2 | 3 | 4 | 5 | 0): Feld {
        switch (typeof p1 + typeof p2) {
            //coords
            case "number" + "number": {
                if (Number.isNaN(p1) || Number.isNaN(p2) || ! Number.isInteger(p1) || ! Number.isInteger(p2) || p1 > 5 || p1 < 0 || p2! > 5 || p2! < 0) throw new Error("Invalid coordinates.");
                return this.felder[(6 * p2!) + (p1 as number)]
            }
            case "number" + "undefined":
            case "string" + "undefined": {
                let dez = (typeof p1 === "number") ? p1 as number : Number.parseInt(p1 as string, 36);
                if (Number.isNaN(dez) || dez > 35 || dez < 0) throw new Error("Invalid field index.");
                else return this.felder[dez];
            }
            default: throw new Error("Invalid format!");
        }
    }

    /**Erstellt 36 `Feld`er und 6 `Y-Indexer` im `Brett`, speichert die `Feld`er in `Brett.felder`.
     * Wendet dann die übergeben Start-`Stellung` an und gibt diese zurück.
     * @param start Die Start-`Stellung`. Default: `012345.uvwxyz`
     */
    static init (start?: Stellung): Stellung {
        if (! this.brett) throw new Error("Brett could not be found.");
        let brett = Brett.brett!;

        let pseudoIndexer = document.createElement("div");
        pseudoIndexer.className = "indexer";
        pseudoIndexer.id = "i_pseudo"
        brett.appendChild(pseudoIndexer);
        {for (let x = 0; x < 6; x ++) {
            let i = document.createElement("div");
            i.className = "indexer indexer_X";
            i.id = "ix_" + x;
            brett.appendChild(i);
        }}
        {for (let y = 0; y < 6; y ++) {
            let bf = [0, 2, 4, 7, 9, 11, 12, 14, 16, 19, 21, 23, 24, 26, 28, 31, 33, 35],
                i = 0,
                indexer = $c("div");
            indexer.id = "iy_" + y;
            indexer.className = "indexer indexer_Y";
            indexer.innerHTML = "<br>" + String(y);
            brett.appendChild(indexer);
        
            for (let x = 0; x < 6; x++) {
                i = (6 * y) + x;
                let feld = $c("div");
                feld.className = "feld" + ((bf.indexOf(i) + 1) ? " feld_b" : "");
                feld.id = "f_" + i.toString(36);
                feld.innerHTML = String(i) + "." + i.toString(36);
                feld.addEventListener('click', Brett.Feld.clickListener);
                brett.appendChild(feld);
            }
        }}

        {for (let dez = 0; dez < 36; dez ++) {
            this.felder[dez] = new Brett.Feld(dez.toString(36));
        }}

        return this.applyStellung(start || new Stellung("012345.uvwxyz"));
    }
    /**Wendet eine `Stellung` an, ohne diese zu überprüfen. */
    static applyStellung (stellung: Stellung): Stellung {
        for (let f of this.felder) {
            if (stellung.x.includes(f.alnum)) f.fig = Player.X;
            else if (stellung.o.includes(f.alnum)) f.fig = Player.O;
            else f.fig = null;
        }
        return this.current = stellung;
    }
    /**Wendet einen `Zug` nach Überprüfung auf die aktuelle `Stellung` an. Gibt `true` zurück, wenn der `Zug` gültig war und ausgeführt wurde, sonst `false`. */
    static applyZug (zug: Zug): boolean {
        // ZUG VALIDATION!!!
        // {
        //     let deltaX = zug.to.x - zug.from.x,
        //         deltaY = zug.to.y - zug.from.y;
            
        // }
        this.current = new Stellung(this.current.code.replace(zug.from.alnum, zug.to.alnum));
        this.feld(zug.to.alnum).fig = this.feld(zug.from.alnum).fig;
        this.feld(zug.from.alnum).fig = null;
        return true;
    }
    static canSelect (feld: Feld): boolean {
        return Boolean(feld.domElement?.classList.contains("feld_x") || feld.domElement?.classList.contains("feld_o"));
    }
    static Feld = class Feld implements Feld {
        constructor (alnum: string, player?: Player | null) {
            this.dez = Number.parseInt(alnum, 36);
            if (Number.isNaN(this.dez) || ! Number.isInteger(this.dez) || this.dez > 35 || this.dez < 0) throw new Error("Invalid alphanumeric field index.");
    
            this.alnum = alnum;
            this.x = this.dez % 6 as 1 | 2 | 3 | 4 | 5 | 0;
            this.y = (this.dez - (this.dez % 6)) / 6 as 1 | 2 | 3 | 4 | 5 | 0;
            this.domElement = $g("#f_" + alnum) as HTMLElement | null;

            if (player) this.fig = player;
        }
        dez: number;
        x: 1 | 2 | 3 | 4 | 5 | 0;
        y: 1 | 2 | 3 | 4 | 5 | 0;
        alnum: string;
        domElement: HTMLElement | null;
        private _fig: Player | null = null;
        get fig (): Player | null {
            return this._fig;
        };
        set fig (player: Player | null) {
            if (player instanceof Player) {
                let classes = ["feld_x"];
                classes[(player === Player.X) ? "push" : "unshift"]("feld_o");
                this.domElement?.classList.add(classes[0]);
                this.domElement?.classList.remove(classes[1]);
            } else {
                this.domElement?.classList.remove("feld_x");
                this.domElement?.classList.remove("feld_o");
            }
            this._fig = player;
        }
        static clickListener(event: MouseEvent) {
            let _this = (event.currentTarget as HTMLElement),
                s = $g(".feld_s");

            // un-select durch wiederholtes klicken
            if (_this.classList.contains("feld_s")) return _this.classList.remove("feld_s");

            if (s) {
                // Zug-code extrahieren, Zug konstruieren und ausführen, wenn erfolgreich: un-select
                if (Brett.applyZug(new Stellung.Zug(s.id[2], _this.id[2]))) s.classList.remove("feld_s");
            } else {
                // wenn möglich: select
                if (Brett.canSelect(Brett.feld(_this.id[2]))) _this.classList.add("feld_s");
                else console.log("Could not select.");
            }
        }
    }
}


interface Zug {
    readonly code: string;
    readonly from: Feld;
    readonly to: Feld;
}
class Stellung implements Stellung {
    static readonly pattern = /^[a-z\d]{0,6}\.[a-z\d]{0,6}$/i;
    static Zug = class Zug implements Zug {
        static readonly pattern = /^[a-z\d]\-[a-z\d]$/i;
        constructor (from: Feld, to: Feld);
        constructor (code: string);
        constructor (fromID: string, toID: string);
        constructor (p1: Feld | string, p2?: Feld | string) {
            if (p1 instanceof Brett.Feld && p2 instanceof Brett.Feld) {
                this.from = p1 as Feld;
                this.to = p2 as Feld;
                this.code = this.from.alnum + "-" + this.to.alnum;
            } else if (typeof p1 === 'string') {
                if (typeof p2 === 'string') {
                    this.from = Brett.feld(p1 as string);
                    this.to = Brett.feld(p2 as string);
                    this.code = this.from.alnum + "-" + this.to.alnum;
                } else {
                    if (! (p1 as string).match(Zug.pattern)) throw new Error("Invalid movement code: " + p1);
                    this.code = p1;
                    this.from = Brett.feld(p1.split("-")[0]);
                    this.to = Brett.feld(p1.split("-")[1]);
                }
            } else throw new Error("Invalid parameter format: " + p1 + ", " + p2);
        }
        readonly code: string;
        readonly from: Feld;
        readonly to: Feld;
    }

    constructor (code: string) {
        if (! code.match(Stellung.pattern)) throw new Error("Invalid position code: " + code);
        this.code = code;
        [this.x, this.o] = code.split(".");
    }
    readonly code: string;
    readonly x: string;
    readonly o: string;
}

class Player {
    constructor () {}
    static X = new Player();
    static O = new Player();
}


Brett.init();


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