/**
 * CORE-SKILLS FÜR HEXAGRAR
 * 
 * Alle zentralen Methoden rund um das Spiel.
 * 
 * AUF KEINEN FALL interfacebezogen oder mit DOM agieren!
 */

import type Togre from "./comp/Togre.svelte";

// Um zur Browser-Version zurückzukehren, einfach den "export" vor der namespace entfernen!

namespace H {
    export type Final = "X" | "O" | "R";
    export type Code = string;
    export type Numpos = [
        /**Dez-Felder mit X */
        number[],
        /**Dez-Felder mit O */
        number[]
    ];
    export interface Zug {
        from: number,
        to: number
    }
    export interface Feld {
        dez: number;
        x: number;
        y: number;
        chess_format: string;
        alnum: string;
    }
    export type FigCount = 0 | 1 | 2 | 3 | 4 | 5 | 6;
    export type MatCrit = (x: FigCount, o: FigCount) => number;

    export interface Option {
        from: number;
        to: number;
        ziel: H.Numpos;
    }

    export interface Konstellation {
        s: Numpos,
        p: Player
    }

    export const codePattern = /^[a-z\d]{0,36}\.[a-z\d]{0,36}$/i;
    export const startStellung = "012345.uvwxyz";

    export namespace convert {
        export function n (code: string): H.Numpos {
            if (code === "-") return [[0,1,2,3,4,5], [30,31,32,33,34,35]] as H.Numpos;
            return code.split(".").map(
                block => block.split("")
            ).map(
                alnumBlock => alnumBlock.map(
                    alnum => Number.parseInt(alnum, 36)
                )
            ) as H.Numpos;
        }
        export function c (stellung: H.Numpos): string {
            return stellung.map(b => b.map(d => d.toString(36)).join("")).join(".");
        }
        export function normalize (stellung: H.Numpos): H.Numpos {
            return [
                stellung[0].sort(),
                stellung[1].sort()
            ] as H.Numpos;
        }
    }

    /**Gibt das `Feld` auf diesem Brett zurück.
     * @param dez Dezimaler Index des Feldes
     */
    export function fconvert (dez: number): Feld;
     /**Gibt das `Feld` auf diesem Brett zurück.
      * @param x X-Koordinate
      * @param y Y-Koordinate
      */
    export function fconvert (x: number, y: number): Feld;
     /**Gibt das `Feld` auf diesem Brett zurück.
      * @param alnum Der alphanumerische Index des Feldes.
      */
    export function fconvert (alnum: string): Feld;
     /**Gibt das `Feld` auf diesem Brett zurück.
      * @param p1 Der dezimale oder alphanumerische Index bzw. die X-Koordinate des Feldes.
      * @param p2 Wenn gegeben, wird `p1` als X- und `p2` als Y-Koordinate behandelt.
      */
    export function fconvert (p1: number | string, p2?: number): Feld {
        const result = {
            x: 0,
            y: 0,
            dez: 0,
            alnum: "",
            chess_format: ""
        } as Feld;
        switch (typeof p1 + typeof p2) {
            //Koordinaten
            case "numbernumber": {
                if (Number.isNaN(p1) || Number.isNaN(p2) || ! Number.isInteger(p1) || ! Number.isInteger(p2) || p1 > 5 || p1 < 0 || p2! > 5 || p2! < 0) throw new Error("Invalid coordinates: " + p1 + "|" + p2);
                // valide Koords
                result.x = p1 as number; result.y = p2!;
                result.chess_format = ["A", "B", "C", "D", "E", "F"][result.x] + (result.y + 1);
                result.dez = (6 * p2!) + (p1 as number);
                result.alnum = result.dez.toString(36);
                return result;
            }
            // Dez oder Alnum
            case "numberundefined":
            case "stringundefined": {
                let dez = (typeof p1 === "number") ? p1 as number : Number.parseInt(p1 as string, 36);
                if (Number.isNaN(dez) || dez > 35 || dez < 0) throw new Error("Invalid field index.");
                else {
                    result.dez = dez;
                    result.alnum = dez.toString(36);
                    result.x = dez % 6;
                    result.y = (dez - result.x) / 6;
                    result.chess_format = ["A", "B", "C", "D", "E", "F"][result.x] + (result.y + 1);
                }
                return result;
            }
            default: throw new Error("Invalid format: " + typeof p1 + typeof p2);
        }
    }

