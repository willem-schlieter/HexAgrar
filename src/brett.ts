interface Feld {
    dez: number;
    x: 1 | 2 | 3 | 4 | 5 | 0;
    y: 1 | 2 | 3 | 4 | 5 | 0;
    alnum: string;
    domElement: HTMLElement | null;
    fig: Player | null;
}

class Brett {
    /*private*/ static brett = document.getElementById("brett") as HTMLElement | null;
    /*private???*/ static felder: Feld[] = [];

    private static _stellung: Stellung;
    /**Die aktuelle `Stellung`. Der Getter wendet die `Stellung` an, ohne diese zu überprüfen! */
    static get stellung (): Stellung {
        return Brett._stellung;
    }
    static set stellung (s: Stellung) {
        console.log("Setze Stellung: " + s.code);
        for (let f of Brett.felder) {
            if (s.x.includes(f.alnum)) f.fig = Player.X;
            else if (s.o.includes(f.alnum)) f.fig = Player.O;
            else f.fig = null;
        }
        Brett._stellung = s;
        Hist.unshift(s);
    }

    private static _indicateAmZug: boolean;
    static get indicateAmZug (): boolean {
        return this._indicateAmZug;
    }
    static set indicateAmZug (a: boolean) {
        Brett._indicateAmZug = a;
        if (a) {
            Brett.brett?.classList.remove("brett_amZug_" + Player.toggle(Brett.amZug).code);
            Brett.brett?.classList.add("brett_amZug_" + Brett.amZug.code);
        } else {
            Brett.brett?.classList.remove("brett_amZug_x");
            Brett.brett?.classList.remove("brett_amZug_o");
        }
    }

    private static _amZug: Player;
    static get amZug (): Player {
        return Brett._amZug;
    }
    static set amZug (a: Player) {
        if (Brett.indicateAmZug) {
            Brett.brett?.classList.remove("brett_amZug_" + Player.toggle(a).code);
            Brett.brett?.classList.add("brett_amZug_" + a.code);
        }
        Brett._amZug = a;
    }

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

    /**Erstellt 36 `Feld`er und 12 `Indexer` im `Brett`, speichert die `Feld`er in `Brett.felder`.
     * Wendet dann ggf die übergeben Start-`Stellung` (ohne Überprüfung) an und gibt diese zurück.
     * @param start Die Start-`Stellung`. Wenn nicht angegeben, bleibt das Brett leer.
     */
    static init (start?: Stellung): Stellung | null {
        if (! Brett.brett) throw new Error("Brett could not be found.");
        let brett = Brett.brett!;

        Brett.amZug = Player.X;
        Brett.indicateAmZug = true;
        Panels.default();

        /**pseudoIndexer, indexer, feld */
        let pseudoIndexer = document.createElement("div");
        pseudoIndexer.className = "indexer";
        pseudoIndexer.id = "i_pseudo"
        brett.appendChild(pseudoIndexer);
        {for (let x = 0; x < 6; x ++) {
            let i = document.createElement("div");
            i.className = "indexer indexer_X";
            i.id = "ix_" + x;
            i.innerHTML = String(x);
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

        /**Brett.felder */
        {for (let dez = 0; dez < 36; dez ++) {
            Brett.felder[dez] = new Brett.Feld(dez.toString(36));
        }}

        return (start) ? Brett.stellung = start : null;
    }

    /**Wendet einen `Zug` ggf. nach Überprüfung auf die aktuelle `Stellung` an.
     * @returns Ob der Zug ausgeführt wurde. */
    static applyZug (zug: Zug, player: Player): "done" | "re-select" | "invalid" {
        // Wenn ein Feld mit der gleichen Figur angeklickt wird, soll dieses ausgewählt werden.
        // "re-select" dient als quasi-Befehl an Brett.Feld.clickListener().
        if (Panels.values.validate && zug.from.fig === zug.to.fig) return "re-select";
        // Ist der Zug ungültig.
        if (Panels.values.validate && ! Stellung.Zug.validate(zug, player)) return "invalid";
        // Sonst Zug ausführen
        Brett.stellung = new Stellung(Brett.stellung.code.replace(zug.to.alnum, "").replace(zug.from.alnum, zug.to.alnum));
        Brett.amZug = Player.toggle(Brett.amZug);
        return "done";
    }

    static canSelect (feld: Feld): boolean {
        if (Panels.values.validate && feld.fig !== Brett.amZug) return false;
        else return Boolean(feld.domElement?.classList.contains("feld_x") || feld.domElement?.classList.contains("feld_o"));
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
                switch (Brett.applyZug(new Stellung.Zug(s.id[2], _this.id[2]), Brett.feld(s.id[2]).fig!)) {
                    case "done":
                        s.classList.remove("feld_s");
                        break;
                    case "re-select":
                        s.classList.remove("feld_s");
                        _this.classList.add("feld_s");
                        break;
                }
            } else {
                // wenn möglich: select
                if (Brett.canSelect(Brett.feld(_this.id[2]))) _this.classList.add("feld_s");
                else console.log("Could not select.");
            }
        }
    }
}