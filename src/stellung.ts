interface Zug {
    readonly code: string;
    readonly from: Feld;
    readonly to: Feld;
}

class Stellung implements Stellung {
    static readonly pattern = /^[a-z\d]{0,6}\.[a-z\d]{0,6}$/i;
    static Zug = class Zug implements Zug {
        static validate (zug: Zug, player: Player) {
            let deltaX = Math.abs(zug.to.x - zug.from.x),
                deltaY = (zug.to.y - zug.from.y) * ((player.o) ? -1 : 1);

            // 1 Schritt
            if (deltaX === 0 && deltaY === 1 && zug.to.fig === null) {
                console.log("Zug: Ein Schritt.");
                return true;
            }
            // 2 Schritt
            else if (
                deltaX === 0 && deltaY === 2 &&
                zug.to.fig === null && 
                Brett.feld((zug.to.dez + zug.from.dez) / 2).fig === null
            ) {
                if (
                    (player.x && zug.from.dez < 6) ||
                    (player.o && zug.from.dez > 29)
                ) {
                    console.log("Zug: Zwei Schritt.");
                    return true
                } else {
                    console.log("Zug: Zwei Schritt – Ungültig weil nicht in Initialstellung.")
                }
            }
            // Schlag
            else if (
                deltaX === 1 && deltaY === 1 &&
                zug.to.fig === Player.toggle(player)
            ) {
                console.log("Zug: Schlag.");
                return true;
            }
            // Ungültig
            else {
                console.log("Zug ungültig.");
                return false;
            }
        }
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