    /** Ermittelt, ob in der gegebenen Stellung ein Player auf dem gegebenen Feld steht, und wenn ja, welcher.*/
    export function playerAufFeld (stellung: H.Numpos, feldindex: number): H.Player | null {
        if (stellung[0].includes(feldindex)) return H.Player.X;
        else if (stellung[1].includes(feldindex)) return H.Player.O;
        else return null;
    }

    /** Erzeugt eine neue `Numpos`, in der der `Player` `p` aus der `Numpos`-Stellung `stellung` von `from` nach `to` gezogen ist.
     * @param stellung Die `Numpos`-Stellung zu Beginn des Zuges.
     * @param from Das Feld, von dem die ziehende Figur aus startet. (Numerischer Index)
     * @param to Das Feld, wo hingezogen wird. (Numerischer Index)
     * @param p Der `Player`, der zieht.
     * @returns Die durch den Zug entstandene `Numpos`-Stellung.
     */
    export function numposZiehen (stellung: Numpos, from: number, to: number, p: Player): Numpos {
        if (! stellung[p.i].includes(from)) {
            console.log("stellung = ", stellung, `from = ${from} to = ${to} p = ${p.c}`);
            throw new Error(`numposZiehen(${convert.c(stellung)}, ${from}, ${to}, ${p.c})` + ": Der ziehende Spieler p steht nicht auf dem Startfeld.");
        }
        const neueStellung = stellung.map(b => b.filter(feldnummer => feldnummer !== from && feldnummer !== to)) as H.Numpos;
        neueStellung[p.i].push(to);
        return H.convert.normalize(neueStellung);
    }

    /**Welche Zielfelder sind von einem Feld aus erreichbar?
     * 
     * @param stellung Aktuelle `Numpos`-Stellung.
     * @param feldindex Numerischer Index des Startfeldes.
     * @param p Ziehender `Player`
     * @returns Liste mit Feldern (numerischer Index), die erreichbar sind.
    */
    export function zielfelder (stellung: Numpos, feldindex: number, p: Player): number[] {
        let zielfelder = [] as number[];

        // Steht der ziehende Spieler nicht auf dem Feld? DAS DARF NICHT SEIN!
        // FRAGE: Ist das dann ein Fehler, oder einfach `return []`?
        if (! stellung[p.i].includes(feldindex)) {
            console.debug(`stellung = `, stellung, ` feldindex = ${feldindex} p = ${p.c}`);
            throw new Error("zielfelder: Player " + p.c + " steht nicht auf dem Startfeld.");
            return []; //???
        };

        // letzte Reihe? Dann keine Möglichkeiten.
        if ((p.x && feldindex > 29) || (p.o && feldindex < 6)) return [];

        // 1 Schritt
        if (!(stellung[0].includes(feldindex + p.m * 6) || stellung[1].includes(feldindex + p.m * 6)))
            zielfelder.push(feldindex + p.m * 6);

        // 2 Schritt
        if (
            ((p.x && feldindex < 6) || (p.o && feldindex > 29)) &&                                               // init?
            (!(stellung[0].includes(feldindex + p.m * 12) || stellung[1].includes(feldindex + p.m * 12))) &&     // Ziel leer?
            (!(stellung[0].includes(feldindex + p.m * 6) || stellung[1].includes(feldindex + p.m * 6)))          // transit leer?
        ) zielfelder.push(feldindex + p.m * 12);

        // 5-Schlag (rechts)
        if (
            ((feldindex + ((p.m - 1) / -2)) % 6) &&                                                              // Rand?
            (stellung[p.t.i].includes(feldindex + p.m * 5))                                                      // Gegner steht dort?
        ) zielfelder.push(feldindex + p.m * 5);

        // 7-Schlag (links)
        if (
            ((feldindex + ((p.m + 1) / 2)) % 6) &&                                                               // Rand?
            (stellung[p.t.i].includes(feldindex + p.m * 7))                                                      // Gegner steht dort?
        ) zielfelder.push(feldindex + p.m * 7);

        return zielfelder;
    }

    /**Welche Stellungen sind von einem Feld aus erreichbar?
     * 
     * @param stellung Aktuelle `Numpos`-Stellung.
     * @param feldindex Numerischer Index des Startfeldes.
     * @param p Ziehender `Player`
     * @returns Liste mit `Numpos`-Stellungen, die erreichbar sind.
    */
    export function zieleVonFeld (stellung: Numpos, feldindex: number, p: Player): Numpos[] {
        return zielfelder(stellung, feldindex, p).map(ziel => numposZiehen(stellung, feldindex, ziel, p));
    }

    /** Welche Züge sind in der Startstellung für den Player möglich?
     * 
     * Gibt im Falle einer syntaktisch finalen Stellung den `Final`-Code zurück.
    */
    export function zuegeVonStellung (stellung: Numpos, p: Player): Zug[] | Final {
        let g = gewonnen(stellung, p);
        if (g) return g;

        return Array.prototype.concat.apply([], stellung[p.i].map(
            startfeld => zielfelder(stellung, startfeld, p).map(
                zielfeld => ({from: startfeld, to: zielfeld} as Zug)
            )
        )) as Zug[];
    }

    /** Welche Stellungen kann ein Player durch einen Zug erreichen?
     * 
     * @param stellung Aktuelle `Numpos`-Stellung.
     * @param p Ziehender `Player`
     * @returns Liste mit `Numpos`-Stellungen, die erreichbar sind, oder `Final`-Code.
     */
    export function zieleVonStellung (stellung: Numpos, p: Player): Numpos[] | Final {
        let g = gewonnen(stellung, p);
        if (g) return g;

        let r = Array.prototype.concat.apply([], stellung[p.i].map(
            startfeld => zieleVonFeld(stellung, startfeld, p)
        )) as Numpos[];

        if (r.length === 0) return "R";
        return r;
    }

    /** Ermittelt die Zugoptionen, die der Klient `p` in der Stelllung `s` hat.
     *
     * Gibt im Falle einer syntaktisch finalen Stellung den `Final`-Code zurück.
     * 
     * @param s Die Startstellung.
     * @param p Der ziehende Spieler (Klient).
     * @returns Eine Liste möglicher Optionen.
     */
    export function getOptions (s: H.Numpos, p: H.Player): Option[] | Final {
        const z = H.zuegeVonStellung(s, p);
        if (typeof z === "string") return z;
        const res = z.map(
            zug => ({ from: zug.from, to: zug.to, ziel: H.numposZiehen(s, zug.from, zug.to, p) })
        );
        return res.length ? res : "R";
    }
    /** Ermittelt die Zugoptionen, die der Klient `p` in der Stellung `s` hat.
     * 
     * Gibt im Falle einer syntaktisch ***oder logisch finalen*** Stellung den
     * `Final`-Code zurück.
     * 
     * Logisch final bedeutet, mit der Stellung ist das Spiel noch nicht beendet
     * (man kann also noch ziehen), die Stellung ist aber entweder kriterial
     * nachweisbar TOGRE-positiv für `p`, oder aber der Gegner kann den Sieg nur
     * noch durch offensichtliche Fehler verlieren. Letzterer Fall gilt als
     * Empfehlung an alle Automaten, aufzugeben.
     * 
     * @param s Die Startstellung.
     * @param p Der ziehende Spieler (Klient).
     * @returns Eine sortierte Liste möglicher und sinnvoller Optionen.
     */
    export function getOptions_logfin(s: H.Numpos, p: H.Player): Option[] | Final {
        let o = getOptions(s, p);

        // Syntaktische Finalität
        if (typeof o === "string") {
            return o;
        };

        // Logische Finalität
        const l = logFin(s, p);
        if (l) {
            return l;
        }
        return o;
    }
    /** Ermittelt die Zugoptionen, die der Klient `p` in der Stellung `s` hat,
     * und sortiert diese gemäß der Wahrscheinlichkeit, dass sie sich als
     * TOGRE-positiv oder andersweitig günstig für den Klienten erweisen.
     * 
     * Gibt im Falle einer syntaktisch ***oder logisch finalen*** Stellung den
     * `Final`-Code zurück.
     * 
     * Logisch final bedeutet, mit der Stellung ist das Spiel noch nicht beendet
     * (man kann also noch ziehen), die Stellung ist aber entweder kriterial
     * nachweisbar TOGRE-positiv für `p`, oder aber der Gegner kann den Sieg nur
     * noch durch offensichtliche Fehler verlieren. Letzterer Fall gilt als
     * Empfehlung an alle Automaten, aufzugeben.
     * 
     * @param s Die Startstellung.
     * @param p Der ziehende Spieler (Klient).
     * @param includeAll Wenn auf `false` gesetzt (default), werde Optionen, die
     * garantiert TOGRE-negativ sind, gar nicht in der zurückgegebenen Optionsliste
     * aufgeführt. Wenn auf `true` gesetzt, werden diese hinten an die Liste angehängt.
     * @returns Eine sortierte Liste möglicher und sinnvoller Optionen.
     */
    export function getOptions_preffin (s: H.Numpos, p: H.Player): Option[] | Final {
        let o = getOptions(s, p);

        // Syntaktische Finalität
        if (typeof o === "string") {
            return o;
        };

        // Logische Finalität
        // const l = logFin(s, p);
        // if (l) {
        //     return l;
        // }

        // QUATSCH: Das sieht man doch dann schon in der ersten TOGRE-Rekursion. Das frisst nur Performance.
        // Wenn es logisch final positive Optionen gibt, ist auch diese Stellung positiv.
        // Ist doch besser, von wegen prefFin
        if (o.filter(option => logFin(option.ziel, p.t) === p.c || gewonnen(option.ziel, p.t) === p.c).length) {
            return p.c;
        };
        
        return o;
        // Die Performance leidet eher unter dieser Sortierung, zumindest in solchen Stellungen, die nicht extra dafür konstruiert, die Features von getSortedOptions zu testen. Daher eine Abkürzung, um den obenstehenden Code isoliert zu betrachten:
        // Schade, das mit der Sortierung war eine gute Idee, aber es scheint so gar nichts zu bringen. Die Berechnung mit der untenstehenden Sortierung dauerte mehr als 10x so lang wie mit der alten Version, ohne Sortierung und sogar ohne logFin…

        // o.forEach(option => {
        //     ((logFin(option.ziel, p.t) === p.t.c) ? terrible : o2).push(option);
        // });
        // o = o2; o2 = [];

        // // Jetzt kommen sehr primitive Sortierkriterien. Das muss man vielleicht nochmal überdenken…

        // // Ich habe einen größeren maxFortschritt
        // o.forEach(option => {
        //     (((maxFortschritt(option.ziel, p) > maxFortschritt(option.ziel, p.t))) ? sorted : o2).push(option)
        // });
        // o = o2; o2 = [];
        // // Ich habe fortschrittlichere Freibauern
        // o.forEach(option => {
        //     ((Math.max.apply(Math, freibauern(option.ziel, p).map(f => f.fortschritt)) > Math.max.apply(Math, freibauern(option.ziel, p.t).map(f => f.fortschritt))) ? sorted : o2).push(option);
        // });
        // o = o2; o2 = [];
        // // Der Rest wird nach Summe der Fortschritte der Freibauern geordnet.
        // sorted = sorted.concat(o.sort((a, b) =>
        //     freibauern(a.ziel, p).map(f => f.fortschritt).reduce(((p, c) => (p + c)), 0) - freibauern(b.ziel, p).map(f => f.fortschritt).reduce(((p, c) => (p + c)), 0)
        // ));
        // return sorted.concat(includeAll ? terrible : []);
    }
    
    /** Ermittelt, ob die gegebene Stellung nicht-neutral syntaktisch final ist, also gewonnen für einen Player. */
    export function gewonnen (stellung: Numpos, p: Player): Final | null {
        let xe = typeof winnerFigs(stellung, Player.X) === "number",
            oe = typeof winnerFigs(stellung, Player.O) === "number";
        if (xe && oe) {
            console.error("In der Stellung " + H.convert.c(stellung) + " haben beide Player das Ziel erreicht. Dies sollte eigentlich nicht eintreten. Bitte überprüfe, ob beim Aufruf von H.zieleVonStellung ein Programmfehler vorliegt. Um die Funktionalität des Programmes zu wahren, wird dies jedoch ignoriert; als Finalcode wird X angegeben.");
            return "X";
        }
        if (xe) return "X";
        if (oe) return "O";
        return null;
    }

    /** Ermittelt, ob die Stellung `s` mit `p` am Zug syntaktisch oder logisch final ist. */
    export function logFin (s: Numpos, p: Player): Final | null {
        // const g = gewonnen(s, p); if (g) return g;
        if (Math.max.apply(Math, freibauern(s, p).map(f => f.fortschritt)) >= maxFortschritt(s, p.t)) return p.c;
        if (Math.max.apply(Math, freibauern(s, p.t).map(f => f.fortschritt)) > maxFortschritt(s, p)) return p.t.c;
        else return null;
    }

    /** Gibt, wenn der gegebene `Player` in der gegebenen `Stellung` gewonnen hat, dessen Gewinnfigur zurück. (Sonst `null`) */
    export function winnerFigs (stellung: Numpos, p: Player): number | null {
        const best = Math[p.x ? "max" : "min"].apply(Math, stellung[p.i]);
        return ((p.x && best > 29) || (p.o && best < 6)) ? best : null;
    }

    /**Spiegelt die gegebene `Nunpos`-Stellung an der X-Achse (links-rechts).
     * @param stellung Die `Numpos`-Stellung.
     * @returns Das X-Spiegelbild von `stellung`.
     */
    export function mirror (stellung: H.Numpos): H.Numpos {
        return [
            stellung[0].map(f => f - (f % 6) + (5 - (f % 6))).sort(),
            stellung[1].map(f => f - (f % 6) + (5 - (f % 6))).sort()
        ];
    }

    export class Player {
        static X = new Player(true);
        static O = new Player(false);

        static toggle(player: Player): Player {
            return player.t;
        }

        constructor(x: boolean) {
            this.o = !(this.x = x);
            this.c = (x) ? "X" : "O";
            this.i = x ? 0 : 1;
            this.m = x ? 1 : -1;
        }

        readonly x: boolean;
        readonly o: boolean;
        readonly i: 0 | 1;
        readonly m: 1 | -1;
        readonly c: "X" | "O";

        get t(): Player {
            return this.x ? Player.O : Player.X;
        }

        /**Errechnet die für den `Player` möglichen Züge in der Stellung `s`.
         * @param s Die Stellung, in der gezogen wird.
         */
        zuege (s: Numpos): Zug[] {
            return Array.prototype.concat.apply([], s[this.i].map(
                startfeld => zielfelder(s, startfeld, this).map(zielfeld => ({from: startfeld, to: zielfeld}))
            ));
        }


    }

    export function testMatCrit (crit: MatCrit): number[][] {
        const table: number[][] = [];
        let x: FigCount = 0, o: FigCount = 0;
        for (x; x < 7; x++) {
            const entry: number[] = [];
            for (o; o < 7; o++) {
                entry[o] = crit(<FigCount>x , <FigCount>o); // WARUM hier Assertion? (notwendig, aber unlogisch)
            }
            table.push(entry);
        }
        return table;
    }

    /** Gibt den Fortschritt eines Feldes aus Perspektive eines Spielers an.
     * 
     * Der Fortschritt der ersten beiden Reihen ist mit 0 identisch, die
     * dritte Reihe hat den Fortschritt 1, die vierte 2, die fünfte 3 und
     * die sechste 4.
     */
    export function fortschritt (feld: number, p: Player): number {
        const roh = (2.5 - 2.5 * p.m) + fconvert(feld).y * p.m;
        return Math.abs(roh - 0.5) - 0.5;
    }

    /** Gibt den Fortschritt der fortschrittlichsten Figur eines Spielers in einer Stellung zurück. */
    export function maxFortschritt (s: Numpos, p: Player): number {
        return Math.max.apply(Math, s[p.i].map(f => fortschritt(f, p)));
    }

    /** Prüft, ob ein Feld für den gegebenen Player grün ist, und gibt,
     * wenn ja, dessen Fortschritt, sonst `null` zurück.
     * 
     * Grün ist ein Feld, wenn die Felder davor unbesetzt und die Felder
     * vor den Nachbarn von feindlichen Figuren unbesetzt sind. */
    export function gruen(stellung: Numpos, feld: number, p: Player): null | number {
        const f = fconvert(feld);
        for (let y = f.y + p.m; (y < 6 && y > -1); y += p.m) {
            const davor = fconvert(f.x, y);
            if (stellung[p.i].includes(davor.dez) || stellung[p.t.i].includes(davor.dez)) return null;
            if (f.x !== 0 && stellung[p.t.i].includes(fconvert(f.x - 1, y).dez)) return null;
            if (f.x !== 5 && stellung[p.t.i].includes(fconvert(f.x + 1, y).dez)) return null;
        }
        return fortschritt(feld, p);
    }
    /** Filtert alle grünen Felder in der Stellung heraus, und gibt diese mit ihrem Fortschritt zurück.
     * @param stellung Die Stellung.
     * @param p Der Player, für den die grünen Felder errechnet werden.
     * @returns Eine Array mit Objekten, jedes mit dem Feldindex eines
     *          grünen Feldes unter `feld` und dessen Fortschritt
     *          unter `fortschritt`.
     */
    export function grueneFelder (stellung: Numpos, p: Player): {feld: number, fortschritt: number}[] {
        const gruene: {feld: number, fortschritt: number}[] = [];
        for (let feld = 0; feld < 36; feld ++) {
            const r = gruen(stellung, feld, p);
            if (typeof r === "number") gruene.push({
                feld: feld,
                fortschritt: r
            });
        }
        return gruene;
    }

    /** Gibt eine Liste aller Freibauern eines Spielers, mit ihren Fortschritten zurück.
     * 
     * @returns Zum Typ, siehe `grueneFelder`.
     */
    export function freibauern (s: Numpos, p: Player): {feld: number, fortschritt: number}[] {
        return grueneFelder(s, p).filter(g => s[p.i].includes(g.feld));
    }

    export function deckung (stellung: Numpos, feld: number): [number, number] {
        const f = fconvert(feld),
            r = [0, 0] as [number, number];
        if (f.x !== 0 && f.y !== 0 && stellung[0].includes(fconvert(f.x - 1, f.y - 1).dez)) r[0]++;
        if (f.x !== 0 && f.y !== 5 && stellung[1].includes(fconvert(f.x - 1, f.y + 1).dez)) r[1]++;
        if (f.x !== 5 && f.y !== 0 && stellung[0].includes(fconvert(f.x + 1, f.y - 1).dez)) r[0]++;
        if (f.x !== 5 && f.y !== 5 && stellung[1].includes(fconvert(f.x + 1, f.y + 1).dez)) r[1]++;
        return r;
    }

    /** Gibt die Komplexität einer Stellung an. Diese entspricht der Anzahl der Figuren, die den Fortschritt 0 haben. */
    export function complex (s: Numpos): number {
        // Komplexität eier Stellung entspricht der Anzahl der Figuren, die im eigenen Heimbereich stehen.
        // Heimbereich = die ersten zwei Reihen
        
        // -> Ein Zug kann Komplexität einer Stellung um 0 oder 1 verringern.

        return s[0].filter(fig => ! fortschritt(fig, Player.X)).length + s[1].filter(fig => ! fortschritt(fig, Player.O)).length;
    }

    // Dann fehlt noch:
        // T.SymDB
        // Symmetrie-Kürzungen im Halbkreisgenerator
        // TOGRE-Berechnung des Halbkreises
        // T.DB.import()-Methode
        // TOGRE-Automat (Shell)
    
}

export default H;